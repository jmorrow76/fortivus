import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFasting, FASTING_TYPES, FASTING_SCRIPTURES } from '@/hooks/useFasting';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Flame, 
  BookOpen, 
  Heart, 
  Dumbbell, 
  Utensils,
  Crown,
  Trophy,
  Calendar,
  Play,
  Square,
  History
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const FastingTracker = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    activeFast,
    fastingHistory,
    goals,
    loading,
    elapsedTime,
    startFast,
    endFast,
    getWorkoutRecommendation,
    getNutritionGuidance,
  } = useFasting();

  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('sunrise_sunset');
  const [targetHours, setTargetHours] = useState(12);
  const [prayerIntentions, setPrayerIntentions] = useState('');
  const [scriptureFocus, setScriptureFocus] = useState('');
  const [endNotes, setEndNotes] = useState('');

  const isElite = subscription?.subscribed;

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!isElite) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-40 md:pt-28 pb-16 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <Crown className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Biblical Fasting Tracker</h1>
            <p className="text-muted-foreground mb-6">
              Track your fasting journey with Scripture guidance and workout adjustments.
            </p>
            <Button onClick={() => navigate('/pricing')}>
              Upgrade to Elite
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!activeFast || !activeFast.target_duration_hours) return 0;
    const targetSeconds = activeFast.target_duration_hours * 3600;
    return Math.min((elapsedTime / targetSeconds) * 100, 100);
  };

  const handleStartFast = async () => {
    await startFast(selectedType, targetHours, prayerIntentions, scriptureFocus);
    setShowStartDialog(false);
    setPrayerIntentions('');
    setScriptureFocus('');
    
    // Show toast suggesting to regenerate AI plan
    toast({
      title: "Fast Started",
      description: "Regenerate your AI Plan for fasting-adjusted recommendations.",
      action: (
        <Button variant="outline" size="sm" onClick={() => navigate('/my-progress')}>
          Regenerate Plan
        </Button>
      ),
      duration: 10000,
    });
  };

  const handleEndFast = async () => {
    await endFast(endNotes);
    setShowEndDialog(false);
    setEndNotes('');
  };

  const workoutRec = getWorkoutRecommendation();
  const nutritionGuidance = getNutritionGuidance();
  
  // Stable scripture selection based on day of year
  const dailyScripture = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const index = dayOfYear % FASTING_SCRIPTURES.length;
    return FASTING_SCRIPTURES[index];
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 md:pt-28 pb-16 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-5 w-5 text-accent" />
            <span className="text-sm text-accent font-medium">Elite Feature</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Biblical Fasting Tracker</h1>
          <p className="text-muted-foreground mb-8">
            Draw closer to God through the spiritual discipline of fasting.
          </p>

          {/* Scripture of the Day */}
          <Card className="mb-6 bg-accent/5 border-accent/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-accent mt-1" />
                <div>
                  <p className="text-sm italic text-foreground/80">"{dailyScripture.text}"</p>
                  <p className="text-xs text-muted-foreground mt-1">— {dailyScripture.verse}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Fast Card */}
          {activeFast ? (
            <Card className="mb-6 border-accent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
                      Active Fast
                    </CardTitle>
                    <CardDescription>
                      {FASTING_TYPES.find(t => t.id === activeFast.fasting_type)?.name || activeFast.fasting_type}
                    </CardDescription>
                  </div>
                  <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Square className="h-4 w-4 mr-2" />
                        End Fast
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>End Your Fast</DialogTitle>
                        <DialogDescription>
                          Reflect on your fasting experience.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Reflections & Notes</Label>
                          <Textarea
                            placeholder="How did God speak to you during this fast?"
                            value={endNotes}
                            onChange={(e) => setEndNotes(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button onClick={handleEndFast} className="w-full">
                          Complete Fast
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timer */}
                <div className="text-center py-4">
                  <div className="text-5xl font-mono font-bold mb-2">
                    {formatElapsedTime(elapsedTime)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Started {formatDistanceToNow(new Date(activeFast.started_at))} ago
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(getProgress())}%</span>
                  </div>
                  <Progress value={getProgress()} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    Target: {activeFast.target_duration_hours} hours
                  </p>
                </div>

                {/* Prayer Intentions */}
                {activeFast.prayer_intentions && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      Prayer Intentions
                    </div>
                    <p className="text-sm text-muted-foreground">{activeFast.prayer_intentions}</p>
                  </div>
                )}

                {/* Scripture Focus */}
                {activeFast.scripture_focus && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <BookOpen className="h-4 w-4 text-accent" />
                      Scripture Focus
                    </div>
                    <p className="text-sm text-muted-foreground">{activeFast.scripture_focus}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Fast</h3>
                <p className="text-muted-foreground mb-4">Begin a fast to draw closer to God.</p>
                <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Start a Fast
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Begin Your Fast</DialogTitle>
                      <DialogDescription>
                        Select your fasting type and set your intentions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Fasting Type</Label>
                        <Select value={selectedType} onValueChange={(v) => {
                          setSelectedType(v);
                          const type = FASTING_TYPES.find(t => t.id === v);
                          if (type) setTargetHours(type.defaultHours);
                        }}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FASTING_TYPES.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div>
                                  <div className="font-medium">{type.name}</div>
                                  <div className="text-xs text-muted-foreground">{type.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Scripture: {FASTING_TYPES.find(t => t.id === selectedType)?.scripture}
                        </p>
                      </div>

                      <div>
                        <Label>Target Duration (hours)</Label>
                        <Input
                          type="number"
                          value={targetHours}
                          onChange={(e) => setTargetHours(Math.max(1, parseInt(e.target.value) || 12))}
                          min={1}
                          max={744}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 31 days (744 hours)
                        </p>
                      </div>

                      <div>
                        <Label>Prayer Intentions (optional)</Label>
                        <Textarea
                          placeholder="What are you praying for during this fast?"
                          value={prayerIntentions}
                          onChange={(e) => setPrayerIntentions(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Scripture Focus (optional)</Label>
                        <Input
                          placeholder="e.g., Matthew 6:16-18"
                          value={scriptureFocus}
                          onChange={(e) => setScriptureFocus(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <Button onClick={handleStartFast} className="w-full">
                        Begin Fast
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Guidance and History */}
          <Tabs defaultValue="guidance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="guidance">
                <Dumbbell className="h-4 w-4 mr-2" />
                Guidance
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Trophy className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guidance" className="space-y-4">
              {/* Workout Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Dumbbell className="h-5 w-5" />
                    Workout Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Recommended Intensity</span>
                        <span>{Math.round(workoutRec.intensity * 100)}%</span>
                      </div>
                      <Progress value={workoutRec.intensity * 100} className="h-2" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{workoutRec.message}</p>
                </CardContent>
              </Card>

              {/* Nutrition Guidance */}
              {nutritionGuidance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Utensils className="h-5 w-5" />
                      Nutrition Guidance
                    </CardTitle>
                    <CardDescription>
                      {nutritionGuidance.fastType} • {nutritionGuidance.hoursIn} hours in
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">During Your Fast</h4>
                      <ul className="space-y-1">
                        {nutritionGuidance.duringFast.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-accent">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Breaking Your Fast</h4>
                      <ul className="space-y-1">
                        {nutritionGuidance.breakingFast.map((tip, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-accent">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-accent" />
                    Your Fasting Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-accent">
                        {goals?.total_fasts_completed || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Fasts Completed</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold">
                        {goals?.total_hours_fasted || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Hours Fasted</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-500">
                        {goals?.current_streak || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Streak</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold">
                        {goals?.longest_streak || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Longest Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    Fasting History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fastingHistory.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No completed fasts yet. Begin your journey today.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {fastingHistory.map((fast) => (
                        <div key={fast.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">
                              {FASTING_TYPES.find(t => t.id === fast.fasting_type)?.name || fast.fasting_type}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(fast.started_at), 'MMM d, yyyy')} • {Math.round((fast.actual_duration_minutes || 0) / 60)} hours
                            </div>
                          </div>
                          <Badge variant={fast.completed ? 'default' : 'secondary'}>
                            {fast.completed ? 'Completed' : 'Partial'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default FastingTracker;
