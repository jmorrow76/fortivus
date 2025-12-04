import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Smile,
  Meh,
  Frown,
  Brain,
  Zap,
  Moon,
  Loader2,
  CheckCircle2,
  Dumbbell,
  Heart,
  Timer,
  Flame,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface WorkoutRecommendation {
  workoutType: string;
  intensity: string;
  duration: number;
  title: string;
  description: string;
  exercises: Array<{
    name: string;
    sets: number | null;
    reps: string;
    notes?: string;
  }>;
  warmup: string;
  cooldown: string;
  motivationalNote: string;
}

interface CheckinData {
  id: string;
  mood_level: number;
  stress_level: number;
  energy_level: number;
  sleep_quality: number | null;
  notes: string | null;
  workout_recommendation: WorkoutRecommendation | null;
  check_in_date: string;
  created_at: string;
}

const MoodCheckin = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [todayCheckin, setTodayCheckin] = useState<CheckinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  // Form state
  const [moodLevel, setMoodLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      fetchTodayCheckin();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTodayCheckin = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("mood_checkins")
        .select("*")
        .eq("user_id", user!.id)
        .eq("check_in_date", today)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setTodayCheckin({
          ...data,
          workout_recommendation: data.workout_recommendation as unknown as WorkoutRecommendation | null
        });
      }
    } catch (error) {
      console.error("Error fetching check-in:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateWorkoutRecommendation = async (): Promise<WorkoutRecommendation | null> => {
    setGeneratingWorkout(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-workout-recommendation",
        {
          body: {
            moodLevel,
            stressLevel,
            energyLevel,
            sleepQuality,
            notes,
          },
        }
      );

      if (error) throw error;
      return data.recommendation;
    } catch (error) {
      console.error("Error generating workout:", error);
      return null;
    } finally {
      setGeneratingWorkout(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !session) return;

    setSubmitting(true);

    try {
      // Generate workout recommendation
      const recommendation = await generateWorkoutRecommendation();

      const today = format(new Date(), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("mood_checkins")
        .upsert({
          user_id: user.id,
          mood_level: moodLevel,
          stress_level: stressLevel,
          energy_level: energyLevel,
          sleep_quality: sleepQuality,
          notes: notes.trim() || null,
          workout_recommendation: recommendation as any,
          check_in_date: today,
        }, {
          onConflict: 'user_id,check_in_date'
        })
        .select()
        .single();

      if (error) throw error;

      setTodayCheckin({
        ...data,
        workout_recommendation: data.workout_recommendation as unknown as WorkoutRecommendation | null
      });

      toast({
        title: "Check-in complete!",
        description: "Your personalized workout is ready.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save check-in",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerateWorkout = async () => {
    if (!user || !todayCheckin) return;

    setGeneratingWorkout(true);
    try {
      const recommendation = await generateWorkoutRecommendation();

      const { error } = await supabase
        .from("mood_checkins")
        .update({ workout_recommendation: recommendation as any })
        .eq("id", todayCheckin.id);

      if (error) throw error;

      setTodayCheckin((prev) =>
        prev ? { ...prev, workout_recommendation: recommendation } : null
      );

      toast({
        title: "Workout regenerated!",
        description: "Here's a fresh recommendation for you.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate workout",
        variant: "destructive",
      });
    } finally {
      setGeneratingWorkout(false);
    }
  };

  const renderLevelSelector = (
    label: string,
    icon: React.ElementType,
    value: number,
    onChange: (val: number) => void,
    labels: string[]
  ) => {
    const Icon = icon;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-accent" />
          {label}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                value === level
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
              }`}
            >
              {labels[level - 1]}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderWorkoutRecommendation = (recommendation: WorkoutRecommendation) => {
    const typeIcons: Record<string, React.ElementType> = {
      strength: Dumbbell,
      cardio: Flame,
      flexibility: Heart,
      recovery: Moon,
      active_recovery: Heart,
    };
    const TypeIcon = typeIcons[recommendation.workoutType] || Dumbbell;

    const intensityColors: Record<string, string> = {
      low: "bg-green-500/10 text-green-500",
      moderate: "bg-yellow-500/10 text-yellow-500",
      high: "bg-red-500/10 text-red-500",
    };

    return (
      <Card className="mt-6 border-accent/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TypeIcon className="h-5 w-5 text-accent" />
                {recommendation.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {recommendation.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRegenerateWorkout}
              disabled={generatingWorkout}
            >
              <RefreshCw className={`h-4 w-4 ${generatingWorkout ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant="secondary" className="capitalize">
              {recommendation.workoutType.replace("_", " ")}
            </Badge>
            <Badge className={intensityColors[recommendation.intensity]}>
              {recommendation.intensity} intensity
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {recommendation.duration} min
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Warmup */}
          <div className="p-3 bg-secondary/50 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Warmup</h4>
            <p className="text-sm text-muted-foreground">{recommendation.warmup}</p>
          </div>

          {/* Exercises */}
          <div>
            <h4 className="font-medium text-sm mb-2">Exercises</h4>
            <div className="space-y-2">
              {recommendation.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-sm">{exercise.name}</span>
                    {exercise.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground shrink-0 ml-4">
                    {exercise.sets ? `${exercise.sets} × ` : ""}
                    {exercise.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cooldown */}
          <div className="p-3 bg-secondary/50 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Cooldown</h4>
            <p className="text-sm text-muted-foreground">{recommendation.cooldown}</p>
          </div>

          {/* Motivational Note */}
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm italic text-foreground">
              "{recommendation.motivationalNote}"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <Smile className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">
            Daily Check-in
          </h3>
          <p className="text-sm text-muted-foreground">
            Sign in to track your mood and get personalized workout recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Already checked in today
  if (todayCheckin) {
    const moodEmojis = ["😫", "😕", "😐", "🙂", "😄"];
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Today's Check-in Complete
              </CardTitle>
              <CardDescription>
                {format(new Date(todayCheckin.created_at), "EEEE, MMMM d 'at' h:mm a")}
              </CardDescription>
            </div>
            <span className="text-3xl">{moodEmojis[todayCheckin.mood_level - 1]}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <Smile className="h-4 w-4 mx-auto mb-1 text-accent" />
              <div className="font-medium">{todayCheckin.mood_level}/5</div>
              <div className="text-xs text-muted-foreground">Mood</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <Brain className="h-4 w-4 mx-auto mb-1 text-accent" />
              <div className="font-medium">{todayCheckin.stress_level}/5</div>
              <div className="text-xs text-muted-foreground">Stress</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <Zap className="h-4 w-4 mx-auto mb-1 text-accent" />
              <div className="font-medium">{todayCheckin.energy_level}/5</div>
              <div className="text-xs text-muted-foreground">Energy</div>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
              <Moon className="h-4 w-4 mx-auto mb-1 text-accent" />
              <div className="font-medium">{todayCheckin.sleep_quality || "—"}/5</div>
              <div className="text-xs text-muted-foreground">Sleep</div>
            </div>
          </div>

          {todayCheckin.workout_recommendation && 
            renderWorkoutRecommendation(todayCheckin.workout_recommendation)}
        </CardContent>
      </Card>
    );
  }

  // New check-in form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="h-5 w-5 text-accent" />
          Daily Check-in
        </CardTitle>
        <CardDescription>
          How are you feeling today? We'll customize your workout based on your state.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderLevelSelector(
          "Mood",
          Smile,
          moodLevel,
          setMoodLevel,
          ["😫", "😕", "😐", "🙂", "😄"]
        )}

        {renderLevelSelector(
          "Stress Level",
          Brain,
          stressLevel,
          setStressLevel,
          ["Low", "Mild", "Moderate", "High", "Very High"]
        )}

        {renderLevelSelector(
          "Energy Level",
          Zap,
          energyLevel,
          setEnergyLevel,
          ["Exhausted", "Tired", "OK", "Good", "Great"]
        )}

        {renderLevelSelector(
          "Sleep Quality (last night)",
          Moon,
          sleepQuality,
          setSleepQuality,
          ["Poor", "Fair", "OK", "Good", "Excellent"]
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Anything else we should know? (optional)
          </label>
          <Textarea
            placeholder="e.g., sore from yesterday, feeling motivated, tight schedule..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={500}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {generatingWorkout ? "Generating workout..." : "Saving..."}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Check-in & Get Workout
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MoodCheckin;
