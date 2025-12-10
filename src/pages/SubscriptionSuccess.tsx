import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const SubscriptionSuccess = () => {
  const { checkSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh subscription status after successful checkout
    checkSubscription();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 md:pt-28 pb-16 px-4">
        <div className="container max-w-lg mx-auto">
          <Card className="shadow-elevated text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="font-heading text-2xl">Welcome to Fortivus Elite!</CardTitle>
              <CardDescription className="text-base">
                Your subscription is now active. You have full access to all premium features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Your Elite Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Unlimited progress photo storage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    AI body composition analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Personalized training plans
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Priority support
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/progress")} className="group">
                  Start Tracking Progress
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionSuccess;
