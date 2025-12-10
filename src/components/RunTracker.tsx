import { useState, useEffect, lazy, Suspense, useRef, useCallback, Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Play, Pause, Square, MapPin, Clock, Footprints, Flame, TrendingUp, Target, Settings, Trophy, Plus, Timer, Zap } from 'lucide-react';
import { useRunTracker } from '@/hooks/useRunTracker';
import { RunningLeaderboard } from '@/components/RunningLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Error boundary for map component
class MapErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[300px] md:h-[400px] w-full bg-muted flex items-center justify-center text-muted-foreground rounded-lg">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Map unavailable</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load the map component only on client side
const RunMap = typeof window !== 'undefined' 
  ? lazy(() => import('@/components/RunMap').catch(() => ({
      default: () => (
        <div className="h-[300px] md:h-[400px] w-full bg-muted flex items-center justify-center text-muted-foreground rounded-lg">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Map unavailable</p>
          </div>
        </div>
      )
    })))
  : () => null;

interface Challenge {
  id: string;
  title: string;
  description: string;
  target_count: number;
  xp_reward: number;
  reset_type: string | null;
  category: string;
}

interface UserChallenge {
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  challenge: Challenge;
}

interface IntervalSettings {
  enabled: boolean;
  workSeconds: number;
  restSeconds: number;
  intervals: number; // 0 = unlimited
}

