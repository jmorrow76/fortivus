import { useState, useEffect } from 'react';
import { Award, Flame, Target, Zap, User, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useSocial } from '@/hooks/useSocial';
import { formatDistanceToNow } from 'date-fns';

export function ActivityFeed() {
  const { activityFeed, fetchActivityFeed, loading, isFollowing, followUser } = useSocial();
  const [filter, setFilter] = useState<'following' | 'all'>('following');
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [filter]);

  const loadFeed = async () => {
    setFetching(true);
    await fetchActivityFeed(filter === 'following');
    setFetching(false);
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

                {!isFollowing(activity.user_id) && (
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
