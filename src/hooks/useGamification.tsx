import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_value: number;
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_days: number;
  target_count: number;
  xp_reward: number;
  is_active: boolean;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  started_at: string;
  completed_at: string | null;
  progress: number;
  is_completed: boolean;
  challenge: Challenge;
}

interface UserStreak {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  total_checkins: number;
  total_xp: number;
}

export function useGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGamificationData();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [badgesRes, userBadgesRes, challengesRes, userChallengesRes, streakRes] = await Promise.all([
        supabase.from('badges').select('*'),
        supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user.id),
        supabase.from('challenges').select('*').eq('is_active', true),
        supabase.from('user_challenges').select('*, challenge:challenges(*)').eq('user_id', user.id),
        supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      if (badgesRes.data) setBadges(badgesRes.data);
      if (userBadgesRes.data) setUserBadges(userBadgesRes.data as unknown as UserBadge[]);
      if (challengesRes.data) setChallenges(challengesRes.data);
      if (userChallengesRes.data) setUserChallenges(userChallengesRes.data as unknown as UserChallenge[]);
      if (streakRes.data) setStreak(streakRes.data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    const { error } = await supabase.from('user_challenges').insert({
      user_id: user.id,
      challenge_id: challengeId,
      progress: 0
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to join challenge', variant: 'destructive' });
      return;
    }

    toast({ title: 'Challenge Joined!', description: 'Good luck on your journey!' });
    fetchGamificationData();
  };

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    if (streak) {
      const lastDate = streak.last_checkin_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = streak.current_streak;
      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, streak.longest_streak);

      await supabase.from('user_streaks').update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_checkin_date: today,
        total_checkins: streak.total_checkins + 1,
        total_xp: streak.total_xp + 10,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);

      // Check for streak badges
      await checkAndAwardBadges(newStreak, streak.total_checkins + 1);
    } else {
      await supabase.from('user_streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_checkin_date: today,
        total_checkins: 1,
        total_xp: 10
      });

      await checkAndAwardBadges(1, 1);
    }

    fetchGamificationData();
  };

  const checkAndAwardBadges = async (currentStreak: number, totalCheckins: number) => {
    if (!user) return;

    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

    for (const badge of badges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let earned = false;
      if (badge.requirement_type === 'streak' && currentStreak >= badge.requirement_value) {
        earned = true;
      } else if (badge.requirement_type === 'checkins' && totalCheckins >= badge.requirement_value) {
        earned = true;
      }

      if (earned) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badge.id
        });

        // Add XP for badge
        if (streak) {
          await supabase.from('user_streaks').update({
            total_xp: streak.total_xp + badge.xp_value
          }).eq('user_id', user.id);
        }

        toast({
          title: '🏆 Badge Earned!',
          description: `You earned "${badge.name}"!`
        });
      }
    }
  };

  const updateChallengeProgress = async (challengeId: string, increment: number = 1) => {
    if (!user) return;

    const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId);
    if (!userChallenge || userChallenge.is_completed) return;

    const newProgress = userChallenge.progress + increment;
    const isCompleted = newProgress >= userChallenge.challenge.target_count;

    await supabase.from('user_challenges').update({
      progress: newProgress,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    }).eq('id', userChallenge.id);

    if (isCompleted) {
      // Award XP
      if (streak) {
        await supabase.from('user_streaks').update({
          total_xp: streak.total_xp + userChallenge.challenge.xp_reward
        }).eq('user_id', user.id);
      }

      toast({
        title: '🎉 Challenge Completed!',
        description: `You completed "${userChallenge.challenge.title}" and earned ${userChallenge.challenge.xp_reward} XP!`
      });

      // Check for challenge badges
      const completedChallenges = userChallenges.filter(uc => uc.is_completed).length + 1;
      for (const badge of badges) {
        if (badge.requirement_type === 'challenges' && completedChallenges >= badge.requirement_value) {
          const alreadyEarned = userBadges.some(ub => ub.badge_id === badge.id);
          if (!alreadyEarned) {
            await supabase.from('user_badges').insert({
              user_id: user.id,
              badge_id: badge.id
            });
            toast({
              title: '🏆 Badge Earned!',
              description: `You earned "${badge.name}"!`
            });
          }
        }
      }
    }

    fetchGamificationData();
  };

  return {
    badges,
    userBadges,
    challenges,
    userChallenges,
    streak,
    loading,
    joinChallenge,
    updateStreak,
    updateChallengeProgress,
    refetch: fetchGamificationData
  };
}
