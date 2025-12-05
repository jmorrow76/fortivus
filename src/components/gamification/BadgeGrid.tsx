import { Award, Flame, Crown, Trophy, Target, Zap, Medal, CalendarCheck, Star, Dumbbell, Heart, TrendingUp, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  'star': Star,
  'dumbbell': Dumbbell,
  'heart': Heart,
  'trending-up': TrendingUp,
};

const categoryColors: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
  'streak': { 
    bg: 'from-orange-500/20 to-amber-500/10', 
    border: 'border-orange-500/40', 
    icon: 'text-orange-500',
    glow: 'shadow-orange-500/20'
  },
  'challenge': { 
    bg: 'from-blue-500/20 to-cyan-500/10', 
    border: 'border-blue-500/40', 
    icon: 'text-blue-500',
    glow: 'shadow-blue-500/20'
  },
  'milestone': { 
    bg: 'from-purple-500/20 to-pink-500/10', 
    border: 'border-purple-500/40', 
    icon: 'text-purple-500',
    glow: 'shadow-purple-500/20'
  },
  'special': { 
    bg: 'from-amber-400/20 to-yellow-500/10', 
    border: 'border-amber-400/40', 
    icon: 'text-amber-400',
    glow: 'shadow-amber-400/20'
  },
};

export function BadgeGrid({ badges, userBadges }: BadgeGridProps) {
  const { toast } = useToast();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

  const shareBadge = async (badge: Badge) => {
    const shareText = `🏆 I just earned the "${badge.name}" badge on Fortivus! ${badge.description} #Fortivus #FitnessGoals #Over40Fitness`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Badge Earned: ${badge.name}`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copied to clipboard!',
        description: 'Share your achievement on social media',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg uppercase tracking-wider flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const IconComponent = iconMap[badge.icon] || Award;
            const colors = categoryColors[badge.category] || categoryColors['milestone'];
            const earnedDate = userBadges.find(ub => ub.badge_id === badge.id)?.earned_at;
            
            return (
              <div
                key={badge.id}
                className={cn(
                  "group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer",
                  isEarned
                    ? `bg-gradient-to-br ${colors.bg} ${colors.border} hover:scale-105 shadow-lg ${colors.glow}`
                    : "bg-muted/20 border-border/30 opacity-40 grayscale hover:opacity-60"
                )}
                onClick={() => isEarned && setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)}
              >
                {/* Badge Icon Container */}
                <div className={cn(
                  "relative w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                  isEarned 
                    ? `bg-gradient-to-br ${colors.bg} ring-2 ring-offset-2 ring-offset-background ${colors.border.replace('border-', 'ring-')}`
                    : "bg-muted"
                )}>
                  {/* Animated ring for earned badges */}
                  {isEarned && (
                    <div className={cn(
                      "absolute inset-0 rounded-full animate-pulse opacity-50",
                      `bg-gradient-to-br ${colors.bg}`
                    )} />
                  )}
                  <IconComponent className={cn(
                    "h-8 w-8 relative z-10 transition-transform",
                    isEarned ? colors.icon : "text-muted-foreground"
                  )} />
                </div>

                {/* Badge Name */}
                <span className={cn(
                  "text-sm font-semibold text-center leading-tight",
                  isEarned ? "text-foreground" : "text-muted-foreground"
                )}>
                  {badge.name}
                </span>

                {/* XP Value */}
                <span className={cn(
                  "text-xs mt-1 px-2 py-0.5 rounded-full",
                  isEarned 
                    ? `${colors.icon} bg-background/50 font-medium`
                    : "text-muted-foreground"
                )}>
                  +{badge.xp_value} XP
                </span>

                {/* Earned Checkmark */}
                {isEarned && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Expanded details on select */}
                {selectedBadge?.id === badge.id && isEarned && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-48 p-3 bg-card border rounded-lg shadow-xl animate-fade-in">
                    <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                    {earnedDate && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Earned: {new Date(earnedDate).toLocaleDateString()}
                      </p>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareBadge(badge);
                      }}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share Achievement
                    </Button>
                  </div>
                )}

                {/* Locked overlay for unearned */}
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center">
                      <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
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
