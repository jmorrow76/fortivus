import { useState, useEffect } from 'react';
import { User, Users, MessageCircle, Loader2, Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileCardProps {
  userId: string;
  onClose?: () => void;
}

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
}

interface StreakData {
  current_streak: number;
  total_xp: number;
  total_checkins: number;
}

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function UserProfileCard({ userId, onClose }: UserProfileCardProps) {
  const { user } = useAuth();
  const { isFollowing, followUser, unfollowUser, getComments, addComment, deleteComment } = useSocial();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);

    const [profileRes, streakRes, followersRes, followingRes] = await Promise.all([
      supabase.from('profiles').select('display_name, avatar_url').eq('user_id', userId).maybeSingle(),
      supabase.from('user_streaks').select('current_streak, total_xp, total_checkins').eq('user_id', userId).maybeSingle(),
      supabase.from('user_follows').select('id').eq('following_id', userId),
      supabase.from('user_follows').select('id').eq('follower_id', userId)
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (streakRes.data) setStreak(streakRes.data);
    setFollowerCount(followersRes.data?.length || 0);
    setFollowingCount(followingRes.data?.length || 0);

    // Fetch comments
    const commentsData = await getComments(userId);
    setComments(commentsData);

    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    
    const success = await addComment(userId, newComment);
    if (success) {
      setNewComment('');
      const updatedComments = await getComments(userId);
      setComments(updatedComments);
    }
    
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-2xl">
              <User className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">{profile?.display_name || 'Anonymous'}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {followerCount} followers
              </span>
              <span>{followingCount} following</span>
            </div>
          </div>
          {!isOwnProfile && (
            <Button
              variant={isFollowing(userId) ? "outline" : "default"}
              onClick={() => isFollowing(userId) ? unfollowUser(userId) : followUser(userId)}
            >
              {isFollowing(userId) ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        {streak && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold">{streak.current_streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold">{streak.total_xp.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold">{streak.total_checkins}</div>
              <div className="text-xs text-muted-foreground">Check-ins</div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div>
          <h3 className="font-medium text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Wall ({comments.length})
          </h3>

          {/* Add Comment */}
          {!isOwnProfile && (
            <div className="flex gap-2 mb-4">
              <Textarea
                placeholder="Leave a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                maxLength={500}
                className="resize-none"
              />
              <Button
                size="icon"
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to leave one!
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 p-2 rounded-lg bg-secondary/30">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {comment.profile?.display_name || 'Anonymous'}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {comment.user_id === user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
