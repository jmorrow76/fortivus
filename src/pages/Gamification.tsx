import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { BadgeGrid } from '@/components/gamification/BadgeGrid';
import { ChallengeList } from '@/components/gamification/ChallengeList';

export default function Gamification() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    badges, 
    userBadges, 
    challenges, 
    userChallenges, 
    streak, 
    loading,
    joinChallenge 
  } = useGamification();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider">Your Progress</h1>
              <p className="text-muted-foreground">Track your journey to peak performance</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
          </Button>
        </div>

        <div className="space-y-8">
          <StreakDisplay
            currentStreak={streak?.current_streak || 0}
            longestStreak={streak?.longest_streak || 0}
            totalXp={streak?.total_xp || 0}
            totalCheckins={streak?.total_checkins || 0}
          />

          <BadgeGrid 
            badges={badges} 
            userBadges={userBadges.map(ub => ({ badge_id: ub.badge_id, earned_at: ub.earned_at }))} 
          />

          <ChallengeList
            challenges={challenges}
            userChallenges={userChallenges.map(uc => ({
              challenge_id: uc.challenge_id,
              progress: uc.progress,
              is_completed: uc.is_completed,
              challenge: uc.challenge
            }))}
            onJoinChallenge={joinChallenge}
          />
        </div>
      </div>
    </div>
  );
}
