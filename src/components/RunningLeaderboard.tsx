import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RunnerStats {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  weekly_runs: number;
  weekly_distance_meters: number;
  weekly_duration_seconds: number;
  total_runs: number;
  total_distance_meters: number;
}

export function RunningLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<RunnerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Use type assertion since the view isn't in auto-generated types
      const { data, error } = await supabase
        .from('running_leaderboard_view' as any)
        .select('*')
        .order('weekly_distance_meters', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching running leaderboard:', error);
        return;
      }

      setLeaderboard((data as unknown as RunnerStats[]) || []);
    } catch (err) {
      console.error('Error in fetchLeaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Weekly Running Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Weekly Running Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No runs recorded this week. Be the first!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5" />
          Weekly Running Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {leaderboard.map((runner, index) => {
          const isCurrentUser = runner.user_id === user?.id;
          return (
            <div
              key={runner.user_id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(index + 1)}
              </div>
              
              <Avatar className="h-8 w-8">
                <AvatarImage src={runner.avatar_url || undefined} />
                <AvatarFallback>
                  {runner.display_name ? getInitials(runner.display_name) : <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                  {runner.display_name || 'Anonymous Runner'}
                  {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {runner.weekly_runs} runs this week
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold">{formatDistance(runner.weekly_distance_meters)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistance(runner.total_distance_meters)} total
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
