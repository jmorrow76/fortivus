import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface FollowData {
  follower_id: string;
  following_id: string;
}

interface ActivityItem {
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

interface Comment {
  id: string;
  user_id: string;
  target_user_id: string;
  badge_id: string | null;
  comment: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useSocial() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSocialData();
    }
  }, [user]);

  const fetchSocialData = async () => {
    if (!user) return;
    setLoading(true);

    const [followingRes, followersRes] = await Promise.all([
      supabase.from('user_follows').select('following_id').eq('follower_id', user.id),
      supabase.from('user_follows').select('follower_id').eq('following_id', user.id)
    ]);

    if (followingRes.data) {
      setFollowing(followingRes.data.map(f => f.following_id));
    }
    if (followersRes.data) {
      setFollowers(followersRes.data.map(f => f.follower_id));
    }

    setLoading(false);
  };

  const fetchActivityFeed = useCallback(async (followedOnly: boolean = true) => {
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
    
    if (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }

    // Fetch profiles and badges for activities
    const userIds = [...new Set((data || []).map(a => a.user_id))];
    const badgeIds = [...new Set((data || []).filter(a => a.badge_id).map(a => a.badge_id))];
    const challengeIds = [...new Set((data || []).filter(a => a.challenge_id).map(a => a.challenge_id))];

    const [profilesRes, badgesRes, challengesRes] = await Promise.all([
      userIds.length > 0 ? supabase.rpc('get_public_profiles', { user_ids: userIds }) : { data: [] },
      badgeIds.length > 0 ? supabase.from('badges').select('id, name, icon').in('id', badgeIds) : { data: [] },
      challengeIds.length > 0 ? supabase.from('challenges').select('id, title').in('id', challengeIds) : { data: [] }
    ]);

    const profilesMap = new Map((profilesRes.data || []).map(p => [p.user_id, p]));
    const badgesMap = new Map((badgesRes.data || []).map(b => [b.id, b]));
    const challengesMap = new Map((challengesRes.data || []).map(c => [c.id, c]));

    const enrichedData = (data || []).map(activity => ({
      ...activity,
      profile: profilesMap.get(activity.user_id),
      badge: activity.badge_id ? badgesMap.get(activity.badge_id) : undefined,
      challenge: activity.challenge_id ? challengesMap.get(activity.challenge_id) : undefined
    }));

    setActivityFeed(enrichedData);
    return enrichedData;
  }, [user, following]);

  const followUser = async (targetUserId: string) => {
    if (!user || targetUserId === user.id) return;

    const { error } = await supabase.from('user_follows').insert({
      follower_id: user.id,
      following_id: targetUserId
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already following', description: 'You are already following this user.' });
      } else {
        toast({ title: 'Error', description: 'Failed to follow user', variant: 'destructive' });
      }
      return;
    }

    setFollowing(prev => [...prev, targetUserId]);
    toast({ title: 'Following!', description: 'You are now following this user.' });
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to unfollow user', variant: 'destructive' });
      return;
    }

    setFollowing(prev => prev.filter(id => id !== targetUserId));
    toast({ title: 'Unfollowed', description: 'You are no longer following this user.' });
  };

  const isFollowing = (userId: string) => following.includes(userId);

  const postActivity = async (
    activityType: string,
    options?: { badge_id?: string; challenge_id?: string; xp_earned?: number; streak_count?: number }
  ) => {
    if (!user) return;

    await supabase.from('activity_feed').insert({
      user_id: user.id,
      activity_type: activityType,
      ...options
    });
  };

  const getComments = async (targetUserId: string, badgeId?: string) => {
    let query = supabase
      .from('achievement_comments')
      .select('*')
      .eq('target_user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (badgeId) {
      query = query.eq('badge_id', badgeId);
    }

    const { data, error } = await query;
    if (error) return [];

    // Fetch profiles using secure function
    const userIds = [...new Set((data || []).map(c => c.user_id))];
    const { data: profiles } = await supabase.rpc('get_public_profiles', { user_ids: userIds });

    const profilesMap = new Map((profiles || []).map(p => [p.user_id, p]));

    return (data || []).map(comment => ({
      ...comment,
      profile: profilesMap.get(comment.user_id)
    }));
  };

  const addComment = async (targetUserId: string, comment: string, badgeId?: string) => {
    if (!user || !comment.trim()) return;

    const { error } = await supabase.from('achievement_comments').insert({
      user_id: user.id,
      target_user_id: targetUserId,
      badge_id: badgeId || null,
      comment: comment.trim().slice(0, 500)
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to post comment', variant: 'destructive' });
      return false;
    }

    toast({ title: 'Comment posted!' });
    return true;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from('achievement_comments').delete().eq('id', commentId);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete comment', variant: 'destructive' });
      return false;
    }
    return true;
  };

  return {
    following,
    followers,
    activityFeed,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    fetchActivityFeed,
    postActivity,
    getComments,
    addComment,
    deleteComment,
    refetch: fetchSocialData
  };
}
