import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Leaderboard } from '@/components/Leaderboard';
import Navbar from '@/components/Navbar';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-44 md:pt-28 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Community Rankings</h1>
            <p className="text-muted-foreground">
              See how you stack up against other members on the path to peak performance.
            </p>
          </div>

          <Leaderboard />
        </div>
      </main>
    </div>
  );
}
