import { useState, useEffect, useMemo } from 'react';
import { Award, Flame, Target, Zap, User, MessageCircle, Instagram, Share2, Send, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSocial } from '@/hooks/useSocial';
import { useLikes } from '@/hooks/useLikes';
import { useAchievementComments } from '@/hooks/useAchievementComments';
import { LikeButton } from '@/components/LikeButton';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function ActivityFeed() {
  const { activityFeed, fetchActivityFeed, loading, isFollowing, followUser } = useSocial();
  const [filter, setFilter] = useState<'following' | 'all'>('following');
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Like functionality
  const activityIds = useMemo(() => activityFeed.map(a => a.id), [activityFeed]);
  const { likeCounts, userLikes, toggleLike } = useLikes('activity_feed', activityIds);

  // Comment functionality
  const {
    comments,
    commentCounts,
    loading: commentsLoading,
    submitting,
    fetchCommentCounts,
    fetchComments,
    addComment,
    deleteComment,
    clearComments,
  } = useAchievementComments();

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<typeof activityFeed[0] | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadFeed();
  }, [filter]);

  useEffect(() => {
    if (activityFeed.length > 0) {
      const itemsWithBadges = activityFeed
        .filter(a => a.badge_id)
        .map(a => ({ id: a.id, user_id: a.user_id, badge_id: a.badge_id }));
      fetchCommentCounts(itemsWithBadges);
    }
  }, [activityFeed, fetchCommentCounts]);

  const loadFeed = async () => {
    setFetching(true);
    await fetchActivityFeed(filter === 'following');
    setFetching(false);
  };

  const openCommentDialog = async (activity: typeof activityFeed[0]) => {
    if (!activity.badge_id) return;
    setSelectedActivity(activity);
    setCommentDialogOpen(true);
    await fetchComments(activity.user_id, activity.badge_id);
  };

  const handleSubmitComment = async () => {
    if (!selectedActivity?.badge_id) return;
    const success = await addComment(
      selectedActivity.user_id,
      selectedActivity.badge_id,
      newComment,
      selectedActivity.id
    );
    if (success) {
      setNewComment('');
    }
  };

  const handleCloseDialog = () => {
    setCommentDialogOpen(false);
    setSelectedActivity(null);
    setNewComment('');
    clearComments();
  };

  const handleShare = async (activity: typeof activityFeed[0], platform: 'instagram' | 'general') => {
    const name = activity.profile?.display_name || 'Someone';
    const badgeName = activity.badge?.name || 'Achievement';
    const isOwnAchievement = activity.user_id === user?.id;
    
    const shareText = isOwnAchievement
      ? `🏆 I just earned the "${badgeName}" badge on Fortivus! #Fortivus #FitnessGoals #Achievement`
      : `🏆 ${name} just earned the "${badgeName}" badge on Fortivus! #Fortivus #FitnessGoals`;
    
    const isInIframe = window.self !== window.top;
    
    if (navigator.share && !isInIframe) {
      try {
        await navigator.share({
          title: `${badgeName} Badge Earned!`,
          text: shareText,
          url: window.location.origin,
        });
        toast({
          title: "Shared successfully!",
          description: "Your achievement has been shared.",
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "✅ Copied to clipboard!",
        description: platform === 'instagram' 
          ? "Now open Instagram and paste to share your achievement."
          : "Paste anywhere to share this achievement.",
        duration: 5000,
      });
    } catch {
      if (platform === 'instagram') {
        window.open('https://www.instagram.com/', '_blank');
        toast({
          title: "Share on Instagram",
          description: shareText,
          duration: 10000,
        });
      } else {
        toast({
          title: "Share this achievement!",
          description: shareText,
          duration: 10000,
        });
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'badge_earned':
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 'streak_milestone':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'challenge_completed':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'xp_earned':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Zap className="h-4 w-4 text-primary" />;
    }
  };

  const getActivityText = (activity: typeof activityFeed[0]) => {
    const name = activity.profile?.display_name || 'Someone';
    switch (activity.activity_type) {
      case 'badge_earned':
        return `${name} earned the "${activity.badge?.name}" badge!`;
      case 'streak_milestone':
        return `${name} reached a ${activity.streak_count}-day streak!`;
      case 'challenge_completed':
        return `${name} completed the "${activity.challenge?.title}" challenge!`;
      case 'xp_earned':
        return `${name} earned ${activity.xp_earned} XP!`;
      case 'checkin':
        return `${name} completed their daily check-in`;
      default:
        return `${name} achieved something great!`;
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg uppercase tracking-wider">Activity Feed</CardTitle>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as 'following' | 'all')}>
              <TabsList className="h-8">
                <TabsTrigger value="following" className="text-xs px-3">Following</TabsTrigger>
                <TabsTrigger value="all" className="text-xs px-3">Everyone</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : activityFeed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === 'following' 
                ? "No activity from people you follow yet. Follow others to see their achievements!"
                : "No activity yet. Be the first to achieve something!"}
            </div>
          ) : (
            <div className="space-y-3">
              {activityFeed.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.activity_type)}
                      <span className="text-sm">{getActivityText(activity)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <LikeButton
                      liked={userLikes[activity.id] || false}
                      count={likeCounts[activity.id] || 0}
                      onClick={() => toggleLike(activity.id)}
                      size="sm"
                    />
                    {activity.badge_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCommentDialog(activity)}
                        className="h-7 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {(commentCounts[activity.id] || 0) > 0 && (
                          <span className="text-xs font-medium">{commentCounts[activity.id]}</span>
                        )}
                      </Button>
                    )}
                    {activity.activity_type === 'badge_earned' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShare(activity, 'instagram')}
                          className="h-8 w-8 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
                          title="Share to Instagram"
                        >
                          <Instagram className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShare(activity, 'general')}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {!isFollowing(activity.user_id) && activity.user_id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => followUser(activity.user_id)}
                        className="text-xs"
                      >
                        Follow
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments
            </DialogTitle>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              {/* Achievement info */}
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {selectedActivity.profile?.display_name || 'Someone'} earned "{selectedActivity.badge?.name}"
                  </span>
                </div>
              </div>

              {/* Comments list */}
              <div className="max-h-64 overflow-y-auto space-y-3">
                {commentsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first to congratulate!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={comment.author_avatar} />
                        <AvatarFallback className="bg-secondary text-xs">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">{comment.author_name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                            {comment.user_id === user?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteComment(comment.id, selectedActivity.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/90 break-words">{comment.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment */}
              {user ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    maxLength={500}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Sign in to leave a comment
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
