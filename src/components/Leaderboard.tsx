import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trophy, Flame, Zap, Crown, Medal, Award, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  total_checkins: number;
  display_name: string | null;
  avatar_url: string | null;
}

export function Leaderboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'xp' | 'streak' | 'checkins'>('xp');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .limit(50);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'streak':
        return b.current_streak - a.current_streak;
      case 'checkins':
        return b.total_checkins - a.total_checkins;
      default:
        return b.total_xp - a.total_xp;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-sm text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gray-400/10 border-gray-400/30';
      case 3:
        return 'bg-amber-600/10 border-amber-600/30';
      default:
        return 'bg-card border-border';
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
          <div>
            <CardTitle className="flex items-center gap-2 text-lg uppercase tracking-wider">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <CardDescription>Top performers in the community</CardDescription>
          </div>
          <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as 'xp' | 'streak' | 'checkins')}>
            <TabsList className="h-8">
              <TabsTrigger value="xp" className="text-xs px-3 gap-1">
                <Zap className="h-3 w-3" />
                XP
              </TabsTrigger>
              <TabsTrigger value="streak" className="text-xs px-3 gap-1">
                <Flame className="h-3 w-3" />
                Streak
              </TabsTrigger>
              <TabsTrigger value="checkins" className="text-xs px-3 gap-1">
                ✓ Check-ins
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No one on the leaderboard yet. Be the first!
          </div>
        ) : (
          <div className="space-y-2">
            {sortedEntries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.user_id === user?.id;

              return (
                <div
                  key={entry.user_id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    getRankBg(rank),
                    isCurrentUser && "ring-2 ring-primary/50"
                  )}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {entry.display_name || 'Anonymous'}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {entry.current_streak}d streak
                      </span>
                      <span>{entry.total_checkins} check-ins</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Zap className="h-4 w-4" />
                      {entry.total_xp.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
