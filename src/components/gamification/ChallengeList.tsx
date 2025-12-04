import { Target, Clock, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_days: number;
  target_count: number;
  xp_reward: number;
  reset_type?: string;
}

interface UserChallenge {
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  challenge: Challenge;
}

interface ChallengeListProps {
  challenges: Challenge[];
  userChallenges: UserChallenge[];
  onJoinChallenge: (challengeId: string) => void;
}

const categoryColors: Record<string, string> = {
  mobility: 'bg-blue-500/20 text-blue-400',
  recovery: 'bg-green-500/20 text-green-400',
  nutrition: 'bg-orange-500/20 text-orange-400',
  mental: 'bg-purple-500/20 text-purple-400',
  vitality: 'bg-yellow-500/20 text-yellow-400',
  consistency: 'bg-red-500/20 text-red-400',
  strength: 'bg-rose-500/20 text-rose-400',
  workout: 'bg-indigo-500/20 text-indigo-400',
  cardio: 'bg-cyan-500/20 text-cyan-400',
  general: 'bg-slate-500/20 text-slate-400',
};

export function ChallengeList({ challenges, userChallenges, onJoinChallenge }: ChallengeListProps) {
  const getUserChallenge = (challengeId: string) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg uppercase tracking-wider">Longevity Challenges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => {
          const userChallenge = getUserChallenge(challenge.id);
          const isJoined = !!userChallenge;
          const isCompleted = userChallenge?.is_completed;
          const progress = userChallenge?.progress || 0;
          const progressPercent = (progress / challenge.target_count) * 100;

          return (
            <div
              key={challenge.id}
              className={cn(
                "p-4 rounded-lg border transition-all",
                isCompleted ? "bg-green-500/10 border-green-500/30" : "bg-card border-border"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs uppercase tracking-wider",
                      categoryColors[challenge.category] || 'bg-muted text-muted-foreground'
                    )}>
                      {challenge.category}
                    </span>
                    {challenge.reset_type === 'weekly' && (
                      <span className="px-2 py-0.5 rounded text-xs uppercase tracking-wider bg-primary/20 text-primary flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Weekly
                      </span>
                    )}
                    {isCompleted && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {challenge.duration_days} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {challenge.target_count} target
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {challenge.xp_reward} XP
                    </span>
                  </div>

                  {isJoined && !isCompleted && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{progress}/{challenge.target_count}</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {!isJoined ? (
                    <Button
                      size="sm"
                      onClick={() => onJoinChallenge(challenge.id)}
                    >
                      Join
                    </Button>
                  ) : isCompleted ? (
                    <span className="text-xs text-green-500 font-medium">COMPLETED</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">In Progress</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
