import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type TargetType = 'forum_topic' | 'forum_post' | 'activity_feed' | 'prayer_request';

interface LikeCount {
  [key: string]: number;
}

interface UserLikes {
  [key: string]: boolean;
}

export function useLikes(targetType: TargetType, targetIds: string[]) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likeCounts, setLikeCounts] = useState<LikeCount>({});
  const [userLikes, setUserLikes] = useState<UserLikes>({});
  const [loading, setLoading] = useState(false);

  const fetchLikes = useCallback(async () => {
    if (targetIds.length === 0) return;

    try {
      // Fetch like counts for all targets
      const { data: allLikes, error: countError } = await supabase
        .from('likes')
        .select('target_id')
        .eq('target_type', targetType)
        .in('target_id', targetIds);

      if (countError) throw countError;

      // Count likes per target
      const counts: LikeCount = {};
      targetIds.forEach(id => { counts[id] = 0; });
      allLikes?.forEach(like => {
        counts[like.target_id] = (counts[like.target_id] || 0) + 1;
      });
      setLikeCounts(counts);

      // Fetch user's likes if logged in
      if (user) {
        const { data: userLikesData, error: userError } = await supabase
          .from('likes')
          .select('target_id')
          .eq('target_type', targetType)
          .eq('user_id', user.id)
          .in('target_id', targetIds);

        if (userError) throw userError;

        const likes: UserLikes = {};
        targetIds.forEach(id => { likes[id] = false; });
        userLikesData?.forEach(like => {
          likes[like.target_id] = true;
        });
        setUserLikes(likes);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  }, [targetType, targetIds.join(','), user?.id]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const toggleLike = async (targetId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const isCurrentlyLiked = userLikes[targetId];

    try {
      if (isCurrentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('target_type', targetType)
          .eq('target_id', targetId);

        if (error) throw error;

        setUserLikes(prev => ({ ...prev, [targetId]: false }));
        setLikeCounts(prev => ({ ...prev, [targetId]: Math.max(0, (prev[targetId] || 0) - 1) }));
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            target_type: targetType,
            target_id: targetId,
          });

        if (error) throw error;

        setUserLikes(prev => ({ ...prev, [targetId]: true }));
        setLikeCounts(prev => ({ ...prev, [targetId]: (prev[targetId] || 0) + 1 }));
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    likeCounts,
    userLikes,
    toggleLike,
    loading,
    refetch: fetchLikes,
  };
}
