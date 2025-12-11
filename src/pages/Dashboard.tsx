import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, Trophy, Flame, Target, Dumbbell, Calendar, 
  TrendingUp, Lock, Zap, Settings,
  Crown, Medal, ChevronRight, Users, Camera,
  MapPin, Utensils, MessageCircle,
  Battery, Shield, Moon, RotateCcw, Briefcase, Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutLog } from '@/hooks/useWorkoutLog';
import { 
  useStreakQuery, 
  useBadgesQuery, 
  useUserBadgesQuery,
  useChallengesQuery,
  useUserChallengesQuery,
  useOnboardingQuery,
} from '@/hooks/queries';

import ScriptureOfDay from '@/components/dashboard/ScriptureOfDay';
import CommunityPreview from '@/components/dashboard/CommunityPreview';
import { TrendsDashboard } from '@/components/TrendsDashboard';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import QuickStartFAB from '@/components/QuickStartFAB';
import TooltipTour, { dashboardTourSteps } from '@/components/TooltipTour';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';


interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  has_seen_tour: boolean | null;
}

interface LeaderboardPosition {
  rank: number;
  total: number;
}


interface MoodCheckin {
  id: string;
  mood_level: number;
  energy_level: number;
  check_in_date: string;
}

interface RunningStats {
  totalRuns: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  runningBadges: number;
}

interface ExerciseChartData {
  exerciseName: string;
  data: { date: string; weight: number }[];
  maxWeight: number;
}

