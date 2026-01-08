import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Briefcase, Brain, Clock, Coffee, Monitor, Lock, Zap, Battery } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlanUpdateBanner } from "@/components/PlanUpdateBanner";
import { toast as sonnerToast } from "sonner";

const ExecutiveMode = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isElite = subscription?.subscribed;

  const [loading, setLoading] = useState(false);
  const [showPlanBanner, setShowPlanBanner] = useState(false);
  const [formData, setFormData] = useState({
    focusRating: 5,
    mentalClarity: 5,
    decisionFatigue: 5,
    workHours: 8,
    meetingsCount: 4,
    caffeineIntake: 200,
    screenTimeHours: 10,
    age: 45,
  });
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isElite) {
      toast({
        title: "Elite Feature",
        description: "Upgrade to Elite to access Executive Performance Mode.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-executive-performance", {
        body: formData,
      });

      if (error) throw error;
      setAnalysis(data);

      // Save to database
      await supabase.from("cognitive_metrics").insert({
        user_id: user.id,
        focus_rating: formData.focusRating,
        mental_clarity: formData.mentalClarity,
        decision_fatigue: formData.decisionFatigue,
        work_hours: formData.workHours,
        meetings_count: formData.meetingsCount,
        caffeine_intake: formData.caffeineIntake,
        screen_time_hours: formData.screenTimeHours,
        cognitive_load_score: data.cognitive_load_score,
        productivity_recommendations: data.productivity_recommendations,
        optimal_workout_windows: data.optimal_workout_windows,
        stress_management_protocol: data.stress_management_protocol,
        ai_insights: data.ai_insights,
      });

      toast({
        title: "Analysis Complete",
        description: "Your executive performance plan is ready.",
      });
      
      setShowPlanBanner(true);
      sonnerToast.info("Executive metrics updated", {
        description: "Consider regenerating your AI Plan to incorporate these insights.",
        action: { label: "Update Plan", onClick: () => navigate("/my-progress") },
        duration: 8000,
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCognitiveColor = (score: number) => {
    if (score < 40) return "text-green-500";
    if (score < 60) return "text-yellow-500";
    if (score < 80) return "text-orange-500";
    return "text-red-500";
  };

  if (!isElite) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-44 md:pt-28 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Executive Performance Mode</CardTitle>
                <CardDescription>
                  Cognitive optimization for busy executives. Integrate fitness with demanding work schedules, manage stress, and maintain peak mental performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Cognitive Load</p>
                      <p className="text-xs text-muted-foreground">Track mental fatigue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Optimal Timing</p>
                      <p className="text-xs text-muted-foreground">Best workout windows</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Stress Management</p>
                      <p className="text-xs text-muted-foreground">Tactical recovery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Coffee className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Caffeine Optimization</p>
                      <p className="text-xs text-muted-foreground">Strategic intake</p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => navigate("/#pricing")} className="w-full">
                  Upgrade to Elite
                </Button>
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
      <main className="pt-44 md:pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Executive Performance Mode</h1>
              <p className="text-muted-foreground">
                Optimize fitness around your demanding schedule
              </p>
            </div>

            <PlanUpdateBanner featureName="Executive Performance" show={showPlanBanner} />

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Today's Workload
                  </CardTitle>
                  <CardDescription>How's your cognitive state today?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Focus Rating: {formData.focusRating}/10</Label>
                    <Slider
                      value={[formData.focusRating]}
                      onValueChange={(v) => setFormData({ ...formData, focusRating: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mental Clarity: {formData.mentalClarity}/10</Label>
                    <Slider
                      value={[formData.mentalClarity]}
                      onValueChange={(v) => setFormData({ ...formData, mentalClarity: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Decision Fatigue: {formData.decisionFatigue}/10</Label>
                    <Slider
                      value={[formData.decisionFatigue]}
                      onValueChange={(v) => setFormData({ ...formData, decisionFatigue: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Work Hours Today</Label>
                      <Input
                        type="number"
                        value={formData.workHours}
                        onChange={(e) => setFormData({ ...formData, workHours: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meetings Count</Label>
                      <Input
                        type="number"
                        value={formData.meetingsCount}
                        onChange={(e) => setFormData({ ...formData, meetingsCount: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Caffeine (mg)</Label>
                      <Input
                        type="number"
                        value={formData.caffeineIntake}
                        onChange={(e) => setFormData({ ...formData, caffeineIntake: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Screen Time (hours)</Label>
                      <Input
                        type="number"
                        value={formData.screenTimeHours}
                        onChange={(e) => setFormData({ ...formData, screenTimeHours: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Optimize My Day
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              {analysis ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Cognitive Load</CardTitle>
                        <span className={`text-3xl font-bold ${getCognitiveColor(analysis.cognitive_load_score)}`}>
                          {analysis.cognitive_load_score}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={analysis.cognitive_load_score} className="h-3 mb-2" />
                      <Badge variant={analysis.cognitive_status === "Optimal" || analysis.cognitive_status === "Good" ? "secondary" : "destructive"}>
                        {analysis.cognitive_status}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent" />
                        Optimal Workout Windows
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.optimal_workout_windows?.map((window: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                            <div>
                              <p className="font-medium">{window.time}</p>
                              <p className="text-xs text-muted-foreground">{window.reason}</p>
                            </div>
                            <Badge variant="outline">{window.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Recommended Workout
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium">{analysis.recommended_workout_today?.type}</p>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{analysis.recommended_workout_today?.duration}</Badge>
                          <Badge variant="outline">{analysis.recommended_workout_today?.intensity}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Focus: {analysis.recommended_workout_today?.focus}</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.recommended_workout_today?.exercises?.map((ex: string, i: number) => (
                          <Badge key={i} variant="outline">{ex}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-accent" />
                        Caffeine Guidance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{analysis.caffeine_guidance?.current_assessment}</p>
                      <p className="text-sm text-accent mb-1">{analysis.caffeine_guidance?.recommendation}</p>
                      <p className="text-xs text-muted-foreground">Cutoff: {analysis.caffeine_guidance?.cutoff_time}</p>
                    </CardContent>
                  </Card>

                  {analysis.stress_management_protocol?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Battery className="w-5 h-5 text-accent" />
                          Stress Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.stress_management_protocol.slice(0, 3).map((tech: any, i: number) => (
                            <div key={i} className="p-2 bg-secondary/30 rounded">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{tech.technique}</p>
                                <Badge variant="outline">{tech.duration}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">When: {tech.when}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">AI Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{analysis.ai_insights}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Enter your workload data to get personalized recommendations</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExecutiveMode;
