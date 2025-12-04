import { Flame, Trophy, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  totalCheckins: number;
}

export function StreakDisplay({ currentStreak, longestStreak, totalXp, totalCheckins }: StreakDisplayProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
        <CardContent className="p-4 text-center">
          <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
          <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Day Streak</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30">
        <CardContent className="p-4 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-3xl font-bold text-foreground">{longestStreak}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Best Streak</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-500/30">
        <CardContent className="p-4 text-center">
          <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
          <div className="text-3xl font-bold text-foreground">{totalXp.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total XP</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
        <CardContent className="p-4 text-center">
          <div className="h-8 w-8 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-500 font-bold">✓</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{totalCheckins}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Check-ins</div>
        </CardContent>
      </Card>
    </div>
  );
}
