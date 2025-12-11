import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const badgeKeys = {
  all: ['badges'] as const,
  list: () => [...badgeKeys.all, 'list'] as const,
  user: (userId: string) => [...badgeKeys.all, 'user', userId] as const,
};

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_value: number;
  requirement_type: string;
  requirement_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export function useBadgesQuery() {
  return useQuery({
    queryKey: badgeKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*');

      if (error) throw error;
      return (data ?? []) as Badge[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - badges rarely change
  });
}

export function useUserBadgesQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: badgeKeys.user(user?.id ?? ''),
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data ?? []) as unknown as UserBadge[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAwardBadgeMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (badgeId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: badgeId,
        })
        .select('*, badge:badges(*)')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: badgeKeys.user(user.id) });
      }
    },
  });
}
