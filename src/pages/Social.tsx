import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { ActivityFeed } from '@/components/social/ActivityFeed';
import { UserProfileCard } from '@/components/social/UserProfileCard';
import { Leaderboard } from '@/components/Leaderboard';
import Navbar from '@/components/Navbar';

export default function Social() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const profileId = searchParams.get('profile');
    if (profileId) {
      setSelectedUserId(profileId);
    }
  }, [searchParams]);

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
      <main className="pt-32 md:pt-24 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Community
            </h1>
            <p className="text-muted-foreground">
              Connect with others on the path to peak performance.
            </p>
          </div>

          {selectedUserId ? (
            <div className="space-y-4">
              <Button variant="ghost" onClick={() => setSelectedUserId(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Feed
              </Button>
              <UserProfileCard userId={selectedUserId} />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="feed" className="flex-1">Activity Feed</TabsTrigger>
                <TabsTrigger value="leaderboard" className="flex-1">Leaderboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed">
                <ActivityFeed />
              </TabsContent>
              
              <TabsContent value="leaderboard">
                <Leaderboard />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
