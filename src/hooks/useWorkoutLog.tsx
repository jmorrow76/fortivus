import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Badge {
  id: string;
  name: string;
  requirement_type: string;
  requirement_value: number;
  xp_value: number;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_type: string;
  duration_minutes: number;
  notes: string | null;
  xp_earned: number;
  created_at: string;
}

const WORKOUT_TYPES = [
  { value: 'strength', label: 'Strength Training', xp: 30 },
  { value: 'cardio', label: 'Cardio', xp: 25 },
  { value: 'hiit', label: 'HIIT', xp: 35 },
  { value: 'flexibility', label: 'Flexibility/Yoga', xp: 20 },
  { value: 'sports', label: 'Sports', xp: 25 },
  { value: 'other', label: 'Other', xp: 15 },
];

export function useWorkoutLog() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const checkWorkoutBadges = useCallback(async (totalWorkouts: number, totalMinutes: number) => {
    if (!user) return;

    // Fetch workout-related badges
    const { data: badges } = await supabase
      .from('badges')
      .select('*')
      .in('requirement_type', ['workouts', 'workout_minutes']);

    if (!badges) return;

    // Fetch user's earned badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', user.id);

    const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];

    for (const badge of badges as Badge[]) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let earned = false;
      if (badge.requirement_type === 'workouts' && totalWorkouts >= badge.requirement_value) {
        earned = true;
      } else if (badge.requirement_type === 'workout_minutes' && totalMinutes >= badge.requirement_value) {
        earned = true;
      }

      if (earned) {
        // Award badge
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badge.id
        });

        // Add XP to user streaks
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('total_xp')
          .eq('user_id', user.id)
          .maybeSingle();

        if (streakData) {
          await supabase
            .from('user_streaks')
            .update({ total_xp: (streakData.total_xp || 0) + badge.xp_value })
            .eq('user_id', user.id);
        }

        // Post to activity feed
        await supabase.from('activity_feed').insert({
          user_id: user.id,
          activity_type: 'badge_earned',
          badge_id: badge.id,
          xp_earned: badge.xp_value
        });

        toast.success(`🏆 Badge Earned: ${badge.name}! +${badge.xp_value} XP`);
      }
    }
  }, [user]);

  const fetchWorkouts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching workouts:', error);
    } else {
      setWorkouts(data || []);
    }
    setLoading(false);
  };

  const logWorkout = async (workoutType: string, durationMinutes: number, notes?: string) => {
    if (!user) return;

    const workoutConfig = WORKOUT_TYPES.find(w => w.value === workoutType);
    const baseXp = workoutConfig?.xp || 15;
    const durationBonus = Math.floor(durationMinutes / 15) * 5;
    const xpEarned = baseXp + durationBonus;

    const { data: workout, error } = await supabase
      .from('workout_logs')
      .insert({
        user_id: user.id,
        workout_type: workoutType,
        duration_minutes: durationMinutes,
        notes: notes || null,
        xp_earned: xpEarned,
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
      return null;
    }

    // Update user XP in streaks table
    await supabase
      .from('user_streaks')
      .update({ 
        total_xp: supabase.rpc ? undefined : undefined // Will handle via raw update
      })
      .eq('user_id', user.id);

    // Increment XP manually
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('total_xp')
      .eq('user_id', user.id)
      .maybeSingle();

    if (streakData) {
      await supabase
        .from('user_streaks')
        .update({ total_xp: (streakData.total_xp || 0) + xpEarned })
        .eq('user_id', user.id);
    }

    // Update challenge progress for workout-related challenges
    await updateChallengeProgress(workoutType);

    // Post to activity feed
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      activity_type: 'workout_logged',
      xp_earned: xpEarned,
    });

    toast.success(`Workout logged! +${xpEarned} XP`);
    
    // Fetch updated workouts and check for badges
    const { data: allWorkouts } = await supabase
      .from('workout_logs')
      .select('duration_minutes')
      .eq('user_id', user.id);

    if (allWorkouts) {
      const totalWorkouts = allWorkouts.length;
      const totalMinutes = allWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0);
      await checkWorkoutBadges(totalWorkouts, totalMinutes);
    }

    fetchWorkouts();
    return workout;
  };

  const updateChallengeProgress = async (workoutType: string) => {
    if (!user) return;

    // Get user's active challenges
    const { data: userChallenges } = await supabase
      .from('user_challenges')
      .select('*, challenge:challenges(*)')
      .eq('user_id', user.id)
      .eq('is_completed', false);

    if (!userChallenges) return;

    for (const uc of userChallenges) {
      const challenge = uc.challenge as any;
      if (!challenge) continue;

      // Check if challenge category matches workout type or is general
      const shouldProgress = 
        challenge.category === 'workout' ||
        challenge.category === 'general' ||
        challenge.category === workoutType;

      if (shouldProgress) {
        const newProgress = Math.min(uc.progress + 1, challenge.target_count);
        const isCompleted = newProgress >= challenge.target_count;

        await supabase
          .from('user_challenges')
          .update({
            progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', uc.id);

        if (isCompleted) {
          // Award challenge XP
          const { data: streakData } = await supabase
            .from('user_streaks')
            .select('total_xp')
            .eq('user_id', user.id)
            .maybeSingle();

          if (streakData) {
            await supabase
              .from('user_streaks')
              .update({ total_xp: (streakData.total_xp || 0) + challenge.xp_reward })
              .eq('user_id', user.id);
          }

          toast.success(`Challenge completed: ${challenge.title}! +${challenge.xp_reward} XP`);
        }
      }
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', workoutId);

    if (error) {
      toast.error('Failed to delete workout');
    } else {
      toast.success('Workout deleted');
      fetchWorkouts();
    }
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyWorkouts = workouts.filter(
      w => new Date(w.created_at) >= oneWeekAgo
    );

    return {
      totalWorkouts: weeklyWorkouts.length,
      totalMinutes: weeklyWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0),
      totalXp: weeklyWorkouts.reduce((sum, w) => sum + w.xp_earned, 0),
    };
  };

  return {
    workouts,
    loading,
    logWorkout,
    deleteWorkout,
    getWeeklyStats,
    WORKOUT_TYPES,
    refetch: fetchWorkouts,
  };
}
