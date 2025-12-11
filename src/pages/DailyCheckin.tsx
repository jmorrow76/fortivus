import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import MoodCheckin from "@/components/MoodCheckin";
import { TrendsDashboard } from "@/components/TrendsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

const DailyCheckin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkAndNotifyStreak, permission } = useNotifications();

  // Check and notify about streak when page loads
  useEffect(() => {
    if (user && permission === 'granted') {
      checkAndNotifyStreak();
    }
  }, [user, permission, checkAndNotifyStreak]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 md:pt-28 pb-16 px-4">
        <div className="container max-w-2xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold mb-2">
              Daily Check-in
            </h1>
            <p className="text-muted-foreground">
              Track how you're feeling and get a personalized workout recommendation
              tailored to your current state.
            </p>
          </div>

          <div className="space-y-8">
            <MoodCheckin />
            
            {user && <TrendsDashboard />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyCheckin;
