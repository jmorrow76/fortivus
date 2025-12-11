import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const streakKeys = {
  all: ['streaks'] as const,
  detail: (userId: string) => [...streakKeys.all, userId] as const,
  leaderboard: () => [...streakKeys.all, 'leaderboard'] as const,
};

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  total_checkins: number;
  total_xp: number;
  show_on_leaderboard: boolean;
}

export function useStreakQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: streakKeys.detail(user?.id ?? ''),
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserStreak | null;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useLeaderboardQuery(limit = 10) {
  return useQuery({
    queryKey: [...streakKeys.leaderboard(), limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateStreakMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];
      
      // Get current streak
      const { data: currentStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (currentStreak) {
        const lastDate = currentStreak.last_checkin_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = currentStreak.current_streak;
        if (lastDate === yesterdayStr) {
          newStreak += 1;
        } else if (lastDate !== today) {
          newStreak = 1;
        }

        const longestStreak = Math.max(newStreak, currentStreak.longest_streak);

        const { data, error } = await supabase
          .from('user_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_checkin_date: today,
            total_checkins: currentStreak.total_checkins + 1,
            total_xp: currentStreak.total_xp + 10,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return { streak: data, isNew: false, newStreak };
      } else {
        const { data, error } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_checkin_date: today,
            total_checkins: 1,
            total_xp: 10,
          })
          .select()
          .single();

        if (error) throw error;
        return { streak: data, isNew: true, newStreak: 1 };
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: streakKeys.detail(user.id) });
        queryClient.invalidateQueries({ queryKey: streakKeys.leaderboard() });
      }
    },
  });
}
