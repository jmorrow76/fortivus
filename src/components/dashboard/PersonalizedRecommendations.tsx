import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Lightbulb, Target, Dumbbell, Utensils, Battery, 
  Calendar, ChevronRight, Pill, Clock, Flame,
  Check, Sparkles, ArrowRight, Loader2, Crown,
  Save, ChevronDown, ChevronUp, FileText, Plus, MapPin,
  AlertTriangle, BookOpen
} from 'lucide-react';
import { OnboardingData } from '@/hooks/queries/useOnboardingQuery';
import { PersonalizedRecommendations as Recommendations } from '@/lib/onboardingUtils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFasting, FASTING_TYPES } from '@/hooks/useFasting';

interface PersonalizedRecommendationsProps {
  recommendations: Recommendations;
  onboardingData: OnboardingData;
}

interface AIPlan {
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

const PersonalizedRecommendations = ({ recommendations, onboardingData }: PersonalizedRecommendationsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { subscription, session, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fasting integration
  const { activeFast, getWorkoutRecommendation, getNutritionGuidance } = useFasting();

  // AI Plan state
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);
  const [aiPlanCreatedAt, setAiPlanCreatedAt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    diet: true,
    workout: true,
    supplements: true,
  });

  // Template creation state
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedDayForTemplate, setSelectedDayForTemplate] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isCreatingAllTemplates, setIsCreatingAllTemplates] = useState(false);
  const [savedTemplateDays, setSavedTemplateDays] = useState<Map<string, string>>(new Map());
  const [isResaving, setIsResaving] = useState(false);
  const [resaveConfirmed, setResaveConfirmed] = useState(false);
  
  // Check if AI plan is out of sync with active fast
  const isPlanOutOfSync = activeFast && aiPlanCreatedAt && new Date(activeFast.started_at) > new Date(aiPlanCreatedAt);

  // Load existing AI plan and saved templates on mount for Elite users
  useEffect(() => {
    if (subscription.subscribed && user) {
      loadExistingPlan();
      loadSavedTemplateDays();
    }
  }, [subscription.subscribed, user]);

  const loadSavedTemplateDays = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('workout_templates')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('description', 'Generated from AI Personal Plan');
      
      if (data) {
        setSavedTemplateDays(new Map(data.map(t => [t.name, t.id])));
      }
    } catch (error) {
      console.error('Error loading saved templates:', error);
    }
  };

  const loadExistingPlan = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('personal_plans')
        .select('plan_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data?.plan_data) {
        setAiPlan(data.plan_data as unknown as AIPlan);
        setAiPlanCreatedAt(data.created_at);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'moderate-high':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleGenerateAIPlan = async () => {
    if (!subscription.subscribed) {
      navigate('/#pricing');
      return;
    }

    setIsGenerating(true);
    try {
      const goalMap: Record<string, string> = {
        'build_muscle': 'Build lean muscle mass and increase strength',
        'lose_fat': 'Lose body fat while maintaining muscle',
        'improve_health': 'Improve overall health and longevity',
        'increase_energy': 'Boost energy levels and daily performance',
      };

      const experienceMap: Record<string, string> = {
        'beginner': 'beginner',
        'returning': 'intermediate',
        'consistent': 'intermediate',
        'advanced': 'advanced',
      };

      const equipmentToLocation: Record<string, string> = {
        'full_gym': 'gym',
        'home_weights': 'home',
        'resistance_bands': 'minimal',
        'bodyweight_only': 'bodyweight',
      };

      const frequencyToTime: Record<string, string> = {
        '1-2': '30',
        '3-4': '45',
        '5-6': '60',
        '7+': '60',
      };

      const goals = goalMap[onboardingData.fitness_goal] || onboardingData.fitness_goal;
      const experienceLevel = experienceMap[onboardingData.experience_level] || 'intermediate';
      const workoutLocation = onboardingData.available_equipment?.length > 0 
        ? equipmentToLocation[onboardingData.available_equipment[0]] || 'gym'
        : 'gym';
      const timeAvailable = frequencyToTime[onboardingData.workout_frequency] || '45';

      const { data, error } = await supabase.functions.invoke("generate-personal-plan", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: {
          goals,
          currentStats: { 
            age: onboardingData.age_range,
            experienceLevel 
          },
          preferences: { 
            diet: onboardingData.dietary_preference,
            workoutLocation,
            timeAvailable,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAiPlan(data.plan);
      setActiveTab('ai-plan');
      toast({
        title: "AI Plan Generated!",
        description: "Your personalized fitness plan is ready",
      });
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!aiPlan || !user) return;

    setIsSaving(true);
    try {
      const goalMap: Record<string, string> = {
        'build_muscle': 'Build lean muscle mass and increase strength',
        'lose_fat': 'Lose body fat while maintaining muscle',
        'improve_health': 'Improve overall health and longevity',
        'increase_energy': 'Boost energy levels and daily performance',
      };

      const planData = JSON.parse(JSON.stringify(aiPlan));
      const { error } = await supabase.from("personal_plans").insert([{
        user_id: user.id,
        goals: goalMap[onboardingData.fitness_goal] || onboardingData.fitness_goal,
        current_stats: { 
          age: onboardingData.age_range,
          experienceLevel: onboardingData.experience_level
        },
        preferences: { 
          diet: onboardingData.dietary_preference,
        },
        plan_data: planData,
      }]);

      if (error) throw error;

      toast({
        title: "Plan Saved!",
        description: "Your plan has been saved and can be accessed anytime.",
      });
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

  const handleOpenTemplateDialog = (dayIndex: number, resave = false) => {
    if (!aiPlan) return;
    const day = aiPlan.workout.weeklySchedule[dayIndex];
    setSelectedDayForTemplate(dayIndex);
    setTemplateName(`${day.day} - ${day.focus}`);
    setIsResaving(resave);
    setShowTemplateDialog(true);
  };

  const getWorkoutLocation = () => {
    const equipmentToLocation: Record<string, string> = {
      'full_gym': 'gym',
      'home_weights': 'home',
      'resistance_bands': 'minimal',
      'bodyweight_only': 'bodyweight',
    };
    return onboardingData.available_equipment?.length > 0 
      ? equipmentToLocation[onboardingData.available_equipment[0]] || 'gym'
      : 'gym';
  };

  const handleCreateWorkoutTemplate = async () => {
    if (!user || !aiPlan || selectedDayForTemplate === null) return;
    
    const day = aiPlan.workout.weeklySchedule[selectedDayForTemplate];
    if (!day.exercises || day.exercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "This workout day has no exercises to create a template from",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingTemplate(true);
    const workoutLocation = getWorkoutLocation();
    const templateKey = templateName.trim() || `${day.day} - ${day.focus}`;
    const existingTemplateId = savedTemplateDays.get(templateKey);

    try {
      let templateId: string;

      if (isResaving && existingTemplateId) {
        // Delete existing template exercises first
        await supabase
          .from("template_exercises")
          .delete()
          .eq("template_id", existingTemplateId);

        // Update the template's updated_at
        await supabase
          .from("workout_templates")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", existingTemplateId);

        templateId = existingTemplateId;
      } else {
        // Create the workout template
        const { data: template, error: templateError } = await supabase
          .from("workout_templates")
          .insert({
            user_id: user.id,
            name: templateKey,
            description: `Generated from AI Personal Plan`,
          })
          .select()
          .single();

        if (templateError) throw templateError;
        templateId = template.id;
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

        // Parse reps - handle formats like "8-12", "10", "8-10 each side"
        const repsMatch = exercise.reps.match(/\d+/);
        const targetReps = repsMatch ? parseInt(repsMatch[0]) : 10;

        // Add exercise to template
        await supabase
          .from("template_exercises")
          .insert({
            template_id: templateId,
            exercise_id: exerciseId,
            sort_order: i,
            target_sets: exercise.sets,
            target_reps: targetReps,
            rest_seconds: 90,
            notes: exercise.notes || null,
          });
      }

      toast({
        title: isResaving ? "Template Updated!" : "Template Created!",
        description: `"${templateKey}" has been ${isResaving ? 'updated' : 'added to your workout templates'}`,
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
      
      // Update saved template days
      setSavedTemplateDays(prev => new Map([...prev, [templateKey, templateId]]));
      
      setShowTemplateDialog(false);
      setSelectedDayForTemplate(null);
      setTemplateName("");
      setIsResaving(false);
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

  const handleCreateAllTemplates = async () => {
    if (!user || !aiPlan) return;
    
    const workoutDays = aiPlan.workout.weeklySchedule.filter(
      day => day.exercises && day.exercises.length > 0
    );
    
    if (workoutDays.length === 0) {
      toast({
        title: "No Workouts",
        description: "No workout days with exercises found to create templates from",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAllTemplates(true);
    const workoutLocation = getWorkoutLocation();
    let createdCount = 0;

    try {
      for (const day of workoutDays) {
        // Create the workout template
        const { data: template, error: templateError } = await supabase
          .from("workout_templates")
          .insert({
            user_id: user.id,
            name: `${day.day} - ${day.focus}`,
            description: `Generated from AI Personal Plan`,
          })
          .select()
          .single();

        if (templateError) {
          console.error("Error creating template:", templateError);
          continue;
        }

        // Add exercises to the template
        for (let i = 0; i < day.exercises.length; i++) {
          const exercise = day.exercises[i];
          
          const { data: existingExercises } = await supabase
            .from("exercises")
            .select("id")
            .ilike("name", `%${exercise.name}%`)
            .limit(1);

          let exerciseId: string;

          if (existingExercises && existingExercises.length > 0) {
            exerciseId = existingExercises[0].id;
          } else {
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

      // Reload saved template days to get the new IDs
      await loadSavedTemplateDays();

      toast({
        title: "Templates Created!",
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
    } catch (error: any) {
      console.error("Error creating templates:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create workout templates",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAllTemplates(false);
    }
  };

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Mission Control
              </CardTitle>
              <CardDescription className="mt-1">
                Based on your assessment • Your personalized fitness command center
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {onboardingData.fitness_goal.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {onboardingData.experience_level}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Active Fasting Alert */}
          {activeFast && (() => {
            const workoutRec = getWorkoutRecommendation();
            const nutritionRec = getNutritionGuidance();
            return (
              <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
                <Flame className="h-4 w-4 text-orange-500" />
                <AlertTitle className="text-orange-600 flex items-center gap-2">
                  Active Fast - Recommendations Adjusted
                </AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You're currently on a <strong>{FASTING_TYPES.find(t => t.id === activeFast.fasting_type)?.name || activeFast.fasting_type}</strong> fast. 
                    Your workout and nutrition recommendations are automatically adjusted.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Workout Guidance</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{workoutRec.message}</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Utensils className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Nutrition Guidance</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {nutritionRec?.duringFast?.[0] || 'Stay hydrated and listen to your body'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/fasting">
                        <BookOpen className="h-3 w-3 mr-1" />
                        View Fasting Tracker
                      </Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })()}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={cn("grid w-full mb-6", aiPlan ? "grid-cols-5" : "grid-cols-4")}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {aiPlan && (
                <TabsTrigger value="ai-plan" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Plan
                </TabsTrigger>
              )}
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Primary Focus</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendations.primaryFocus}</p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Workout Style</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendations.workoutType}</p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Nutrition Tip</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendations.nutritionTip}</p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Battery className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Recovery Priority</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{recommendations.recoveryPriority}</p>
                </div>
              </div>

              {/* Supplement Suggestions */}
              {recommendations.supplementSuggestions.length > 0 && (
                <div className="p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Recommended Supplements</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.supplementSuggestions.map((supp, idx) => (
                      <Badge key={idx} variant="secondary">{supp}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="outline" asChild>
                  <Link to="/profile">
                    Retake Assessment
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </TabsContent>

            {/* Workouts Tab */}
            <TabsContent value="workouts" className="space-y-4">
              {recommendations.suggestedWorkouts.map((workout, idx) => (
                <Card key={idx} className="bg-background">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{workout.name}</CardTitle>
                        <CardDescription>{workout.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workout.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {workout.exercises.map((exercise, exIdx) => (
                        <div 
                          key={exIdx} 
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {exIdx + 1}
                            </div>
                            <div>
                              <span className="font-medium text-sm">{exercise.name}</span>
                              {exercise.notes && (
                                <p className="text-xs text-muted-foreground">{exercise.notes}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.suggestedMeals.map((meal, idx) => (
                  <Card key={idx} className="bg-background">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{meal.meal}</Badge>
                        <span className="text-sm font-medium text-primary">
                          {meal.macros.calories} cal
                        </span>
                      </div>
                      <CardTitle className="text-base mt-2">{meal.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>
                      <div className="flex gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>P: {meal.macros.protein}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                          <span>C: {meal.macros.carbs}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>F: {meal.macros.fat}g</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" asChild className="w-full">
                <Link to="/calories">
                  <Utensils className="h-4 w-4 mr-2" />
                  Open Calorie Tracker
                </Link>
              </Button>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {recommendations.weeklySchedule.map((day, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      day.intensity === 'None' ? 'bg-muted/30' : 'bg-background'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-20 font-medium text-sm">{day.day}</div>
                      <div className="flex items-center gap-2">
                        {day.intensity !== 'None' ? (
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm">{day.focus}</span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getIntensityColor(day.intensity))}
                    >
                      {day.intensity}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center pt-2">
                Based on your {onboardingData.workout_frequency} days/week availability
              </p>
            </TabsContent>

            {/* AI Plan Tab - Only shown when plan exists */}
            {aiPlan && (
              <TabsContent value="ai-plan" className="space-y-6">
                {/* Out of sync warning when fasting started after plan was generated */}
                {isPlanOutOfSync && (
                  <Alert className="border-amber-500/50 bg-amber-500/10">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-600">
                      Plan Not Optimized for Your Fast
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      <p className="text-sm text-muted-foreground">
                        Your current AI Plan was generated before you started fasting. Regenerate it to get fasting-adjusted recommendations.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleGenerateAIPlan}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Regenerate Plan
                          </>
                        )}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Key Priorities */}
                {aiPlan.keyPriorities && aiPlan.keyPriorities.length > 0 && (
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />
                      Key Priorities
                    </h4>
                    <ul className="space-y-2">
                      {aiPlan.keyPriorities.map((priority, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {priority}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Diet Section */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('diet')}
                    className="w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Diet Plan
                    </span>
                    {expandedSections.diet ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expandedSections.diet && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">{aiPlan.diet.dailyCalories}</p>
                          <p className="text-xs text-muted-foreground">Daily Calories</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-500">{aiPlan.diet.macros.protein}g</p>
                          <p className="text-xs text-muted-foreground">Protein</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-amber-500">{aiPlan.diet.macros.carbs}g</p>
                          <p className="text-xs text-muted-foreground">Carbs</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-500">{aiPlan.diet.macros.fats}g</p>
                          <p className="text-xs text-muted-foreground">Fats</p>
                        </div>
                      </div>
                      {aiPlan.diet.mealPlan && (
                        <div className="space-y-2">
                          {aiPlan.diet.mealPlan.map((meal, idx) => (
                            <div key={idx} className="p-3 bg-background rounded-lg border">
                              <div className="flex justify-between items-center mb-2">
                                <Badge variant="secondary">{meal.meal}</Badge>
                                <span className="text-sm text-primary font-medium">{meal.calories} cal</span>
                              </div>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {meal.foods.map((food, fIdx) => (
                                  <li key={fIdx}>• {food}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Workout Section */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('workout')}
                    className="w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Workout Plan ({aiPlan.workout.daysPerWeek} days/week)
                    </span>
                    {expandedSections.workout ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expandedSections.workout && (
                    <div className="p-4 space-y-4">
                      {/* Bulk save button */}
                      {aiPlan.workout.weeklySchedule?.some(day => day.exercises && day.exercises.length > 0) && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreateAllTemplates}
                            disabled={isCreatingAllTemplates}
                          >
                            {isCreatingAllTemplates ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Saving All...
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3 mr-1" />
                                Save All as Templates
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      {aiPlan.workout.weeklySchedule?.map((day, idx) => {
                        const templateKey = `${day.day} - ${day.focus}`;
                        const isSaved = savedTemplateDays.has(templateKey);
                        return (
                          <div key={idx} className="p-3 bg-background rounded-lg border">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium flex items-center gap-2">
                                {day.day}
                                {isSaved && (
                                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                                    <Check className="h-3 w-3" />
                                    Saved
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{day.focus}</Badge>
                                {day.exercises && day.exercises.length > 0 && (
                                  isSaved ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenTemplateDialog(idx, true)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Save className="h-3 w-3 mr-1" />
                                      Resave
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenTemplateDialog(idx)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Save Template
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                            {day.exercises && day.exercises.length > 0 && (
                              <div className="space-y-2">
                                {day.exercises.map((ex, exIdx) => (
                                  <div key={exIdx} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                                    <span>{ex.name}</span>
                                    <span className="text-muted-foreground">{ex.sets} × {ex.reps}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {aiPlan.workout.cardioRecommendation && (
                        <p className="text-sm text-muted-foreground italic">
                          Cardio: {aiPlan.workout.cardioRecommendation}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Supplements Section */}
                {aiPlan.supplements && aiPlan.supplements.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('supplements')}
                      className="w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <span className="font-semibold flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Supplement Protocol
                      </span>
                      {expandedSections.supplements ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    {expandedSections.supplements && (
                      <div className="p-4 space-y-2">
                        {aiPlan.supplements.map((supp, idx) => (
                          <div key={idx} className="p-3 bg-background rounded-lg border">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{supp.name}</p>
                                <p className="text-xs text-muted-foreground">{supp.benefit}</p>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-primary font-medium">{supp.dosage}</p>
                                <p className="text-xs text-muted-foreground">{supp.timing}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleSavePlan} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Plan
                  </Button>
                  <Button variant="outline" onClick={handleGenerateAIPlan} disabled={isGenerating}>
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/personal-plan">
                      <FileText className="h-4 w-4 mr-2" />
                      View All Plans
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Generate AI Plan Button / Upsell - only show if no plan exists yet OR for non-subscribed users */}
          {(!subscription.subscribed || !aiPlan) && (
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    {subscription.subscribed ? (
                      <>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                          <Crown className="h-4 w-4 text-amber-500" />
                          Generate Full AI Personal Plan
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Create a comprehensive AI-powered plan with detailed meal plans, custom macros, 
                          workout programming with exercises, and supplement protocols with dosages.
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-sm mb-1">Want a deeper, AI-powered plan?</h4>
                        <p className="text-xs text-muted-foreground">
                          Elite members get custom AI Personal Plans with full meal plans, detailed macros, 
                          saveable workout templates, supplement protocols with dosages, and more.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['Full meal plans', 'Custom macros', 'Saveable plans', 'Workout templates'].map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateAIPlan} 
                  disabled={isGenerating}
                  className="shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : subscription.subscribed ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Plan
                    </>
                  ) : (
                    <>
                      Upgrade to Elite
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Creation Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={(open) => {
        setShowTemplateDialog(open);
        if (!open) {
          setIsResaving(false);
          setResaveConfirmed(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isResaving ? 'Update Workout Template' : 'Save as Workout Template'}</DialogTitle>
            <DialogDescription>
              {isResaving 
                ? 'Update this template with the latest exercises from your AI plan.'
                : 'Create a reusable template from this workout day that you can use anytime.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isResaving && !resaveConfirmed && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive mb-2">Warning: This will replace all existing exercises</p>
                <p className="text-xs text-muted-foreground">
                  The current exercises in this template will be permanently replaced with the exercises from your AI plan. This action cannot be undone.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Monday - Upper Body"
                disabled={isResaving}
              />
              {isResaving && (
                <p className="text-xs text-muted-foreground">Template name cannot be changed when resaving</p>
              )}
            </div>

            {selectedDayForTemplate !== null && aiPlan && (
              <div className="space-y-2">
                <Label>Exercises to {isResaving ? 'Replace With' : 'Include'}</Label>
                <div className="max-h-48 overflow-y-auto space-y-1 p-3 bg-muted/50 rounded-lg">
                  {aiPlan.workout.weeklySchedule[selectedDayForTemplate].exercises?.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <span>{ex.name}</span>
                      <span className="text-muted-foreground">{ex.sets} × {ex.reps}</span>
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
            {isResaving && !resaveConfirmed ? (
              <Button 
                variant="destructive" 
                onClick={() => setResaveConfirmed(true)}
              >
                I Understand, Continue
              </Button>
            ) : (
              <Button onClick={handleCreateWorkoutTemplate} disabled={isCreatingTemplate}>
                {isCreatingTemplate ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isResaving ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isResaving ? 'Update Template' : 'Create Template'}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PersonalizedRecommendations;
