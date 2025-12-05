import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CalorieTracker } from '@/components/CalorieTracker';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function CalorieTracking() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  
  const hasAccess = subscription?.subscribed;

  return (
    <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Calorie Tracker</h1>
          
          {!user ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-muted-foreground">Sign in to track your calories</p>
                <Button onClick={() => navigate('/auth')}>Sign In</Button>
              </CardContent>
            </Card>
          ) : !hasAccess ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
                <h2 className="text-xl font-semibold">Elite Feature</h2>
                <p className="text-muted-foreground">
                  Calorie tracking is available to Elite members. Upgrade to log meals and track your macros.
                </p>
                <Button onClick={() => navigate('/pricing')}>Upgrade to Elite</Button>
              </CardContent>
            </Card>
          ) : (
            <CalorieTracker />
          )}
        </main>
        
        <Footer />
      </div>
  );
}
