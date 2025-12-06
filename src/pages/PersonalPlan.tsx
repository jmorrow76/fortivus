import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Utensils, Dumbbell, Pill, Target, Clock, ChevronDown, ChevronUp, Lock, Save, History, Trash2, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PersonalPlan {
  diet: {
    dailyCalories: number;
    macros: { protein: number; carbs: number; fats: number };
    mealPlan: { meal: string; foods: string[]; calories: number }[];
    tips: string[];
  };
  workout: {
    daysPerWeek: number;
    focusAreas: string[];
    weeklySchedule: {
      day: string;
      focus: string;
      exercises: { name: string; sets: number; reps: string; notes?: string }[];
    }[];
    cardioRecommendation: string;
  };
  supplements: { name: string; dosage: string; timing: string; benefit: string }[];
  timeline: string;
  keyPriorities: string[];
}

interface SavedPlan {
  id: string;
  goals: string;
  current_stats: { age?: string; weight?: string; height?: string; activityLevel?: string; experienceLevel?: string } | null;
  preferences: { diet?: string; workoutLocation?: string; timeAvailable?: string } | null;
  plan_data: PersonalPlan;
  created_at: string;
}

const PersonalPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, subscription, session } = useAuth();

  const [goals, setGoals] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [dietPreference, setDietPreference] = useState("");
  const [workoutLocation, setWorkoutLocation] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [plan, setPlan] = useState<PersonalPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [expandedSections, setExpandedSections] = useState({
    diet: true,
    workout: true,
    supplements: true,
  });
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedDayForTemplate, setSelectedDayForTemplate] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [showFullWeekDialog, setShowFullWeekDialog] = useState(false);
  const [isCreatingFullWeek, setIsCreatingFullWeek] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch saved plans
  useEffect(() => {
    if (user && subscription.subscribed) {
      fetchSavedPlans();
    }
  }, [user, subscription.subscribed]);

  const fetchSavedPlans = async () => {
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from("personal_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type assertion for the JSONB fields
      const typedData = (data || []).map(item => ({
        ...item,
        current_stats: item.current_stats as unknown as SavedPlan['current_stats'],
        preferences: item.preferences as unknown as SavedPlan['preferences'],
        plan_data: item.plan_data as unknown as PersonalPlan,
      }));
      
      setSavedPlans(typedData);
    } catch (error: any) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan || !user) return;

    setIsSaving(true);
    try {
      const planData = JSON.parse(JSON.stringify(plan));
      const { error } = await supabase.from("personal_plans").insert([{
        user_id: user.id,
        goals,
        current_stats: { age, weight, height, activityLevel, experienceLevel },
        preferences: { diet: dietPreference, workoutLocation, timeAvailable },
        plan_data: planData,
      }]);

      if (error) throw error;

      toast({
        title: "Plan Saved!",
        description: "Your plan has been saved and can be accessed anytime.",
      });

      fetchSavedPlans();
    } catch (error: any) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from("personal_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;

      toast({
        title: "Plan Deleted",
        description: "The plan has been removed.",
      });

      setSavedPlans(prev => prev.filter(p => p.id !== planId));
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  const handleLoadPlan = (savedPlan: SavedPlan) => {
    setGoals(savedPlan.goals);
    setAge(savedPlan.current_stats?.age || "");
    setWeight(savedPlan.current_stats?.weight || "");
    setHeight(savedPlan.current_stats?.height || "");
    setActivityLevel(savedPlan.current_stats?.activityLevel || "");
    setExperienceLevel(savedPlan.current_stats?.experienceLevel || "");
    setDietPreference(savedPlan.preferences?.diet || "");
    setWorkoutLocation(savedPlan.preferences?.workoutLocation || "");
    setTimeAvailable(savedPlan.preferences?.timeAvailable || "");
    setPlan(savedPlan.plan_data);
    setActiveTab("create");
  };

  const handleOpenTemplateDialog = (dayIndex: number) => {
    if (!plan) return;
    const day = plan.workout.weeklySchedule[dayIndex];
    setSelectedDayForTemplate(dayIndex);
    setTemplateName(`${day.day} - ${day.focus}`);
    setShowTemplateDialog(true);
  };

  const handleCreateWorkoutTemplate = async () => {
    if (!user || !plan || selectedDayForTemplate === null) return;
    
    const day = plan.workout.weeklySchedule[selectedDayForTemplate];
    if (!day.exercises || day.exercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "This workout day has no exercises to create a template from",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingTemplate(true);
    try {
      // Create the workout template
      const { data: template, error: templateError } = await supabase
        .from("workout_templates")
        .insert({
          user_id: user.id,
          name: templateName.trim() || `${day.day} - ${day.focus}`,
          description: `Generated from AI Personal Plan: ${goals.substring(0, 100)}`,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Find or create exercises and add them to the template
      for (let i = 0; i < day.exercises.length; i++) {
        const exercise = day.exercises[i];
        
        // Try to find matching exercise in database
        const { data: existingExercises } = await supabase
          .from("exercises")
          .select("id")
          .ilike("name", `%${exercise.name}%`)
          .limit(1);

        let exerciseId: string;

        if (existingExercises && existingExercises.length > 0) {
          exerciseId = existingExercises[0].id;
        } else {
          // Create a custom exercise
          const { data: newExercise, error: exerciseError } = await supabase
            .from("exercises")
            .insert({
              name: exercise.name,
              muscle_group: day.focus.toLowerCase().includes("leg") ? "quadriceps" :
                           day.focus.toLowerCase().includes("chest") ? "chest" :
                           day.focus.toLowerCase().includes("back") ? "back" :
                           day.focus.toLowerCase().includes("shoulder") ? "shoulders" :
                           day.focus.toLowerCase().includes("arm") ? "biceps" :
                           "core",
              equipment: workoutLocation === "bodyweight" ? "bodyweight" : 
                        workoutLocation === "minimal" ? "dumbbells" : "barbell",
              is_custom: true,
              created_by: user.id,
            })
            .select()
            .single();

          if (exerciseError) {
            console.error("Error creating exercise:", exerciseError);
            continue;
          }
          exerciseId = newExercise.id;
        }

        // Parse reps - handle formats like "8-12", "10", "8-10 each side"
        const repsMatch = exercise.reps.match(/\d+/);
        const targetReps = repsMatch ? parseInt(repsMatch[0]) : 10;

        // Add exercise to template
        await supabase
          .from("template_exercises")
          .insert({
            template_id: template.id,
            exercise_id: exerciseId,
            sort_order: i,
            target_sets: exercise.sets,
            target_reps: targetReps,
            rest_seconds: 90,
            notes: exercise.notes || null,
          });
      }

      toast({
        title: "Template Created!",
        description: `"${templateName}" has been added to your workout templates`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/workouts")}
            className="ml-2"
          >
            Go to Workouts
          </Button>
        ),
      });
      
      setShowTemplateDialog(false);
      setSelectedDayForTemplate(null);
      setTemplateName("");
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create workout template",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleCreateFullWeekTemplates = async () => {
    if (!user || !plan) return;
    
    const workoutDays = plan.workout.weeklySchedule.filter(day => day.exercises && day.exercises.length > 0);
    
    if (workoutDays.length === 0) {
      toast({
        title: "No Workouts",
        description: "Your plan doesn't have any workout days with exercises",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingFullWeek(true);
    let createdCount = 0;

    try {
      for (const day of workoutDays) {
        // Create the workout template
        const { data: template, error: templateError } = await supabase
          .from("workout_templates")
          .insert({
            user_id: user.id,
            name: `${day.day} - ${day.focus}`,
            description: `Generated from AI Personal Plan: ${goals.substring(0, 100)}`,
          })
          .select()
          .single();

        if (templateError) {
          console.error("Error creating template:", templateError);
          continue;
        }

        // Find or create exercises and add them to the template
        for (let i = 0; i < day.exercises.length; i++) {
          const exercise = day.exercises[i];
          
          // Try to find matching exercise in database
          const { data: existingExercises } = await supabase
            .from("exercises")
            .select("id")
            .ilike("name", `%${exercise.name}%`)
            .limit(1);

          let exerciseId: string;

          if (existingExercises && existingExercises.length > 0) {
            exerciseId = existingExercises[0].id;
          } else {
            // Create a custom exercise
            const { data: newExercise, error: exerciseError } = await supabase
              .from("exercises")
              .insert({
                name: exercise.name,
                muscle_group: day.focus.toLowerCase().includes("leg") ? "quadriceps" :
                             day.focus.toLowerCase().includes("chest") ? "chest" :
                             day.focus.toLowerCase().includes("back") ? "back" :
                             day.focus.toLowerCase().includes("shoulder") ? "shoulders" :
                             day.focus.toLowerCase().includes("arm") ? "biceps" :
                             "core",
                equipment: workoutLocation === "bodyweight" ? "bodyweight" : 
                          workoutLocation === "minimal" ? "dumbbells" : "barbell",
                is_custom: true,
                created_by: user.id,
              })
              .select()
              .single();

            if (exerciseError) {
              console.error("Error creating exercise:", exerciseError);
              continue;
            }
            exerciseId = newExercise.id;
          }

          // Parse reps
          const repsMatch = exercise.reps.match(/\d+/);
          const targetReps = repsMatch ? parseInt(repsMatch[0]) : 10;

          await supabase
            .from("template_exercises")
            .insert({
              template_id: template.id,
              exercise_id: exerciseId,
              sort_order: i,
              target_sets: exercise.sets,
              target_reps: targetReps,
              rest_seconds: 90,
              notes: exercise.notes || null,
            });
        }
        createdCount++;
      }

      toast({
        title: "Weekly Templates Created!",
        description: `${createdCount} workout templates have been added`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/workouts")}
            className="ml-2"
          >
            Go to Workouts
          </Button>
        ),
      });
      
      setShowFullWeekDialog(false);
    } catch (error: any) {
      console.error("Error creating templates:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create workout templates",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFullWeek(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!goals.trim()) {
      toast({
        title: "Goals Required",
        description: "Please describe your fitness goals",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-personal-plan", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: {
          goals,
          currentStats: { age, weight, height, activityLevel, experienceLevel },
          preferences: { diet: dietPreference, workoutLocation, timeAvailable },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPlan(data.plan);
      toast({
        title: "Plan Generated!",
        description: "Your personalized fitness plan is ready",
      });
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Gate for non-subscribers
  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-accent" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-3">Elite Feature</h2>
              <p className="text-muted-foreground mb-6">
                AI Personal Plans are available exclusively to Fortivus Elite members. Get custom diet, workout, and supplement recommendations tailored to your goals.
              </p>
              <Button onClick={() => navigate("/#pricing")} size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Elite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              Your Personal Plan
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get a custom diet, workout, and supplement protocol designed specifically for your goals and lifestyle.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="create">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Plan
              </TabsTrigger>
              <TabsTrigger value="saved">
                <History className="h-4 w-4 mr-2" />
                Saved Plans ({savedPlans.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              {!plan ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Tell Us About You</CardTitle>
                    <CardDescription>
                      The more details you provide, the more personalized your plan will be.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Goals */}
                    <div>
                      <Label htmlFor="goals" className="text-base font-semibold">
                        What are your fitness goals? *
                      </Label>
                      <Textarea
                        id="goals"
                        placeholder="e.g., Lose 20 lbs of fat while building muscle, improve energy levels, get stronger for golf..."
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        className="mt-2 min-h-[100px]"
                      />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="45"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="185"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          placeholder="5ft 10in"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Dropdowns */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Activity Level</Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                            <SelectItem value="light">Lightly Active (1-2 days/week)</SelectItem>
                            <SelectItem value="moderate">Moderately Active (3-4 days/week)</SelectItem>
                            <SelectItem value="very">Very Active (5+ days/week)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Experience Level</Label>
                        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                            <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Diet Preference</Label>
                        <Select value={dietPreference} onValueChange={setDietPreference}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select diet" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No restrictions</SelectItem>
                            <SelectItem value="lowcarb">Low Carb</SelectItem>
                            <SelectItem value="keto">Keto</SelectItem>
                            <SelectItem value="paleo">Paleo</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Workout Location</Label>
                        <Select value={workoutLocation} onValueChange={setWorkoutLocation}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gym">Full Gym</SelectItem>
                            <SelectItem value="home">Home Gym</SelectItem>
                            <SelectItem value="minimal">Minimal Equipment</SelectItem>
                            <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Time Per Session</Label>
                        <Select value={timeAvailable} onValueChange={setTimeAvailable}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90+ minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleGeneratePlan}
                      disabled={isGenerating || !goals.trim()}
                      size="lg"
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Your Plan...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate My Personal Plan
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Summary Header */}
                  <Card className="bg-accent/5 border-accent/20">
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-6 justify-center text-center">
                        <div>
                          <div className="text-2xl font-bold text-accent">{plan.diet.dailyCalories}</div>
                          <div className="text-sm text-muted-foreground">Daily Calories</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-accent">{plan.workout.daysPerWeek}</div>
                          <div className="text-sm text-muted-foreground">Days/Week</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-accent">{plan.supplements.length}</div>
                          <div className="text-sm text-muted-foreground">Supplements</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Expected Timeline: <span className="font-medium text-foreground">{plan.timeline}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Priorities */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-accent" />
                        Your Key Priorities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.keyPriorities.map((priority, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span>{priority}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Diet Section */}
                  <Card>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleSection("diet")}
                    >
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Utensils className="h-5 w-5 text-accent" />
                          Diet Plan
                        </span>
                        {expandedSections.diet ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.diet && (
                      <CardContent className="space-y-6">
                        {/* Macros */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 rounded-lg bg-secondary">
                            <div className="text-xl font-bold">{plan.diet.macros.protein}g</div>
                            <div className="text-sm text-muted-foreground">Protein</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-secondary">
                            <div className="text-xl font-bold">{plan.diet.macros.carbs}g</div>
                            <div className="text-sm text-muted-foreground">Carbs</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-secondary">
                            <div className="text-xl font-bold">{plan.diet.macros.fats}g</div>
                            <div className="text-sm text-muted-foreground">Fats</div>
                          </div>
                        </div>

                        {/* Meal Plan */}
                        <div>
                          <h4 className="font-semibold mb-3">Sample Meal Plan</h4>
                          <div className="space-y-3">
                            {plan.diet.mealPlan.map((meal, idx) => (
                              <div key={idx} className="p-4 rounded-lg border border-border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{meal.meal}</span>
                                  <span className="text-sm text-muted-foreground">{meal.calories} cal</span>
                                </div>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                  {meal.foods.map((food, i) => (
                                    <li key={i}>{food}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tips */}
                        <div>
                          <h4 className="font-semibold mb-3">Nutrition Tips</h4>
                          <ul className="space-y-2">
                            {plan.diet.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-accent">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Workout Section */}
                  <Card>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleSection("workout")}
                    >
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Dumbbell className="h-5 w-5 text-accent" />
                          Workout Program
                        </span>
                        {expandedSections.workout ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.workout && (
                      <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {plan.workout.focusAreas.map((area, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
                              {area}
                            </span>
                          ))}
                        </div>

                        <div className="space-y-4">
                          {plan.workout.weeklySchedule.map((day, idx) => (
                            <div key={idx} className="p-4 rounded-lg border border-border">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold">{day.day}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-accent">{day.focus}</span>
                                  {day.exercises.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                                      onClick={() => handleOpenTemplateDialog(idx)}
                                    >
                                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                                      Save as Template
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {day.exercises.length > 0 && (
                                <div className="space-y-2">
                                  {day.exercises.map((ex, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                      <span>{ex.name}</span>
                                      <span className="text-muted-foreground">
                                        {ex.sets} x {ex.reps}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="p-4 rounded-lg bg-secondary flex-1">
                            <h4 className="font-semibold mb-2">Cardio Recommendation</h4>
                            <p className="text-sm text-muted-foreground">{plan.workout.cardioRecommendation}</p>
                          </div>
                          
                          {plan.workout.weeklySchedule.filter(d => d.exercises?.length > 0).length > 1 && (
                            <Button
                              variant="default"
                              className="sm:self-center"
                              onClick={() => setShowFullWeekDialog(true)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Save Full Week as Templates
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Supplements Section */}
                  <Card>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleSection("supplements")}
                    >
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Pill className="h-5 w-5 text-accent" />
                          Supplement Protocol
                        </span>
                        {expandedSections.supplements ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </CardTitle>
                    </CardHeader>
                    {expandedSections.supplements && (
                      <CardContent>
                        <div className="space-y-4">
                          {plan.supplements.map((supp, idx) => (
                            <div key={idx} className="p-4 rounded-lg border border-border">
                              <div className="font-semibold mb-1">{supp.name}</div>
                              <div className="grid md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Dosage:</span>{" "}
                                  {supp.dosage}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Timing:</span>{" "}
                                  {supp.timing}
                                </div>
                                <div className="md:col-span-3 mt-1 text-muted-foreground">
                                  {supp.benefit}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleSavePlan} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save This Plan
                    </Button>
                    <Button variant="outline" onClick={() => setPlan(null)}>
                      Generate a New Plan
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              {loadingPlans ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : savedPlans.length === 0 ? (
                <Card className="text-center">
                  <CardContent className="py-12">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-heading text-lg font-bold mb-2">No Saved Plans</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate your first plan and save it to access it anytime.
                    </p>
                    <Button onClick={() => setActiveTab("create")}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {savedPlans.map((savedPlan) => (
                    <Card key={savedPlan.id} className="hover:border-accent/30 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground mb-1">
                              {new Date(savedPlan.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <p className="font-medium line-clamp-2">{savedPlan.goals}</p>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{savedPlan.plan_data.diet.dailyCalories} cal/day</span>
                              <span>{savedPlan.plan_data.workout.daysPerWeek} days/week</span>
                              <span>{savedPlan.plan_data.supplements.length} supplements</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleLoadPlan(savedPlan)}>
                              View Plan
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeletePlan(savedPlan.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workout Template</DialogTitle>
            <DialogDescription>
              This will create a reusable workout template in your Workouts section that you can use to start future workout sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="mt-2"
              />
            </div>
            
            {/* Exercise Preview */}
            {plan && selectedDayForTemplate !== null && plan.workout.weeklySchedule[selectedDayForTemplate]?.exercises && (
              <div>
                <Label className="text-sm text-muted-foreground">Exercises ({plan.workout.weeklySchedule[selectedDayForTemplate].exercises.length})</Label>
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-md divide-y">
                  {plan.workout.weeklySchedule[selectedDayForTemplate].exercises.map((exercise, idx) => (
                    <div key={idx} className="px-3 py-2 text-sm flex justify-between items-center">
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-muted-foreground">{exercise.sets} × {exercise.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkoutTemplate} disabled={isCreatingTemplate}>
              {isCreatingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Week Template Dialog */}
      <Dialog open={showFullWeekDialog} onOpenChange={setShowFullWeekDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Save Full Week as Templates
            </DialogTitle>
            <DialogDescription>
              This will create separate workout templates for each training day in your plan. You can then use these templates to start workouts in the Workout Tracker.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {plan && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Templates to be created ({plan.workout.weeklySchedule.filter(d => d.exercises?.length > 0).length})
                </Label>
                <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
                  {plan.workout.weeklySchedule
                    .filter(day => day.exercises && day.exercises.length > 0)
                    .map((day, idx) => (
                      <div key={idx} className="px-4 py-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{day.day} - {day.focus}</span>
                          <span className="text-xs text-muted-foreground">{day.exercises.length} exercises</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.exercises.slice(0, 3).map(e => e.name).join(", ")}
                          {day.exercises.length > 3 && ` +${day.exercises.length - 3} more`}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFullWeekDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFullWeekTemplates} disabled={isCreatingFullWeek}>
              {isCreatingFullWeek ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create All Templates
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalPlan;
