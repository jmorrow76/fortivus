import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FastingLog {
  id: string;
  user_id: string;
  fasting_type: string;
  started_at: string;
  ended_at: string | null;
  target_duration_hours: number | null;
  actual_duration_minutes: number | null;
  prayer_intentions: string | null;
  scripture_focus: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
}

export interface FastingGoals {
  id: string;
  user_id: string;
  weekly_fasts_goal: number;
  preferred_fast_type: string;
  current_streak: number;
  longest_streak: number;
  total_fasts_completed: number;
  total_hours_fasted: number;
  last_fast_date: string | null;
}

export const FASTING_TYPES = [
  {
    id: 'sunrise_sunset',
    name: 'Sunrise to Sunset',
    description: 'Traditional fast from dawn to dusk',
    defaultHours: 12,
    scripture: 'Judges 20:26',
    workoutIntensity: 0.6,
  },
  {
    id: 'daniel_fast',
    name: 'Daniel Fast',
    description: 'Vegetables, fruits, and water only',
    defaultHours: 24,
    scripture: 'Daniel 10:3',
    workoutIntensity: 0.8,
  },
  {
    id: 'water_fast',
    name: 'Water Fast',
    description: 'Water only, no food',
    defaultHours: 24,
    scripture: 'Matthew 4:2',
    workoutIntensity: 0.4,
  },
  {
    id: 'partial_fast',
    name: 'Partial Fast',
    description: 'Skipping one or two meals',
    defaultHours: 8,
    scripture: 'Daniel 1:12',
    workoutIntensity: 0.75,
  },
  {
    id: 'esther_fast',
    name: 'Esther Fast',
    description: 'No food or water for 3 days',
    defaultHours: 72,
    scripture: 'Esther 4:16',
    workoutIntensity: 0.2,
  },
] as const;

export const FASTING_SCRIPTURES = [
  { verse: 'Matthew 6:16-18', text: 'When you fast, do not look somber as the hypocrites do...' },
  { verse: 'Isaiah 58:6', text: 'Is not this the kind of fasting I have chosen: to loose the chains of injustice...' },
  { verse: 'Joel 2:12', text: 'Return to me with all your heart, with fasting and weeping and mourning.' },
  { verse: 'Acts 13:2-3', text: 'While they were worshiping the Lord and fasting...' },
  { verse: 'Matthew 17:21', text: 'This kind does not go out except by prayer and fasting.' },
  { verse: 'Psalm 35:13', text: 'I humbled myself with fasting...' },
  { verse: 'Ezra 8:23', text: 'So we fasted and petitioned our God about this, and he answered our prayer.' },
];