// Format seconds to mm:ss or hh:mm:ss
const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format pace (seconds per km) to mm:ss/km
const formatPace = (secondsPerKm: number): string => {
  if (secondsPerKm === 0 || !isFinite(secondsPerKm)) return '--:--';
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format distance in meters to km with 2 decimal places
const formatDistance = (meters: number): string => {
  return (meters / 1000).toFixed(2);
};

export const RunTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isTracking,
    activeRun,
    currentPosition,
    runHistory,
    isLoading,
    error,
    startRun,
    pauseRun,
    resumeRun,
    stopRun,
    isPaused,
  } = useRunTracker();

  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showIntervalDialog, setShowIntervalDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  // Interval training state
  const [intervalSettings, setIntervalSettings] = useState<IntervalSettings>({
    enabled: false,
    workSeconds: 60,
    restSeconds: 30,
    intervals: 0,
  });
  const [intervalPhase, setIntervalPhase] = useState<'work' | 'rest'>('work');
  const [intervalTimeRemaining, setIntervalTimeRemaining] = useState(0);
  const [completedIntervals, setCompletedIntervals] = useState(0);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Weekly goal state
  const [weeklyGoal, setWeeklyGoal] = useState<{ 
    weekly_distance_km: number; 
    weekly_runs: number;
    current_streak: number;
    longest_streak: number;
  } | null>(null);
  const [goalDistanceInput, setGoalDistanceInput] = useState('10');
  const [goalRunsInput, setGoalRunsInput] = useState('3');
  const [savingGoal, setSavingGoal] = useState(false);
  
  // Running challenges state
  const [runningChallenges, setRunningChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);

  // Interval timer effect
  useEffect(() => {
    if (isTracking && intervalSettings.enabled && !isPaused) {
      // Initialize interval timer on start
      if (intervalTimeRemaining === 0 && completedIntervals === 0) {
        setIntervalTimeRemaining(intervalSettings.workSeconds);
        setIntervalPhase('work');
      }
      
      intervalTimerRef.current = setInterval(() => {
        setIntervalTimeRemaining(prev => {
          if (prev <= 1) {
            // Switch phases
            if (intervalPhase === 'work') {
              // Vibrate if available
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
              toast({ title: '🚶 Rest Phase', description: 'Slow down and recover!' });
              setIntervalPhase('rest');
              return intervalSettings.restSeconds;
            } else {
              // Vibrate if available
              if (navigator.vibrate) navigator.vibrate([500]);
              setCompletedIntervals(c => c + 1);
              toast({ title: '🏃 Work Phase', description: 'Pick up the pace!' });
              setIntervalPhase('work');
              return intervalSettings.workSeconds;
            }
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
      };
    }
  }, [isTracking, intervalSettings.enabled, isPaused, intervalPhase, intervalSettings.workSeconds, intervalSettings.restSeconds]);

  // Reset interval state when run stops
  useEffect(() => {
    if (!isTracking) {
      setIntervalTimeRemaining(0);
      setCompletedIntervals(0);
      setIntervalPhase('work');
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
    }
  }, [isTracking]);

  // Fetch weekly goal and challenges
  useEffect(() => {
    if (user) {
      fetchWeeklyGoal();
      fetchRunningChallenges();
    }
  }, [user]);

  const fetchRunningChallenges = async () => {
    if (!user) return;
    
    try {
      const [{ data: challenges, error: challengesError }, { data: joined, error: joinedError }] = await Promise.all([
        supabase.from('challenges').select('*').eq('category', 'running').eq('is_active', true),
        supabase.from('user_challenges').select('*, challenge:challenges(*)').eq('user_id', user.id),
      ]);
      
      if (challengesError) {
        console.error('Error fetching challenges:', challengesError);
        return;
      }
      
      if (challenges) setRunningChallenges(challenges);
      
      if (joinedError) {
        console.error('Error fetching user challenges:', joinedError);
        return;
      }
      
      if (joined) {
        const runningUserChallenges = joined
          .filter(uc => {
            const challenge = uc.challenge as Challenge | null;
            return challenge?.category === 'running';
          })
          .map(uc => ({
            challenge_id: uc.challenge_id,
            progress: uc.progress,
            is_completed: uc.is_completed,
            challenge: uc.challenge as Challenge,
          }));
        setUserChallenges(runningUserChallenges);
      }
    } catch (err) {
      console.error('Error in fetchRunningChallenges:', err);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;
    setJoiningChallenge(challengeId);
    
    const { error } = await supabase.from('user_challenges').insert({
      user_id: user.id,
      challenge_id: challengeId,
      progress: 0,
    });
    
    if (!error) {
      toast({ title: 'Challenge joined!', description: 'Good luck!' });
      fetchRunningChallenges();
    }
    setJoiningChallenge(null);
  };

  // Calculate challenge progress based on this week/month runs
  const getChallengeProgress = (challenge: Challenge): number => {
    const now = new Date();
    let relevantRuns = runHistory;
    
    if (challenge.reset_type === 'weekly') {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      relevantRuns = runHistory.filter(run => 
        isWithinInterval(new Date(run.started_at), { start: weekStart, end: weekEnd })
      );
    } else if (challenge.reset_type === 'monthly') {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      relevantRuns = runHistory.filter(run => 
        isWithinInterval(new Date(run.started_at), { start: monthStart, end: monthEnd })
      );
    }
    
    // Check if it's a distance or run count challenge
    if (challenge.title.toLowerCase().includes('km') || challenge.title.toLowerCase().includes('10k')) {
      const totalKm = relevantRuns.reduce((sum, r) => sum + (r.distance_meters || 0), 0) / 1000;
      // For single run challenges
      if (challenge.title.toLowerCase().includes('complete a')) {
        const maxSingleRun = Math.max(...relevantRuns.map(r => (r.distance_meters || 0) / 1000), 0);
        return maxSingleRun;
      }
      return totalKm;
    } else {
      // Count unique run days
      const uniqueDays = new Set(relevantRuns.map(r => new Date(r.started_at).toDateString()));
      return uniqueDays.size;
    }
  };

  const fetchWeeklyGoal = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('running_goals')
      .select('weekly_distance_km, weekly_runs, current_streak, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setWeeklyGoal(data);
      setGoalDistanceInput(data.weekly_distance_km.toString());
      setGoalRunsInput(data.weekly_runs.toString());
    }
  };

  const saveWeeklyGoal = async () => {
    if (!user) return;
    setSavingGoal(true);
    
    const goalData = {
      user_id: user.id,
      weekly_distance_km: parseFloat(goalDistanceInput) || 10,
      weekly_runs: parseInt(goalRunsInput) || 3,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('running_goals')
      .upsert(goalData, { onConflict: 'user_id' });

    if (error) {
      toast({ title: 'Error', description: 'Failed to save goal', variant: 'destructive' });
    } else {
      setWeeklyGoal(prev => ({ 
        weekly_distance_km: goalData.weekly_distance_km, 
        weekly_runs: goalData.weekly_runs,
        current_streak: prev?.current_streak || 0,
        longest_streak: prev?.longest_streak || 0,
      }));
      setShowGoalDialog(false);
      toast({ title: 'Goal saved!', description: 'Your weekly running goal has been updated.' });
    }
    setSavingGoal(false);
  };

  // Calculate weekly progress
  const getWeeklyProgress = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const thisWeekRuns = runHistory.filter(run => {
      const runDate = new Date(run.started_at);
      return isWithinInterval(runDate, { start: weekStart, end: weekEnd });
    });

    const totalDistanceKm = thisWeekRuns.reduce((sum, r) => sum + (r.distance_meters || 0), 0) / 1000;
    const totalRuns = thisWeekRuns.length;

    return { totalDistanceKm, totalRuns };
  };

  const weeklyProgress = getWeeklyProgress();

  const handleStop = async () => {
    await stopRun(notes);
    setNotes('');
    setShowStopDialog(false);
    // Refresh goal data and challenges to show updated progress
    await Promise.all([fetchWeeklyGoal(), fetchRunningChallenges()]);
  };

  const mapCenter: [number, number] = currentPosition 
    ? [currentPosition.lat, currentPosition.lng]
    : [40.7128, -74.0060]; // Default to NYC

  const routeCoordinates = activeRun?.coordinates.map(c => [c.lat, c.lng] as [number, number]) || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Weekly Goal Progress */}
      {!isTracking && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Weekly Goal
              </CardTitle>
              <CardDescription>
                {weeklyGoal 
                  ? `${weeklyGoal.weekly_runs} runs • ${weeklyGoal.weekly_distance_km} km this week`
                  : 'Set a weekly running goal to stay motivated'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowGoalDialog(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {weeklyGoal ? (
              <div className="space-y-4">
                {/* Streak Display */}
                <div className="flex items-center justify-center gap-6 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span className="text-2xl font-bold">{weeklyGoal.current_streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{weeklyGoal.longest_streak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Distance: {weeklyProgress.totalDistanceKm.toFixed(1)} / {weeklyGoal.weekly_distance_km} km</span>
                    <span>{Math.min(100, Math.round((weeklyProgress.totalDistanceKm / weeklyGoal.weekly_distance_km) * 100))}%</span>
                  </div>
                  <Progress value={Math.min(100, (weeklyProgress.totalDistanceKm / weeklyGoal.weekly_distance_km) * 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Runs: {weeklyProgress.totalRuns} / {weeklyGoal.weekly_runs}</span>
                    <span>{Math.min(100, Math.round((weeklyProgress.totalRuns / weeklyGoal.weekly_runs) * 100))}%</span>
                  </div>
                  <Progress value={Math.min(100, (weeklyProgress.totalRuns / weeklyGoal.weekly_runs) * 100)} className="h-2" />
                </div>
                {weeklyProgress.totalDistanceKm >= weeklyGoal.weekly_distance_km && weeklyProgress.totalRuns >= weeklyGoal.weekly_runs && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-center text-sm">
                    🎉 Weekly goal achieved! Great work!
                  </div>
                )}
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setShowGoalDialog(true)}>
                Set Weekly Goal
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Running Challenges */}
      {!isTracking && runningChallenges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Running Challenges
            </CardTitle>
            <CardDescription>Join challenges to earn XP and badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {runningChallenges.map((challenge) => {
              const joined = userChallenges.find(uc => uc.challenge_id === challenge.id);
              const progress = getChallengeProgress(challenge);
              const progressPercent = Math.min(100, (progress / challenge.target_count) * 100);
              const isCompleted = progress >= challenge.target_count;
              
              return (
                <div 
                  key={challenge.id}
                  className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50 border-transparent'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{challenge.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {challenge.reset_type === 'weekly' ? 'Weekly' : 'Monthly'}
                        </Badge>
                        {isCompleted && <Badge className="bg-green-600 text-xs">Done!</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>
                      {joined ? (
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{progress.toFixed(1)} / {challenge.target_count}</span>
                            <span className="text-primary">+{challenge.xp_reward} XP</span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">+{challenge.xp_reward} XP reward</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => joinChallenge(challenge.id)}
                            disabled={joiningChallenge === challenge.id}
                            className="h-7 text-xs gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Join
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Running Leaderboard */}
      {!isTracking && (
        <RunningLeaderboard />
      )}

      {/* Active Run Stats */}
      {isTracking && activeRun && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold font-mono">{formatDuration(activeRun.duration)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Footprints className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold font-mono">{formatDistance(activeRun.distance)} km</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Distance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold font-mono">{formatPace(activeRun.currentPace)}/km</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Pace</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold font-mono">{Math.round((activeRun.distance / 1000) * 60)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Calories</p>
              </CardContent>
            </Card>
          </div>

          {/* Interval Training Display */}
          {intervalSettings.enabled && (
            <Card className={`border-2 ${intervalPhase === 'work' ? 'border-orange-500 bg-orange-500/5' : 'border-blue-500 bg-blue-500/5'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {intervalPhase === 'work' ? (
                      <Zap className="h-5 w-5 text-orange-500" />
                    ) : (
                      <Timer className="h-5 w-5 text-blue-500" />
                    )}
                    <span className={`font-bold uppercase tracking-wide ${intervalPhase === 'work' ? 'text-orange-500' : 'text-blue-500'}`}>
                      {intervalPhase === 'work' ? 'Work' : 'Rest'}
                    </span>
                  </div>
                  <Badge variant="outline">
                    Interval {completedIntervals + 1}{intervalSettings.intervals > 0 ? ` / ${intervalSettings.intervals}` : ''}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className={`text-5xl font-bold font-mono ${intervalPhase === 'work' ? 'text-orange-500' : 'text-blue-500'}`}>
                    {formatDuration(intervalTimeRemaining)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {intervalPhase === 'work' ? 'Push your pace!' : 'Recovery time'}
                  </p>
                </div>
                <Progress 
                  value={(intervalTimeRemaining / (intervalPhase === 'work' ? intervalSettings.workSeconds : intervalSettings.restSeconds)) * 100} 
                  className={`h-2 mt-3 ${intervalPhase === 'work' ? '[&>div]:bg-orange-500' : '[&>div]:bg-blue-500'}`}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Map */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isTracking ? 'Live Tracking' : 'Run Tracker'}
          </CardTitle>
          {isPaused && <Badge variant="secondary">Paused</Badge>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-4">
            <MapErrorBoundary>
              <Suspense fallback={<div className="h-[300px] md:h-[400px] w-full bg-muted animate-pulse rounded-lg" />}>
                <RunMap
                  center={mapCenter}
                  currentPosition={currentPosition}
                  routeCoordinates={routeCoordinates}
                />
              </Suspense>
            </MapErrorBoundary>
          </div>

          {/* Interval Training Toggle (before starting) */}
          {!isTracking && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Interval Training</p>
                  <p className="text-xs text-muted-foreground">
                    {intervalSettings.enabled 
                      ? `${intervalSettings.workSeconds}s work / ${intervalSettings.restSeconds}s rest`
                      : 'Customize work/rest periods'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowIntervalDialog(true)}
                  className="h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Switch 
                  checked={intervalSettings.enabled}
                  onCheckedChange={(checked) => setIntervalSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isTracking ? (
              <Button size="lg" onClick={startRun} className="gap-2">
                <Play className="h-5 w-5" />
                {intervalSettings.enabled ? 'Start Intervals' : 'Start Run'}
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button size="lg" variant="outline" onClick={resumeRun} className="gap-2">
                    <Play className="h-5 w-5" />
                    Resume
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" onClick={pauseRun} className="gap-2">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                )}
                <Button size="lg" variant="destructive" onClick={() => setShowStopDialog(true)} className="gap-2">
                  <Square className="h-5 w-5" />
                  Finish
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Run History */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="cursor-pointer flex items-center justify-between"
            onClick={() => setShowHistory(!showHistory)}
          >
            Run History
            <Badge variant="outline">{runHistory.length} runs</Badge>
          </CardTitle>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-4">Loading...</p>
            ) : runHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No runs recorded yet</p>
            ) : (
              <div className="space-y-3">
                {runHistory.slice(0, 10).map((run) => (
                  <div 
                    key={run.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(run.started_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistance(run.distance_meters || 0)} km • {formatDuration(run.duration_seconds || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{formatPace(run.avg_pace_seconds_per_km || 0)}/km</p>
                      <p className="text-sm text-muted-foreground">{run.calories_burned} cal</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Stop Run Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish Run</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeRun && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{formatDistance(activeRun.distance)} km</p>
                  <p className="text-sm text-muted-foreground">Distance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatDuration(activeRun.duration)}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel?"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStopDialog(false)}>Cancel</Button>
            <Button onClick={handleStop}>Save Run</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Settings Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Weekly Running Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-distance">Weekly Distance Goal (km)</Label>
              <Input
                id="goal-distance"
                type="number"
                min="1"
                max="200"
                value={goalDistanceInput}
                onChange={(e) => setGoalDistanceInput(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-runs">Weekly Runs Goal</Label>
              <Input
                id="goal-runs"
                type="number"
                min="1"
                max="14"
                value={goalRunsInput}
                onChange={(e) => setGoalRunsInput(e.target.value)}
                placeholder="3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalDialog(false)}>Cancel</Button>
            <Button onClick={saveWeeklyGoal} disabled={savingGoal}>
              {savingGoal ? 'Saving...' : 'Save Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interval Settings Dialog */}
      <Dialog open={showIntervalDialog} onOpenChange={setShowIntervalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Interval Training Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work-seconds">Work Period (seconds)</Label>
              <Input
                id="work-seconds"
                type="number"
                min="10"
                max="600"
                value={intervalSettings.workSeconds}
                onChange={(e) => setIntervalSettings(prev => ({ 
                  ...prev, 
                  workSeconds: parseInt(e.target.value) || 60 
                }))}
              />
              <p className="text-xs text-muted-foreground">High intensity running phase</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rest-seconds">Rest Period (seconds)</Label>
              <Input
                id="rest-seconds"
                type="number"
                min="10"
                max="300"
                value={intervalSettings.restSeconds}
                onChange={(e) => setIntervalSettings(prev => ({ 
                  ...prev, 
                  restSeconds: parseInt(e.target.value) || 30 
                }))}
              />
              <p className="text-xs text-muted-foreground">Recovery / walking phase</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-intervals">Total Intervals (0 = unlimited)</Label>
              <Input
                id="total-intervals"
                type="number"
                min="0"
                max="50"
                value={intervalSettings.intervals}
                onChange={(e) => setIntervalSettings(prev => ({ 
                  ...prev, 
                  intervals: parseInt(e.target.value) || 0 
                }))}
              />
              <p className="text-xs text-muted-foreground">Leave at 0 for continuous intervals</p>
            </div>

            {/* Preset buttons */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIntervalSettings(prev => ({ ...prev, workSeconds: 30, restSeconds: 30 }))}
                >
                  30/30
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIntervalSettings(prev => ({ ...prev, workSeconds: 60, restSeconds: 30 }))}
                >
                  60/30
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIntervalSettings(prev => ({ ...prev, workSeconds: 90, restSeconds: 60 }))}
                >
                  90/60
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIntervalSettings(prev => ({ ...prev, workSeconds: 120, restSeconds: 60 }))}
                >
                  2min/1min
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIntervalSettings(prev => ({ ...prev, workSeconds: 180, restSeconds: 90 }))}
                >
                  3min/90s
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIntervalSettings(prev => ({ ...prev, workSeconds: 300, restSeconds: 120 }))}
                >
                  5min/2min
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIntervalDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setIntervalSettings(prev => ({ ...prev, enabled: true }));
              setShowIntervalDialog(false);
            }}>
              Enable Intervals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
