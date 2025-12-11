import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const challengeKeys = {
  all: ['challenges'] as const,
  list: () => [...challengeKeys.all, 'list'] as const,
  user: (userId: string) => [...challengeKeys.all, 'user', userId] as const,
};

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_days: number;
  target_count: number;
  xp_reward: number;
  is_active: boolean;
  reset_type?: string;
}

export interface UserChallenge {
  id: string;
  challenge_id: string;
  started_at: string;
  completed_at: string | null;
  progress: number;
  is_completed: boolean;
  reset_week: string | null;
  challenge: Challenge;
}

export function useChallengesQuery() {
  return useQuery({
    queryKey: challengeKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return (data ?? []) as Challenge[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserChallengesQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: challengeKeys.user(user?.id ?? ''),
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*, challenge:challenges(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data ?? []) as unknown as UserChallenge[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useJoinChallengeMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Get current week key for weekly challenges
      const now = new Date();
      const year = now.getFullYear();
      const weekNumber = Math.ceil(
        ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7
      );
      const currentWeek = `${year}-W${weekNumber}`;

      const { data, error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
          reset_week: currentWeek,
        })
        .select('*, challenge:challenges(*)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: challengeKeys.user(user.id) });
      }
    },
  });
}

export function useUpdateChallengeProgressMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ userChallengeId, newProgress, targetCount }: { 
      userChallengeId: string; 
      newProgress: number; 
      targetCount: number;
    }) => {
      const isCompleted = newProgress >= targetCount;

      const { data, error } = await supabase
        .from('user_challenges')
        .update({
          progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', userChallengeId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, isCompleted };
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: challengeKeys.user(user.id) });
      }
    },
  });
}
