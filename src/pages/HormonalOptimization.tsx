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
import { Loader2, Zap, Moon, Battery, Heart, TrendingUp, Pill, Utensils, Lock } from "lucide-react";

const HormonalOptimization = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isElite = subscription?.subscribed;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: 45,
    sleepHours: 7,
    stressLevel: 5,
    energyMorning: 5,
    energyAfternoon: 5,
    energyEvening: 5,
    libidoLevel: 5,
    recoveryQuality: 5,
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
        description: "Upgrade to Elite to access Hormonal Optimization.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-hormonal", {
        body: formData,
      });

      if (error) throw error;
      setAnalysis(data);

      // Save to database
      await supabase.from("hormonal_profiles").insert({
        user_id: user.id,
        age: formData.age,
        sleep_hours: formData.sleepHours,
        stress_level: formData.stressLevel,
        energy_morning: formData.energyMorning,
        energy_afternoon: formData.energyAfternoon,
        energy_evening: formData.energyEvening,
        libido_level: formData.libidoLevel,
        recovery_quality: formData.recoveryQuality,
        training_intensity_recommendation: data.training_intensity,
        nutrition_recommendations: data.nutrition_recommendations,
        supplement_recommendations: data.supplement_recommendations,
        ai_insights: data.ai_insights,
      });

      toast({
        title: "Analysis Complete",
        description: "Your hormonal optimization plan is ready.",
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

  if (!isElite) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Hormonal Cycle Optimization</CardTitle>
                <CardDescription>
                  Unlock AI-powered testosterone optimization with personalized training and nutrition adjustments based on your natural hormonal fluctuations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">T-Level Optimization</p>
                      <p className="text-xs text-muted-foreground">Train when testosterone peaks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Pill className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Smart Supplementation</p>
                      <p className="text-xs text-muted-foreground">Evidence-based protocols</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Utensils className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Nutrition Timing</p>
                      <p className="text-xs text-muted-foreground">Optimize hormone production</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Energy Management</p>
                      <p className="text-xs text-muted-foreground">All-day vitality</p>
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
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Hormonal Cycle Optimization</h1>
              <p className="text-muted-foreground">
                Optimize your training, nutrition, and recovery based on your natural testosterone patterns
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Assessment</CardTitle>
                  <CardDescription>Rate your current state to get personalized recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hours of Sleep (last night): {formData.sleepHours}h</Label>
                    <Slider
                      value={[formData.sleepHours]}
                      onValueChange={(v) => setFormData({ ...formData, sleepHours: v[0] })}
                      max={12}
                      min={3}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stress Level: {formData.stressLevel}/10</Label>
                    <Slider
                      value={[formData.stressLevel]}
                      onValueChange={(v) => setFormData({ ...formData, stressLevel: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Morning Energy: {formData.energyMorning}/10</Label>
                    <Slider
                      value={[formData.energyMorning]}
                      onValueChange={(v) => setFormData({ ...formData, energyMorning: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Afternoon Energy: {formData.energyAfternoon}/10</Label>
                    <Slider
                      value={[formData.energyAfternoon]}
                      onValueChange={(v) => setFormData({ ...formData, energyAfternoon: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Evening Energy: {formData.energyEvening}/10</Label>
                    <Slider
                      value={[formData.energyEvening]}
                      onValueChange={(v) => setFormData({ ...formData, energyEvening: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Libido Level: {formData.libidoLevel}/10</Label>
                    <Slider
                      value={[formData.libidoLevel]}
                      onValueChange={(v) => setFormData({ ...formData, libidoLevel: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Recovery Quality: {formData.recoveryQuality}/10</Label>
                    <Slider
                      value={[formData.recoveryQuality]}
                      onValueChange={(v) => setFormData({ ...formData, recoveryQuality: v[0] })}
                      max={10}
                      min={1}
                    />
                  </div>

                  <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Get Optimization Plan
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
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Battery className="w-5 h-5 text-accent" />
                        Training Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{analysis.training_intensity}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-accent" />
                        Nutrition Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.nutrition_recommendations?.map((rec: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-accent">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Pill className="w-5 h-5 text-accent" />
                        Supplement Protocol
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.supplement_recommendations?.map((supp: any, i: number) => (
                          <div key={i} className="border-b border-border pb-2 last:border-0 last:pb-0">
                            <p className="font-medium text-sm">{supp.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {supp.dosage} • {supp.timing}
                            </p>
                            <p className="text-xs text-accent">{supp.benefit}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="w-5 h-5 text-accent" />
                        AI Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{analysis.ai_insights}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Complete the assessment to see your personalized hormonal optimization plan</p>
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

export default HormonalOptimization;
