import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Play, Pause, Square, MapPin, Clock, Footprints, Flame, TrendingUp, Target, Settings, Trophy, Plus } from 'lucide-react';
import { useRunTracker } from '@/hooks/useRunTracker';
import { RunningLeaderboard } from '@/components/RunningLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

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

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Simple map recenter hook component
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
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
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
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
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={currentPosition ? [currentPosition.lat, currentPosition.lng] : null} />
              {currentPosition && (
                <Marker 
                  position={[currentPosition.lat, currentPosition.lng]} 
                  icon={defaultIcon}
                />
              )}
              {routeCoordinates.length > 1 && (
                <Polyline 
                  positions={routeCoordinates}
                  color="#3b82f6"
                  weight={4}
                />
              )}
            </MapContainer>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isTracking ? (
              <Button size="lg" onClick={startRun} className="gap-2">
                <Play className="h-5 w-5" />
                Start Run
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
    </div>
  );
};
