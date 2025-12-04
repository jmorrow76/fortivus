import { Award, Flame, Crown, Trophy, Target, Zap, Medal, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_value: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface BadgeGridProps {
  badges: Badge[];
  userBadges: UserBadge[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'award': Award,
  'flame': Flame,
  'crown': Crown,
  'trophy': Trophy,
  'target': Target,
  'zap': Zap,
  'medal': Medal,
  'calendar-check': CalendarCheck,
};

export function BadgeGrid({ badges, userBadges }: BadgeGridProps) {
  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg uppercase tracking-wider">Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const IconComponent = iconMap[badge.icon] || Award;
            
            return (
              <div
                key={badge.id}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-lg border transition-all",
                  isEarned
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/30 border-border/50 opacity-50 grayscale"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                  isEarned ? "bg-primary/20" : "bg-muted"
                )}>
                  <IconComponent className={cn(
                    "h-6 w-6",
                    isEarned ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className="text-sm font-medium text-center">{badge.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  +{badge.xp_value} XP
                </span>
                {isEarned && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
