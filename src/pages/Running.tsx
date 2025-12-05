import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RunTracker } from '@/components/RunTracker';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Running = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4">GPS Run Tracker</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to track your runs with GPS, view your route on a map, and monitor your pace and distance.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In to Start</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">GPS Run Tracker</h1>
            <p className="text-muted-foreground">
              Track your runs in real-time with GPS, pace monitoring, and route mapping.
            </p>
          </div>
          <RunTracker />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Running;
