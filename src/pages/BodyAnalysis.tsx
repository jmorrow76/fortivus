import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BodyAnalysisComponent from "@/components/BodyAnalysis";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Crown, Loader2 } from "lucide-react";

const BodyAnalysis = () => {
  const { user, loading, subscription } = useAuth();
  const navigate = useNavigate();

  // Redirect non-authenticated users to auth page
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: "/body-analysis" } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Show paywall for non-subscribers
  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-28 md:pt-20">
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 max-w-2xl">
              <Card className="text-center">
                <CardContent className="py-12 px-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-accent" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-medium mb-4">
                    Elite Members Only
                  </h1>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    AI Body Composition Analysis is an exclusive feature available to 
                    Fortivus Elite and Lifetime members. Upgrade to unlock unlimited 
                    AI-powered body analysis with personalized recommendations.
                  </p>
                  
                  <div className="space-y-4">
                    <Button variant="default" size="lg" className="w-full sm:w-auto" asChild>
                      <Link to="/pricing">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Elite
                      </Link>
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Starting at $15/month • Cancel anytime
                    </p>
                  </div>

                  <div className="mt-10 pt-8 border-t border-border">
                    <h3 className="font-medium mb-4">What you'll get:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-sm mx-auto">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Unlimited AI body fat analysis
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Personalized nutrition recommendations
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Custom training protocols
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        Recovery optimization tips
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">✓</span>
                        AI Personal Plan generator
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 md:pt-20">
        {/* Page Header */}
        <section className="py-8 md:py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-accent" />
              <span className="text-xs font-medium tracking-wider uppercase text-accent">Elite Feature</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-medium mb-2">AI Body Composition Analysis</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Upload a photo and get an AI-powered estimate of your body fat percentage 
              with personalized recommendations tailored for men over 40.
            </p>
          </div>
        </section>
        
        <BodyAnalysisComponent />
      </main>
      <Footer />
    </div>
  );
};

export default BodyAnalysis;
