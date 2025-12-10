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
import { Loader2, Moon, Zap, Activity, Lock, RefreshCw, Heart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const SleepAdaptive = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isElite = subscription?.subscribed;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sleepHours: 7,
    sleepQuality: 6,
    sleepDisruptions: 1,
    hrvReading: "",
    restingHeartRate: "",
    age: 45,
    plannedWorkout: {
      type: "Strength Training",
      exercises: [
        { name: "Squats", sets: 4, reps: "8-10" },
        { name: "Bench Press", sets: 4, reps: "8-10" },
        { name: "Barbell Rows", sets: 4, reps: "8-10" },
        { name: "Overhead Press", sets: 3, reps: "10-12" },
      ],
      duration: "60 min",
      intensity: "High",
    },
  });
  const [adaptation, setAdaptation] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isElite) {
      toast({
        title: "Elite Feature",
        description: "Upgrade to Elite to access Sleep-Adaptive Workouts.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-sleep-adaptation", {
        body: formData,
      });

      if (error) throw error;
      setAdaptation(data);

      // Save to database
      await supabase.from("sleep_workout_adaptations").insert({
        user_id: user.id,
        sleep_hours: formData.sleepHours,
        sleep_quality: formData.sleepQuality,
        sleep_disruptions: formData.sleepDisruptions,
        hrv_reading: formData.hrvReading ? parseFloat(formData.hrvReading) : null,
        resting_heart_rate: formData.restingHeartRate ? parseInt(formData.restingHeartRate) : null,
        readiness_score: data.readiness_score,
        original_workout_plan: formData.plannedWorkout,
        adapted_workout_plan: data.adapted_workout,
        intensity_modifier: data.intensity_modifier,
        volume_modifier: data.volume_modifier,
        exercise_swaps: data.exercise_swaps,
        recovery_additions: data.recovery_additions,
        ai_reasoning: data.ai_reasoning,
      });

      toast({
        title: "Workout Adapted",
        description: "Your workout has been optimized based on your sleep data.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to adapt workout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  if (!isElite) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 md:pt-28 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Sleep-Adaptive Auto-Programming</CardTitle>
                <CardDescription>
                  AI that automatically modifies your workouts based on sleep quality, HRV, and recovery metrics. Never push too hard when your body needs rest.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <Moon className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Sleep Analysis</p>
                      <p className="text-xs text-muted-foreground">Quality matters</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">HRV Integration</p>
                      <p className="text-xs text-muted-foreground">Readiness scoring</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Auto-Adaptation</p>
                      <p className="text-xs text-muted-foreground">Smart modifications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Recovery Focus</p>
                      <p className="text-xs text-muted-foreground">Prevent overtraining</p>
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
      <main className="pt-32 md:pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Sleep-Adaptive Auto-Programming</h1>
              <p className="text-muted-foreground">
                Let AI optimize your workout based on how well you slept
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="w-5 h-5" />
                    Sleep & Recovery Data
                  </CardTitle>
                  <CardDescription>Enter your sleep metrics from last night</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Hours of Sleep: {formData.sleepHours}h</Label>
                    <Slider
                      value={[formData.sleepHours]}
                      onValueChange={(v) => setFormData({ ...formData, sleepHours: v[0] })}
                      max={12}
                      min={3}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sleep Quality: {formData.sleepQuality}/10</Label>
                    <Slider
                      value={[formData.sleepQuality]}
                      onValueChange={(v) => setFormData({ ...formData, sleepQuality: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Sleep Disruptions: {formData.sleepDisruptions} times</Label>
                    <Slider
                      value={[formData.sleepDisruptions]}
                      onValueChange={(v) => setFormData({ ...formData, sleepDisruptions: v[0] })}
                      max={10}
                      min={0}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>HRV Reading (optional)</Label>
                      <Input
                        value={formData.hrvReading}
                        onChange={(e) => setFormData({ ...formData, hrvReading: e.target.value })}
                        placeholder="e.g., 45"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Resting HR (optional)</Label>
                      <Input
                        value={formData.restingHeartRate}
                        onChange={(e) => setFormData({ ...formData, restingHeartRate: e.target.value })}
                        placeholder="e.g., 60"
                      />
                    </div>
                  </div>

                  <Card className="bg-secondary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Today's Planned Workout</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <Badge>{formData.plannedWorkout.type}</Badge>
                        <span className="text-sm text-muted-foreground">{formData.plannedWorkout.duration}</span>
                      </div>
                      <div className="space-y-1">
                        {formData.plannedWorkout.exercises.map((ex, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {ex.name}: {ex.sets}x{ex.reps}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Adapt My Workout
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              {adaptation ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Readiness Score</CardTitle>
                        <span className={`text-3xl font-bold ${getReadinessColor(adaptation.readiness_score)}`}>
                          {adaptation.readiness_score}%
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={adaptation.readiness_score} className="h-3 mb-2" />
                      <Badge variant={adaptation.readiness_level === "Excellent" || adaptation.readiness_level === "Good" ? "secondary" : "outline"}>
                        {adaptation.readiness_level}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" />
                        Adapted Workout
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Intensity: {Math.round(adaptation.intensity_modifier * 100)}%
                        </Badge>
                        <Badge variant="outline">
                          Volume: {Math.round(adaptation.volume_modifier * 100)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{adaptation.adapted_workout?.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {adaptation.adapted_workout?.duration} • {adaptation.adapted_workout?.intensity} Intensity
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {adaptation.adapted_workout?.exercises?.map((ex: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                            <span className="text-sm font-medium">{ex.name}</span>
                            <span className="text-sm text-muted-foreground">{ex.sets}x{ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {adaptation.exercise_swaps?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-accent" />
                          Exercise Swaps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {adaptation.exercise_swaps.map((swap: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground line-through">{swap.original}</span>
                              <ArrowRight className="w-4 h-4 text-accent" />
                              <span className="font-medium">{swap.replacement}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {adaptation.recovery_additions?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Recovery Additions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {adaptation.recovery_additions.map((rec: any, i: number) => (
                            <div key={i} className="p-2 bg-secondary/30 rounded">
                              <p className="font-medium text-sm">{rec.activity}</p>
                              <p className="text-xs text-muted-foreground">{rec.duration} • Focus: {rec.focus}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">AI Reasoning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{adaptation.ai_reasoning}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <Moon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Enter your sleep data to see your adapted workout</p>
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

export default SleepAdaptive;
