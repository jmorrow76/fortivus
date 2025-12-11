import { useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Sparkles, Camera, TrendingUp, FileText, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BodyAnalysisComponent from "@/components/BodyAnalysis";

const MyProgress = () => {
  const navigate = useNavigate();
  const { user, loading, subscription } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'plan';

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: "/my-progress" } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Non-subscribed users see upgrade prompt
  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-40 md:pt-28 pb-16 px-4">
          <div className="container max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>

            <Card className="text-center">
              <CardContent className="py-12 px-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-accent" />
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                  Elite Members Only
                </h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  My Progress features are available exclusively to Fortivus Elite members. 
                  Upgrade to unlock AI-powered body analysis, personalized plans, and progress tracking.
                </p>
                
                <div className="space-y-4">
                  <Button size="lg" className="w-full sm:w-auto" asChild>
                    <Link to="/pricing">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Elite
                    </Link>
                  </Button>
                </div>

                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="font-medium mb-4">What you'll unlock:</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-sm mx-auto">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      AI Personal Plan - custom diet, workout & supplements
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      AI Body Composition Analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      Progress Photo Tracking & Comparisons
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      Weight tracking charts
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 md:pt-28 pb-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium tracking-wider uppercase text-accent">Elite Feature</span>
              </div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">My Progress</h1>
              <p className="text-muted-foreground text-sm">
                Track your transformation with AI-powered tools
              </p>
            </div>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-6 grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="plan" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Plan</span>
                <span className="sm:hidden">Plan</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Body Analysis</span>
                <span className="sm:hidden">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="gap-2">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Progress Photos</span>
                <span className="sm:hidden">Photos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plan">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    AI Personal Plan
                  </CardTitle>
                  <CardDescription>
                    Get a custom diet, workout, and supplement protocol designed specifically for your goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Create a comprehensive, personalized fitness plan tailored to your goals, current stats, and preferences.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <Link to="/personal-plan">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Create New Plan
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/personal-plan?tab=saved">
                          <FileText className="h-4 w-4 mr-2" />
                          View Saved Plans
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="-mx-4 sm:mx-0">
                <BodyAnalysisComponent />
              </div>
            </TabsContent>

            <TabsContent value="photos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-accent" />
                    Progress Photos
                  </CardTitle>
                  <CardDescription>
                    Track your transformation journey with photo comparisons and weight charts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Upload progress photos, compare side-by-side transformations, and track your weight over time.
                    </p>
                    <Button asChild>
                      <Link to="/progress">
                        <Camera className="h-4 w-4 mr-2" />
                        View Progress Photos
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProgress;