interface RecentPR {
  id: string;
  exerciseName: string;
  value: number;
  reps: number | null;
  achievedAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, subscription } = useAuth();
  
  // React Query hooks for gamification data
  const { data: streak, isLoading: streakLoading } = useStreakQuery();
  const { data: badges = [], isLoading: badgesLoading } = useBadgesQuery();
  const { data: userBadges = [], isLoading: userBadgesLoading } = useUserBadgesQuery();
  const { data: challenges = [], isLoading: challengesLoading } = useChallengesQuery();
  const { data: userChallenges = [], isLoading: userChallengesLoading } = useUserChallengesQuery();
  const { data: onboardingData, isLoading: onboardingLoading } = useOnboardingQuery();
  
  const { workouts, getWeeklyStats, loading: workoutsLoading } = useWorkoutLog();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leaderboardPos, setLeaderboardPos] = useState<LeaderboardPosition | null>(null);
  
  const [latestCheckin, setLatestCheckin] = useState<MoodCheckin | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<number>(0);
  const [runningStats, setRunningStats] = useState<RunningStats>({ totalRuns: 0, totalDistanceKm: 0, totalDurationMinutes: 0, runningBadges: 0 });
  const [exerciseChart, setExerciseChart] = useState<ExerciseChartData | null>(null);
  const [recentPRs, setRecentPRs] = useState<RecentPR[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // Compute hasCompletedOnboarding from query data
  const hasCompletedOnboarding = onboardingData !== null && onboardingData !== undefined;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!authLoading && !onboardingLoading && user && onboardingData === null) {
      navigate('/onboarding');
    }
  }, [user, authLoading, onboardingLoading, onboardingData, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [profileRes, leaderboardRes, checkinRes, photosRes, runsRes, runningBadgesRes, prsRes] = await Promise.all([
        supabase.from('profiles').select('display_name, avatar_url, has_seen_tour').eq('user_id', user.id).maybeSingle(),
        supabase.from('leaderboard_view').select('*').order('total_xp', { ascending: false }),
        supabase.from('mood_checkins').select('id, mood_level, energy_level, check_in_date').eq('user_id', user.id).order('check_in_date', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('progress_photos').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('running_sessions').select('distance_meters, duration_seconds').eq('user_id', user.id),
        supabase.from('user_badges').select('badge:badges(requirement_type)').eq('user_id', user.id),
        supabase.from('personal_records').select('id, value, reps_at_weight, achieved_at, exercises(name)').eq('user_id', user.id).order('achieved_at', { ascending: false }).limit(5),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        // Show tour if user hasn't seen it
        if (profileRes.data.has_seen_tour === false) {
          setTimeout(() => setShowTour(true), 500);
        }
      }
      if (checkinRes.data) setLatestCheckin(checkinRes.data);
      if (photosRes.count !== null) setProgressPhotos(photosRes.count);
      
      // Set recent PRs
      if (prsRes.data) {
        setRecentPRs(prsRes.data.map((pr: any) => ({
          id: pr.id,
          exerciseName: pr.exercises?.name || 'Unknown Exercise',
          value: pr.value,
          reps: pr.reps_at_weight,
          achievedAt: pr.achieved_at,
        })));
      }

      // Calculate running stats
      if (runsRes.data) {
        const totalRuns = runsRes.data.length;
        const totalDistanceKm = runsRes.data.reduce((sum, r) => sum + (r.distance_meters || 0), 0) / 1000;
        const totalDurationMinutes = runsRes.data.reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / 60;
        
        // Count running-related badges
        const runningBadgeTypes = ['runs_completed', 'total_distance_km', 'pace_under_6', 'run_duration_30', 'single_run_5km'];
        const runningBadges = (runningBadgesRes.data || []).filter((ub: any) => 
          runningBadgeTypes.includes(ub.badge?.requirement_type)
        ).length;

        setRunningStats({ totalRuns, totalDistanceKm, totalDurationMinutes, runningBadges });
      }

      // Calculate leaderboard position
      if (leaderboardRes.data) {
        const userIndex = leaderboardRes.data.findIndex(entry => entry.user_id === user.id);
        if (userIndex !== -1) {
          setLeaderboardPos({ rank: userIndex + 1, total: leaderboardRes.data.length });
        }
      }

      // Fetch exercise progress for chart preview
      const { data: exerciseData } = await supabase
        .from('exercise_sets')
        .select(`
          weight,
          completed_at,
          exercise_id,
          exercises!inner(id, name),
          workout_sessions!inner(user_id)
        `)
        .eq('is_completed', true)
        .eq('workout_sessions.user_id', user.id)
        .not('weight', 'is', null)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(100);

      if (exerciseData && exerciseData.length > 0) {
        // Find most frequently performed exercise
        const exerciseCounts = new Map<string, { name: string; count: number }>();
        exerciseData.forEach((set: any) => {
          const id = set.exercises.id;
          const existing = exerciseCounts.get(id);
          if (existing) {
            existing.count++;
          } else {
            exerciseCounts.set(id, { name: set.exercises.name, count: 1 });
          }
        });

        // Get top exercise
        const topExercise = Array.from(exerciseCounts.entries())
          .sort((a, b) => b[1].count - a[1].count)[0];

        if (topExercise) {
          const exerciseId = topExercise[0];
          const exerciseName = topExercise[1].name;

          // Get data points for this exercise
          const dataByDate = new Map<string, number>();
          exerciseData
            .filter((set: any) => set.exercises.id === exerciseId)
            .forEach((set: any) => {
              const date = format(new Date(set.completed_at), 'MM/dd');
              const weight = Number(set.weight) || 0;
              const existing = dataByDate.get(date);
              if (!existing || weight > existing) {
                dataByDate.set(date, weight);
              }
            });

          const chartPoints = Array.from(dataByDate.entries())
            .map(([date, weight]) => ({ date, weight }))
            .reverse()
            .slice(-7); // Last 7 data points

          if (chartPoints.length >= 2) {
            setExerciseChart({
              exerciseName,
              data: chartPoints,
              maxWeight: Math.max(...chartPoints.map(p => p.weight)),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const weeklyStats = getWeeklyStats();
  const gamificationLoading = streakLoading || badgesLoading || userBadgesLoading || challengesLoading || userChallengesLoading;
  const isLoading = authLoading || gamificationLoading || workoutsLoading || onboardingLoading || loading;
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const activeChallenges = userChallenges.filter(uc => !uc.is_completed);
  const completedChallenges = userChallenges.filter(uc => uc.is_completed);
  const earnedBadgesCount = userBadges.length;
  const totalBadges = badges.length;

  // Use local date to match check-in date stored in local timezone
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const hasCheckedInToday = latestCheckin?.check_in_date === todayStr;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 md:pt-28 pb-16 px-4">
        <div className="container max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/profile" className="relative group">
                <Avatar className="h-16 w-16 border-2 border-primary group-hover:border-accent transition-colors">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings className="h-5 w-5 text-foreground" />
                </div>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">
                  Member Portal
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {profile?.display_name || 'Warrior'} •{' '}
                  {subscription.subscribed ? (
                    <span className="inline-flex items-center gap-1">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Elite Member
                    </span>
                  ) : (
                    'Free Member'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              {!hasCheckedInToday && (
                <Button asChild>
                  <Link to="/checkin">
                    <Calendar className="h-4 w-4 mr-2" />
                    Daily Check-in
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            {subscription.subscribed && (
              <Button asChild size="lg" className="flex-1 sm:flex-none">
                <Link to="/my-progress">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Fitness Journey
                </Link>
              </Button>
            )}
          </div>

          {/* Scripture of the Day */}
          <div className="mb-8" data-tour="scripture">
            <ScriptureOfDay />
          </div>

          {/* Your Trends */}
          <div className="mb-8">
            <TrendsDashboard />
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-tour="streak-stats">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Flame className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{streak?.current_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/20">
                    <Zap className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{streak?.total_xp || 0}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <Trophy className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{leaderboardPos?.rank || '-'}</p>
                    <p className="text-xs text-muted-foreground">Leaderboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/20">
                    <Medal className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{earnedBadgesCount}/{totalBadges}</p>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
              {/* Weekly Workout Stats */}
              <Card data-tour="weekly-training">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      This Week's Training
                    </CardTitle>
                    <CardDescription>Your workout activity</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/workouts" className="flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-primary">{weeklyStats.totalWorkouts}</p>
                      <p className="text-sm text-muted-foreground">Workouts</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-primary">{weeklyStats.totalMinutes}</p>
                      <p className="text-sm text-muted-foreground">Minutes</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-primary">+{weeklyStats.totalXp}</p>
                      <p className="text-sm text-muted-foreground">XP Earned</p>
                    </div>
                  </div>
                  {workouts.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Recent Workouts</p>
                      {workouts.slice(0, 3).map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="capitalize">{workout.workout_type.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground">
                            {workout.duration_minutes} min • +{workout.xp_earned} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Running Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Running Stats
                    </CardTitle>
                    <CardDescription>Your running achievements</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/running" className="flex items-center gap-1">
                      Track Run <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-primary">{runningStats.totalRuns}</p>
                      <p className="text-sm text-muted-foreground">Total Runs</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-primary">{(runningStats.totalDistanceKm * 0.621371).toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Miles</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-primary">{Math.round(runningStats.totalDurationMinutes)}</p>
                      <p className="text-sm text-muted-foreground">Minutes</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-primary">{runningStats.runningBadges}</p>
                      <p className="text-sm text-muted-foreground">Badges</p>
                    </div>
                  </div>
                  {runningStats.totalRuns === 0 && (
                    <div className="mt-4 text-center text-muted-foreground">
                      <p className="text-sm">No runs yet. Start tracking to earn running badges!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Exercise Progress Chart Preview */}
              {exerciseChart && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Exercise Progress
                      </CardTitle>
                      <CardDescription>{exerciseChart.exerciseName} • PR: {exerciseChart.maxWeight} lbs</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/workouts" className="flex items-center gap-1">
                        All Charts <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={exerciseChart.data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                          />
                          <YAxis 
                            domain={['dataMin - 5', 'dataMax + 5']}
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                            formatter={(value: number) => [`${value} lbs`, 'Weight']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Personal Records */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Recent Personal Records
                    </CardTitle>
                    <CardDescription>Your latest PRs</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/workouts" className="flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentPRs.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No PRs yet</p>
                      <Button variant="link" asChild>
                        <Link to="/workouts">Start tracking workouts</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentPRs.map((pr) => (
                        <div key={pr.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-amber-500/20">
                              <Trophy className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium">{pr.exerciseName}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(pr.achievedAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{pr.value} lbs</p>
                            {pr.reps && (
                              <p className="text-xs text-muted-foreground">{pr.reps} reps</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Badges */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Medal className="h-5 w-5" />
                      Recent Badges
                    </CardTitle>
                    <CardDescription>{earnedBadgesCount} of {totalBadges} earned</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/achievements" className="flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {userBadges.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Medal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No badges earned yet</p>
                      <Button variant="link" asChild>
                        <Link to="/checkin">Start your journey</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userBadges.slice(0, 8).map((ub) => {
                        const badge = ub.badge;
                        return (
                          <Badge key={ub.id} variant="secondary" className="px-3 py-2">
                            <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                            {badge.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Challenges */}
              <Card data-tour="community">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Active Challenges
                    </CardTitle>
                    <CardDescription>{activeChallenges.length} in progress</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/achievements" className="flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {activeChallenges.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No active challenges</p>
                      <Button variant="link" asChild>
                        <Link to="/achievements">Join a challenge</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeChallenges.slice(0, 3).map((uc) => {
                        const challenge = uc.challenge as any;
                        const progressPercent = (uc.progress / challenge.target_count) * 100;
                        return (
                          <div key={uc.challenge_id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{challenge.title}</span>
                              <span className="text-sm text-muted-foreground">
                                {uc.progress}/{challenge.target_count}
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Community Preview */}
              <CommunityPreview />
          </div>
        </div>
      </main>
      <QuickStartFAB />
      <TooltipTour
        steps={dashboardTourSteps}
        isOpen={showTour}
        onComplete={async () => {
          setShowTour(false);
          if (user) {
            await supabase
              .from('profiles')
              .update({ has_seen_tour: true })
              .eq('user_id', user.id);
          }
        }}
      />
    </div>
  );
}
