import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, Target, Dumbbell, Utensils, Battery, 
  Calendar, ChevronRight, Pill, Clock, Flame,
  Check
} from 'lucide-react';
import { OnboardingData, PersonalizedRecommendations as Recommendations } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

interface PersonalizedRecommendationsProps {
  recommendations: Recommendations;
  onboardingData: OnboardingData;
}

const PersonalizedRecommendations = ({ recommendations, onboardingData }: PersonalizedRecommendationsProps) => {
  const [activeTab, setActiveTab] = useState('overview');

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

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Quick Start Guide
            </CardTitle>
            <CardDescription className="mt-1">
              Based on your assessment • For detailed AI-powered plans, try Elite
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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

            <div className="flex gap-3 pt-2">
              <Button asChild>
                <Link to="/workouts">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Start Workout
                </Link>
              </Button>
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PersonalizedRecommendations;