export const useFasting = () => {
  const { user } = useAuth();
  const [activeFast, setActiveFast] = useState<FastingLog | null>(null);
  const [fastingHistory, setFastingHistory] = useState<FastingLog[]>([]);
  const [goals, setGoals] = useState<FastingGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  const fetchFastingData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch active fast
      const { data: activeData } = await supabase
        .from('fasting_logs')
        .select('*')
        .eq('user_id', user.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (activeData) {
        setActiveFast(activeData as FastingLog);
      } else {
        setActiveFast(null);
      }

      // Fetch history
      const { data: historyData } = await supabase
        .from('fasting_logs')
        .select('*')
        .eq('user_id', user.id)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(20);

      setFastingHistory((historyData || []) as FastingLog[]);

      // Fetch goals
      const { data: goalsData } = await supabase
        .from('fasting_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (goalsData) {
        setGoals(goalsData as FastingGoals);
      }
    } catch (error) {
      console.error('Error fetching fasting data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFastingData();
  }, [fetchFastingData]);

  // Update elapsed time for active fast
  useEffect(() => {
    if (!activeFast) {
      setElapsedTime(0);
      return;
    }

    const updateElapsed = () => {
      const start = new Date(activeFast.started_at).getTime();
      const now = Date.now();
      setElapsedTime(Math.floor((now - start) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeFast]);

  const startFast = async (
    fastingType: string,
    targetHours: number,
    prayerIntentions?: string,
    scriptureFocus?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('fasting_logs')
        .insert({
          user_id: user.id,
          fasting_type: fastingType,
          target_duration_hours: targetHours,
          prayer_intentions: prayerIntentions,
          scripture_focus: scriptureFocus,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveFast(data as FastingLog);
      toast.success('Fast started. May God bless your sacrifice.');
    } catch (error) {
      console.error('Error starting fast:', error);
      toast.error('Failed to start fast');
    }
  };

  const endFast = async (notes?: string) => {
    if (!user || !activeFast) return;

    try {
      const endTime = new Date();
      const startTime = new Date(activeFast.started_at);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
      const targetMinutes = (activeFast.target_duration_hours || 0) * 60;
      const completed = durationMinutes >= targetMinutes * 0.9; // 90% threshold

      const { error } = await supabase
        .from('fasting_logs')
        .update({
          ended_at: endTime.toISOString(),
          actual_duration_minutes: durationMinutes,
          completed,
          notes,
        })
        .eq('id', activeFast.id);

      if (error) throw error;

      // Update goals
      await updateGoals(durationMinutes, completed);

      setActiveFast(null);
      fetchFastingData();

      if (completed) {
        toast.success('Fast completed! Well done, faithful servant.');
      } else {
        toast.info('Fast ended. Every sacrifice to the Lord is meaningful.');
      }
    } catch (error) {
      console.error('Error ending fast:', error);
      toast.error('Failed to end fast');
    }
  };

  const updateGoals = async (durationMinutes: number, completed: boolean) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const hoursCompleted = Math.floor(durationMinutes / 60);

      if (goals) {
        const lastFastDate = goals.last_fast_date;
        const isConsecutiveDay = lastFastDate && 
          new Date(today).getTime() - new Date(lastFastDate).getTime() <= 86400000 * 2; // Within 2 days

        const newStreak = completed ? (isConsecutiveDay ? goals.current_streak + 1 : 1) : 0;
        const newLongest = Math.max(goals.longest_streak, newStreak);

        await supabase
          .from('fasting_goals')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            total_fasts_completed: goals.total_fasts_completed + (completed ? 1 : 0),
            total_hours_fasted: goals.total_hours_fasted + hoursCompleted,
            last_fast_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq('id', goals.id);
      } else {
        await supabase
          .from('fasting_goals')
          .insert({
            user_id: user.id,
            current_streak: completed ? 1 : 0,
            longest_streak: completed ? 1 : 0,
            total_fasts_completed: completed ? 1 : 0,
            total_hours_fasted: hoursCompleted,
            last_fast_date: today,
          });
      }
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  };

  const getWorkoutRecommendation = () => {
    if (!activeFast) {
      return { intensity: 1.0, message: 'Normal workout intensity recommended.' };
    }

    const fastType = FASTING_TYPES.find(t => t.id === activeFast.fasting_type);
    const intensity = fastType?.workoutIntensity || 0.5;
    const hoursIn = Math.floor(elapsedTime / 3600);

    let message = '';
    if (intensity <= 0.3) {
      message = 'Light stretching or rest recommended during this fast.';
    } else if (intensity <= 0.5) {
      message = 'Light activity only: walking, gentle yoga, or stretching.';
    } else if (intensity <= 0.7) {
      message = 'Moderate intensity: reduce weights by 30-40%, shorter sessions.';
    } else {
      message = 'Near-normal training okay, but listen to your body.';
    }

    if (hoursIn > 16) {
      message += ' Extended fast detected - prioritize rest.';
    }

    return { intensity, message, hoursIn };
  };

  const getNutritionGuidance = () => {
    if (!activeFast) {
      return null;
    }

    const fastType = FASTING_TYPES.find(t => t.id === activeFast.fasting_type);
    const hoursIn = Math.floor(elapsedTime / 3600);

    const guidance = {
      duringFast: [] as string[],
      breakingFast: [] as string[],
    };

    switch (activeFast.fasting_type) {
      case 'water_fast':
        guidance.duringFast = [
          'Stay well hydrated with water',
          'Add electrolytes if fasting 16+ hours',
          'Rest when feeling weak',
        ];
        guidance.breakingFast = [
          'Start with bone broth or light soup',
          'Wait 30 minutes before eating solid food',
          'Begin with easily digestible foods',
        ];
        break;
      case 'daniel_fast':
        guidance.duringFast = [
          'Eat vegetables, fruits, whole grains',
          'Drink water and natural juices',
          'Avoid meat, dairy, sweeteners, processed foods',
        ];
        guidance.breakingFast = [
          'Gradually reintroduce other foods',
          'Start with lean proteins',
          'Continue high vegetable intake',
        ];
        break;
      case 'sunrise_sunset':
        guidance.duringFast = [
          'No food or drink during daylight hours',
          'Use time for prayer and reflection',
          'Plan your evening meal',
        ];
        guidance.breakingFast = [
          'Break fast with dates and water (traditional)',
          'Follow with a balanced meal',
          'Avoid overeating',
        ];
        break;
      default:
        guidance.duringFast = [
          'Stay hydrated if water is permitted',
          'Focus on prayer and spiritual reflection',
          'Rest when needed',
        ];
        guidance.breakingFast = [
          'Start with light, easily digestible foods',
          'Eat slowly and mindfully',
          'Thank God for His provision',
        ];
    }

    return { ...guidance, hoursIn, fastType: fastType?.name };
  };

  return {
    activeFast,
    fastingHistory,
    goals,
    loading,
    elapsedTime,
    startFast,
    endFast,
    getWorkoutRecommendation,
    getNutritionGuidance,
    refetch: fetchFastingData,
  };
};

export default useFasting;
