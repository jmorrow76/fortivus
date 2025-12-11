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
import { Loader2, Activity, AlertTriangle, Shield, Lock, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JointAssessment {
  name: string;
  painLevel: number;
  stiffnessLevel: number;
  rangeOfMotion: number;
}

const JointHealth = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isElite = subscription?.subscribed;

  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState(45);
  const [trainingLoad, setTrainingLoad] = useState(5);
  const [joints, setJoints] = useState<JointAssessment[]>([
    { name: "Knees", painLevel: 0, stiffnessLevel: 0, rangeOfMotion: 100 },
    { name: "Lower Back", painLevel: 0, stiffnessLevel: 0, rangeOfMotion: 100 },
    { name: "Shoulders", painLevel: 0, stiffnessLevel: 0, rangeOfMotion: 100 },
  ]);
  const [analysis, setAnalysis] = useState<any>(null);

  const addJoint = () => {
    setJoints([...joints, { name: "", painLevel: 0, stiffnessLevel: 0, rangeOfMotion: 100 }]);
  };

  const removeJoint = (index: number) => {
    setJoints(joints.filter((_, i) => i !== index));
  };

  const updateJoint = (index: number, field: keyof JointAssessment, value: any) => {
    const updated = [...joints];
    updated[index] = { ...updated[index], [field]: value };
    setJoints(updated);
  };

  const handleAnalyze = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!isElite) {
      toast({
        title: "Elite Feature",
        description: "Upgrade to Elite to access Joint Health Analytics.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-joint-health", {
        body: { joints, age, recentTrainingLoad: trainingLoad },
      });

      if (error) throw error;
      setAnalysis(data);

      // Save each joint analysis to database
      for (const jointAnalysis of data.joint_analyses || []) {
        await supabase.from("joint_health_scores").insert({
          user_id: user.id,
          joint_name: jointAnalysis.joint_name,
          pain_level: joints.find(j => j.name === jointAnalysis.joint_name)?.painLevel || 0,
          stiffness_level: joints.find(j => j.name === jointAnalysis.joint_name)?.stiffnessLevel || 0,
          range_of_motion: joints.find(j => j.name === jointAnalysis.joint_name)?.rangeOfMotion || 100,
          recent_training_load: trainingLoad,
          risk_score: jointAnalysis.risk_score,
          risk_factors: jointAnalysis.risk_factors,
          preventive_recommendations: jointAnalysis.preventive_recommendations,
          exercises_to_avoid: jointAnalysis.exercises_to_avoid,
          mobility_protocol: jointAnalysis.mobility_protocol,
          ai_analysis: data.ai_analysis,
        });
      }

      toast({
        title: "Analysis Complete",
        description: "Your joint health report is ready.",
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

  const getRiskColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!isElite) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-40 md:pt-28 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Predictive Joint Health Analytics</CardTitle>
                <CardDescription>
                  AI-powered injury risk prediction that analyzes your joint health and training patterns to prevent injuries before they happen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Risk Prediction</p>
                      <p className="text-xs text-muted-foreground">Identify issues early</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Injury Prevention</p>
                      <p className="text-xs text-muted-foreground">Smart exercise swaps</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Mobility Protocols</p>
                      <p className="text-xs text-muted-foreground">Personalized routines</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Load Management</p>
                      <p className="text-xs text-muted-foreground">Train smarter</p>
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
      <main className="pt-40 md:pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Predictive Joint Health Analytics</h1>
              <p className="text-muted-foreground">
                AI-powered injury risk prediction and prevention protocols
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Joint Assessment</CardTitle>
                  <CardDescription>Rate each joint to identify potential risks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Recent Training Load: {trainingLoad}/10</Label>
                      <Slider
                        value={[trainingLoad]}
                        onValueChange={(v) => setTrainingLoad(v[0])}
                        max={10}
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {joints.map((joint, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Input
                            value={joint.name}
                            onChange={(e) => updateJoint(index, "name", e.target.value)}
                            placeholder="Joint name (e.g., Knees)"
                            className="w-40"
                          />
                          {joints.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeJoint(index)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Pain: {joint.painLevel}/10</Label>
                            <Slider
                              value={[joint.painLevel]}
                              onValueChange={(v) => updateJoint(index, "painLevel", v[0])}
                              max={10}
                              min={0}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Stiffness: {joint.stiffnessLevel}/10</Label>
                            <Slider
                              value={[joint.stiffnessLevel]}
                              onValueChange={(v) => updateJoint(index, "stiffnessLevel", v[0])}
                              max={10}
                              min={0}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Range of Motion: {joint.rangeOfMotion}%</Label>
                            <Slider
                              value={[joint.rangeOfMotion]}
                              onValueChange={(v) => updateJoint(index, "rangeOfMotion", v[0])}
                              max={100}
                              min={0}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addJoint} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Joint
                  </Button>

                  <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Activity className="mr-2 h-4 w-4" />
                        Analyze Joint Health
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
                        <CardTitle className="text-lg">Overall Risk Level</CardTitle>
                        <Badge variant={analysis.overall_risk_level === "Low" ? "secondary" : "destructive"}>
                          {analysis.overall_risk_level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{analysis.ai_analysis}</p>
                    </CardContent>
                  </Card>

                  {analysis.joint_analyses?.map((joint: any, i: number) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{joint.joint_name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getRiskColor(joint.risk_score)}`} />
                            <span className="text-sm font-medium">{joint.risk_score}% Risk</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {joint.risk_factors?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Risk Factors</p>
                            <div className="flex flex-wrap gap-1">
                              {joint.risk_factors.map((factor: string, j: number) => (
                                <Badge key={j} variant="outline" className="text-xs">{factor}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {joint.exercises_to_avoid?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-red-500 mb-1">Exercises to Avoid</p>
                            <p className="text-sm">{joint.exercises_to_avoid.join(", ")}</p>
                          </div>
                        )}

                        {joint.preventive_recommendations?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-accent mb-1">Recommendations</p>
                            <ul className="text-sm space-y-1">
                              {joint.preventive_recommendations.slice(0, 3).map((rec: string, j: number) => (
                                <li key={j} className="flex items-start gap-2">
                                  <span className="text-accent">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {analysis.warning_signs?.length > 0 && (
                    <Card className="border-yellow-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          Warning Signs to Watch
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {analysis.warning_signs.map((sign: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-yellow-500">•</span>
                              {sign}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Complete the assessment to see your injury risk analysis</p>
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

export default JointHealth;
