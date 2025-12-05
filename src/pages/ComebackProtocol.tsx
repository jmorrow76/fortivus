import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RotateCcw, Calendar, AlertTriangle, CheckCircle, Lock, Dumbbell, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ComebackProtocol = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isElite = subscription?.isActive;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    daysOff: 14,
    reasonForBreak: "",
    injuryDetails: "",
    currentFitnessLevel: 5,
    previousTrainingFrequency: 4,
    goals: "",
    age: 45,
  });
  const [protocol, setProtocol] = useState<any>(null);

  const handleGenerate = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isElite) {
      toast({
        title: "Elite Feature",
        description: "Upgrade to Elite to access Comeback Protocol.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-comeback-protocol", {
        body: formData,
      });

      if (error) throw error;
      setProtocol(data);

      // Save to database
      await supabase.from("comeback_protocols").insert({
        user_id: user.id,
        days_off: formData.daysOff,
        reason_for_break: formData.reasonForBreak,
        injury_details: formData.injuryDetails,
        current_fitness_level: formData.currentFitnessLevel,
        previous_training_frequency: formData.previousTrainingFrequency,
        goals: formData.goals,
        week_1_protocol: data.week_1_protocol,
        week_2_protocol: data.week_2_protocol,
        week_3_protocol: data.week_3_protocol,
        week_4_protocol: data.week_4_protocol,
        nutrition_adjustments: data.nutrition_adjustments,
        recovery_priorities: data.recovery_priorities,
        warning_signs: data.warning_signs,
        progression_milestones: data.progression_milestones,
        ai_guidance: data.ai_guidance,
      });

      toast({
        title: "Protocol Generated",
        description: "Your 4-week comeback plan is ready.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate protocol",
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
                <CardTitle className="text-2xl">Comeback Protocol System</CardTitle>
                <CardDescription>
                  Smart return-to-fitness guidance after breaks due to injury, illness, vacation, or life circumstances. Never guess how to restart.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">4-Week Programs</p>
                      <p className="text-xs text-muted-foreground">Progressive return plans</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Injury Aware</p>
                      <p className="text-xs text-muted-foreground">Safe modifications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Dumbbell className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Smart Progression</p>
                      <p className="text-xs text-muted-foreground">Volume & intensity ramp</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Utensils className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Nutrition Guidance</p>
                      <p className="text-xs text-muted-foreground">Support your return</p>
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
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Comeback Protocol System</h1>
              <p className="text-muted-foreground">
                Intelligent return-to-training programs after any break
              </p>
            </div>

            {!protocol ? (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Tell Us About Your Break</CardTitle>
                  <CardDescription>We'll create a personalized 4-week return protocol</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Days Off Training: {formData.daysOff}</Label>
                      <Slider
                        value={[formData.daysOff]}
                        onValueChange={(v) => setFormData({ ...formData, daysOff: v[0] })}
                        max={180}
                        min={7}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Break</Label>
                    <Input
                      value={formData.reasonForBreak}
                      onChange={(e) => setFormData({ ...formData, reasonForBreak: e.target.value })}
                      placeholder="e.g., Surgery, vacation, work stress, illness..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Injury Details (if any)</Label>
                    <Textarea
                      value={formData.injuryDetails}
                      onChange={(e) => setFormData({ ...formData, injuryDetails: e.target.value })}
                      placeholder="Describe any injuries or physical limitations..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Fitness Level: {formData.currentFitnessLevel}/10</Label>
                      <Slider
                        value={[formData.currentFitnessLevel]}
                        onValueChange={(v) => setFormData({ ...formData, currentFitnessLevel: v[0] })}
                        max={10}
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Previous Training: {formData.previousTrainingFrequency} days/week</Label>
                      <Slider
                        value={[formData.previousTrainingFrequency]}
                        onValueChange={(v) => setFormData({ ...formData, previousTrainingFrequency: v[0] })}
                        max={7}
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Goals for Return</Label>
                    <Textarea
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      placeholder="What do you want to achieve? Build back muscle, lose weight gained, return to previous strength..."
                    />
                  </div>

                  <Button onClick={handleGenerate} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Protocol...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Generate Comeback Protocol
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your 4-Week Comeback Protocol</CardTitle>
                    <CardDescription>{protocol.ai_guidance}</CardDescription>
                  </CardHeader>
                </Card>

                <Tabs defaultValue="week1" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="week1">Week 1</TabsTrigger>
                    <TabsTrigger value="week2">Week 2</TabsTrigger>
                    <TabsTrigger value="week3">Week 3</TabsTrigger>
                    <TabsTrigger value="week4">Week 4</TabsTrigger>
                  </TabsList>

                  {[1, 2, 3, 4].map((week) => {
                    const weekData = protocol[`week_${week}_protocol`];
                    return (
                      <TabsContent key={week} value={`week${week}`}>
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Week {week}: {weekData?.focus}</CardTitle>
                              <div className="flex gap-2">
                                <Badge variant="outline">{weekData?.intensity} intensity</Badge>
                                <Badge variant="outline">{weekData?.volume} volume</Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Training Days: {weekData?.training_days}</p>
                              <div className="grid gap-2">
                                {weekData?.workouts?.map((workout: any, i: number) => (
                                  <div key={i} className="p-3 bg-secondary/30 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium">{workout.day}: {workout.type}</p>
                                      <Badge variant="secondary">{workout.duration}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{workout.details}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {weekData?.recovery_work?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Recovery Work</p>
                                <div className="flex flex-wrap gap-2">
                                  {weekData.recovery_work.map((item: string, i: number) => (
                                    <Badge key={i} variant="outline">{item}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <p className="text-sm text-accent">{weekData?.key_notes}</p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    );
                  })}
                </Tabs>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-accent" />
                        Nutrition Adjustments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {protocol.nutrition_adjustments?.map((adj: any, i: number) => (
                          <div key={i} className="border-b border-border pb-2 last:border-0">
                            <p className="font-medium text-sm">{adj.phase}</p>
                            <p className="text-sm text-muted-foreground">{adj.focus}</p>
                            {adj.specifics?.slice(0, 2).map((spec: string, j: number) => (
                              <p key={j} className="text-xs text-accent">• {spec}</p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-accent" />
                        Milestones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {protocol.progression_milestones?.map((milestone: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <Badge variant="secondary">Week {milestone.week}</Badge>
                            <p className="text-sm">{milestone.milestone}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {protocol.warning_signs?.length > 0 && (
                  <Card className="border-yellow-500/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Warning Signs to Watch
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {protocol.warning_signs.map((sign: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-yellow-500">•</span>
                            {sign}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Button variant="outline" onClick={() => setProtocol(null)} className="w-full">
                  Generate New Protocol
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComebackProtocol;
