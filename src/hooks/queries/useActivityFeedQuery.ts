import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const activityKeys = {
  all: ['activity'] as const,
  feed: (followedOnly: boolean) => [...activityKeys.all, 'feed', followedOnly] as const,
};

export interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  badge_id: string | null;
  challenge_id: string | null;
  xp_earned: number | null;
  streak_count: number | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  badge?: {
    name: string;
    icon: string;
  };
  challenge?: {
    title: string;
  };
}

export function useActivityFeedQuery(followedOnly = false, following: string[] = []) {
  const { user } = useAuth();

  return useQuery({
    queryKey: activityKeys.feed(followedOnly),
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (followedOnly && following.length > 0) {
        query = query.in('user_id', [...following, user.id]);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles and badges for activities
      const userIds = [...new Set((data || []).map(a => a.user_id))];
      const badgeIds = [...new Set((data || []).filter(a => a.badge_id).map(a => a.badge_id))];
      const challengeIds = [...new Set((data || []).filter(a => a.challenge_id).map(a => a.challenge_id))];

      const [profilesRes, badgesRes, challengesRes] = await Promise.all([
        userIds.length > 0 ? supabase.rpc('get_public_profiles', { user_ids: userIds }) : { data: [] },
        badgeIds.length > 0 ? supabase.from('badges').select('id, name, icon').in('id', badgeIds) : { data: [] },
        challengeIds.length > 0 ? supabase.from('challenges').select('id, title').in('id', challengeIds) : { data: [] },
      ]);

      const profilesMap = new Map((profilesRes.data || []).map(p => [p.user_id, p]));
      const badgesMap = new Map((badgesRes.data || []).map(b => [b.id, b]));
      const challengesMap = new Map((challengesRes.data || []).map(c => [c.id, c]));

      return (data || []).map(activity => ({
        ...activity,
        profile: profilesMap.get(activity.user_id),
        badge: activity.badge_id ? badgesMap.get(activity.badge_id) : undefined,
        challenge: activity.challenge_id ? challengesMap.get(activity.challenge_id) : undefined,
      })) as ActivityItem[];
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function usePostActivityMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (activity: {
      activity_type: string;
      badge_id?: string;
      challenge_id?: string;
      xp_earned?: number;
      streak_count?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: user.id,
          ...activity,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
