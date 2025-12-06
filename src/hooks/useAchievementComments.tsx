import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  user_id: string;
  target_user_id: string;
  badge_id: string | null;
  comment: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

interface CommentCounts {
  [activityId: string]: number;
}

export function useAchievementComments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCounts, setCommentCounts] = useState<CommentCounts>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCommentCounts = useCallback(async (activityItems: { id: string; user_id: string; badge_id?: string | null }[]) => {
    if (activityItems.length === 0) return;

    try {
      // Get all badge_ids from activity items that have badges
      const badgeIds = activityItems
        .filter(a => a.badge_id)
        .map(a => a.badge_id as string);

      if (badgeIds.length === 0) {
        setCommentCounts({});
        return;
      }

      const { data, error } = await supabase
        .from('achievement_comments')
        .select('badge_id, target_user_id')
        .in('badge_id', badgeIds);

      if (error) throw error;

      // Count comments per activity (matching badge_id + target_user_id)
      const counts: CommentCounts = {};
      activityItems.forEach(activity => {
        if (activity.badge_id) {
          const matchingComments = data?.filter(
            c => c.badge_id === activity.badge_id && c.target_user_id === activity.user_id
          ) || [];
          counts[activity.id] = matchingComments.length;
        } else {
          counts[activity.id] = 0;
        }
      });

      setCommentCounts(counts);
    } catch (error) {
      console.error('Error fetching comment counts:', error);
    }
  }, []);

  const fetchComments = useCallback(async (targetUserId: string, badgeId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('achievement_comments')
        .select('*')
        .eq('target_user_id', targetUserId)
        .eq('badge_id', badgeId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase.rpc('get_public_profiles', { user_ids: userIds });

      const commentsWithAuthors = (data || []).map(comment => {
        const profile = profiles?.find((p: any) => p.user_id === comment.user_id);
        return {
          ...comment,
          author_name: profile?.display_name || 'Anonymous',
          author_avatar: profile?.avatar_url || undefined,
        };
      });

      setComments(commentsWithAuthors);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (
    targetUserId: string,
    badgeId: string,
    comment: string,
    activityId: string
  ) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return false;
    }

    if (!comment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return false;
    }

    if (comment.length > 500) {
      toast({
        title: "Comment too long",
        description: "Comments must be 500 characters or less.",
        variant: "destructive",
      });
      return false;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('achievement_comments')
        .insert({
          user_id: user.id,
          target_user_id: targetUserId,
          badge_id: badgeId,
          comment: comment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state with author info
      const newComment: Comment = {
        ...data,
        author_name: 'You',
        author_avatar: undefined,
      };
      setComments(prev => [...prev, newComment]);
      setCommentCounts(prev => ({
        ...prev,
        [activityId]: (prev[activityId] || 0) + 1,
      }));

      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });

      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user, toast]);

  const deleteComment = useCallback(async (commentId: string, activityId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('achievement_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentCounts(prev => ({
        ...prev,
        [activityId]: Math.max(0, (prev[activityId] || 0) - 1),
      }));

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return {
    comments,
    commentCounts,
    loading,
    submitting,
    fetchCommentCounts,
    fetchComments,
    addComment,
    deleteComment,
    clearComments: () => setComments([]),
  };
}
