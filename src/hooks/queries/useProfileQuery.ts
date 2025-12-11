import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
  public: (userIds: string[]) => [...profileKeys.all, 'public', userIds] as const,
};

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  calorie_goal: number | null;
  protein_goal: number | null;
  carbs_goal: number | null;
  fat_goal: number | null;
}

export function useProfileQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: profileKeys.detail(user?.id ?? ''),
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePublicProfilesQuery(userIds: string[]) {
  return useQuery({
    queryKey: profileKeys.public(userIds),
    queryFn: async () => {
      if (userIds.length === 0) return [];
      
      const { data, error } = await supabase
        .rpc('get_public_profiles', { user_ids: userIds });

      if (error) throw error;
      return data ?? [];
    },
    enabled: userIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(user.id) });
      }
    },
  });
}
