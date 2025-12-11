import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Trophy, ChevronRight, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  activity_type: string;
  created_at: string;
  user_id: string;
  badge?: { name: string; icon: string } | null;
  challenge?: { title: string } | null;
  profile?: { display_name: string | null; avatar_url: string | null } | null;
}

interface ForumTopic {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
  view_count: number;
  profile?: { display_name: string | null; avatar_url: string | null } | null;
  replies_count: number;
}

export default function CommunityPreview() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      // Fetch recent activity feed items
      const { data: activityData } = await supabase
        .from('activity_feed')
        .select(`
          id,
          activity_type,
          created_at,
          user_id,
          badge:badges(name, icon),
          challenge:challenges(title)
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      // Fetch recent forum topics
      const { data: topicsData } = await supabase
        .from('forum_topics')
        .select('id, title, created_at, user_id, view_count')
        .order('created_at', { ascending: false })
        .limit(3);

      if (activityData) {
        // Get user profiles for activities
        const userIds = [...new Set(activityData.map(a => a.user_id))];
        const { data: profiles } = await supabase.rpc('get_public_profiles', { user_ids: userIds });
        
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
        
        setActivities(activityData.map(a => ({
          ...a,
          profile: profileMap.get(a.user_id) as any
        })));
      }

      if (topicsData) {
        // Get user profiles and reply counts for topics
        const userIds = [...new Set(topicsData.map(t => t.user_id))];
        const { data: profiles } = await supabase.rpc('get_public_profiles', { user_ids: userIds });
        
        // Get reply counts
        const topicIds = topicsData.map(t => t.id);
        const { data: replyCounts } = await supabase
          .from('forum_posts')
          .select('topic_id')
          .in('topic_id', topicIds);

        const replyCountMap = new Map<string, number>();
        replyCounts?.forEach((r: any) => {
          replyCountMap.set(r.topic_id, (replyCountMap.get(r.topic_id) || 0) + 1);
        });

        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

        setTopics(topicsData.map(t => ({
          ...t,
          profile: profileMap.get(t.user_id) as any,
          replies_count: replyCountMap.get(t.id) || 0
        })));
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.activity_type) {
      case 'badge_earned':
        return `earned the "${activity.badge?.name}" badge`;
      case 'challenge_completed':
        return `completed "${activity.challenge?.title}"`;
      case 'streak_milestone':
        return 'hit a streak milestone';
      case 'workout_logged':
        return 'logged a workout';
      default:
        return 'was active';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading community...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community
          </CardTitle>
          <CardDescription>Connect with fellow brothers in faith</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/community" className="flex items-center gap-1">
              Activity <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/forum" className="flex items-center gap-1">
              Forum <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Recent Activity
            </h4>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <Link 
                    key={activity.id} 
                    to="/community"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {activity.profile?.display_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">{activity.profile?.display_name || 'Member'}</span>{' '}
                        <span className="text-muted-foreground">{getActivityMessage(activity)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Forum Topics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Forum Discussions
            </h4>
            {topics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No forum topics yet</p>
            ) : (
              <div className="space-y-2">
                {topics.map((topic) => (
                  <Link 
                    key={topic.id} 
                    to={`/forum?topic=${topic.id}`}
                    className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm font-medium truncate">{topic.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        by {topic.profile?.display_name || 'Member'}
                      </span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {topic.replies_count} {topic.replies_count === 1 ? 'reply' : 'replies'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <Link to="/leaderboard">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/accountability">
              <Users className="h-4 w-4 mr-2" />
              Find Partner
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/testimonies">
              <Heart className="h-4 w-4 mr-2" />
              Testimonies
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
