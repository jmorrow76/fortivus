import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CalorieTracker } from '@/components/CalorieTracker';
import { MealPlanner } from '@/components/MealPlanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Flame, CalendarDays } from 'lucide-react';

export default function CalorieTracking() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  
  const hasAccess = subscription?.subscribed;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 pt-44 md:pt-28">
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
                Calorie tracking and meal planning is available to Elite members.
              </p>
              <Button onClick={() => navigate('/pricing')}>Upgrade to Elite</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="tracker" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="tracker" className="gap-2">
                <Flame className="w-4 h-4" />
                Daily Tracker
              </TabsTrigger>
              <TabsTrigger value="planner" className="gap-2">
                <CalendarDays className="w-4 h-4" />
                Meal Planner
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracker" className="max-w-2xl">
              <CalorieTracker />
            </TabsContent>
            
            <TabsContent value="planner">
              <MealPlanner />
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
