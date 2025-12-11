import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Utensils, Dumbbell, Pill, ChevronRight, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

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
  supplements: { 
    name: string; 
    dosage: string; 
    timing: string; 
    benefit: string;
  }[];
  timeline: string;
  keyPriorities: string[];
}

interface SavedPlan {
  id: string;
  goals: string;
  plan_data: PersonalPlan;
  created_at: string;
}

export default function AIPlanPreview() {
  const { user } = useAuth();
  const [latestPlan, setLatestPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLatestPlan();
    }
  }, [user]);

  const fetchLatestPlan = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('personal_plans')
        .select('id, goals, plan_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLatestPlan({
          ...data,
          plan_data: data.plan_data as unknown as PersonalPlan
        });
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading AI Plan...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No plan yet - show CTA to create one
  if (!latestPlan) {
    return (
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI Personal Plan
          </CardTitle>
          <CardDescription>Get a comprehensive diet, workout, and supplement protocol</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Generate a personalized fitness plan tailored to your goals, experience level, and preferences. 
            Your plan will include daily meal recommendations, weekly workout schedules, and supplement timing.
          </p>
          <Button asChild>
            <Link to="/personal-plan">
              <Plus className="h-4 w-4 mr-2" />
              Create Your Plan
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const plan = latestPlan.plan_data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Your AI Personal Plan
          </CardTitle>
          <CardDescription className="flex items-center gap-2 mt-1">
            <Calendar className="h-3 w-3" />
            Created {format(new Date(latestPlan.created_at), 'MMM d, yyyy')}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/personal-plan" className="flex items-center gap-1">
            Manage Plans <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {/* Key Priorities */}
        {plan.keyPriorities && plan.keyPriorities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Key Priorities</p>
            <div className="flex flex-wrap gap-2">
              {plan.keyPriorities.slice(0, 3).map((priority, i) => (
                <Badge key={i} variant="secondary">{priority}</Badge>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="diet" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="diet" className="gap-1">
              <Utensils className="h-3 w-3" />
              <span className="hidden sm:inline">Diet</span>
            </TabsTrigger>
            <TabsTrigger value="workout" className="gap-1">
              <Dumbbell className="h-3 w-3" />
              <span className="hidden sm:inline">Workout</span>
            </TabsTrigger>
            <TabsTrigger value="supplements" className="gap-1">
              <Pill className="h-3 w-3" />
              <span className="hidden sm:inline">Supps</span>
            </TabsTrigger>
          </TabsList>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-lg font-bold text-primary">{plan.diet.dailyCalories}</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-lg font-bold text-primary">{plan.diet.macros.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-lg font-bold text-primary">{plan.diet.macros.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-lg font-bold text-primary">{plan.diet.macros.fats}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
            {plan.diet.mealPlan && plan.diet.mealPlan.length > 0 && (
              <div className="space-y-2">
                {plan.diet.mealPlan.slice(0, 3).map((meal, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                    <span className="font-medium">{meal.meal}</span>
                    <span className="text-muted-foreground">{meal.calories} cal</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Workout Tab */}
          <TabsContent value="workout" className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{plan.workout.daysPerWeek} days/week</span>
              </div>
              {plan.workout.focusAreas && (
                <div className="flex gap-1 flex-wrap">
                  {plan.workout.focusAreas.slice(0, 2).map((area, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                  ))}
                </div>
              )}
            </div>
            {plan.workout.weeklySchedule && plan.workout.weeklySchedule.length > 0 && (
              <div className="space-y-2">
                {plan.workout.weeklySchedule.slice(0, 4).map((day, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-muted-foreground">{day.focus}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Supplements Tab */}
          <TabsContent value="supplements" className="space-y-2">
            {plan.supplements && plan.supplements.length > 0 ? (
              plan.supplements.slice(0, 4).map((supp, i) => (
                <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{supp.name}</span>
                    <span className="text-muted-foreground text-xs">{supp.timing}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{supp.dosage}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No supplements in plan</p>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/personal-plan">
              View Full Plan Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
