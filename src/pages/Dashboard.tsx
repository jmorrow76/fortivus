import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, Trophy, Flame, Target, Dumbbell, Calendar, 
  TrendingUp, Heart, Footprints, Moon, Zap, Lock, 
  Crown, Medal, ChevronRight, Activity, Users, Camera,
  Brain, Sparkles, Apple
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useWorkoutLog } from '@/hooks/useWorkoutLog';
import { useHealthData } from '@/hooks/useHealthData';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { SocialConnections } from '@/components/SocialConnections';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

interface LeaderboardPosition {
  rank: number;
  total: number;
}

interface PersonalPlan {
  id: string;
  goals: string;
  created_at: string;
}

interface MoodCheckin {
  id: string;
  mood_level: number;
  energy_level: number;
  check_in_date: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, subscription } = useAuth();
  const { badges, userBadges, challenges, userChallenges, streak, loading: gamificationLoading } = useGamification();
  const { workouts, getWeeklyStats, loading: workoutsLoading } = useWorkoutLog();
  const { healthData, isAvailable: healthAvailable, isAuthorized: healthAuthorized } = useHealthData();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leaderboardPos, setLeaderboardPos] = useState<LeaderboardPosition | null>(null);
  const [personalPlan, setPersonalPlan] = useState<PersonalPlan | null>(null);
  const [latestCheckin, setLatestCheckin] = useState<MoodCheckin | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [profileRes, leaderboardRes, planRes, checkinRes, photosRes] = await Promise.all([
        supabase.from('profiles').select('display_name, avatar_url').eq('user_id', user.id).maybeSingle(),
        supabase.from('leaderboard_view').select('*').order('total_xp', { ascending: false }),
        supabase.from('personal_plans').select('id, goals, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('mood_checkins').select('id, mood_level, energy_level, check_in_date').eq('user_id', user.id).order('check_in_date', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('progress_photos').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (planRes.data) setPersonalPlan(planRes.data);
      if (checkinRes.data) setLatestCheckin(checkinRes.data);
      if (photosRes.count !== null) setProgressPhotos(photosRes.count);

      // Calculate leaderboard position
      if (leaderboardRes.data) {
        const userIndex = leaderboardRes.data.findIndex(entry => entry.user_id === user.id);
        if (userIndex !== -1) {
          setLeaderboardPos({ rank: userIndex + 1, total: leaderboardRes.data.length });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const weeklyStats = getWeeklyStats();
  const isLoading = authLoading || gamificationLoading || workoutsLoading || loading;

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

  const todayStr = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = latestCheckin?.check_in_date === todayStr;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4">
        <div className="container max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
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
            {!hasCheckedInToday && (
              <Button asChild>
                <Link to="/checkin">
                  <Calendar className="h-4 w-4 mr-2" />
                  Daily Check-in
                </Link>
              </Button>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly Workout Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      This Week's Training
                    </CardTitle>
                    <CardDescription>Your workout activity</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/progress?tab=workouts" className="flex items-center gap-1">
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
              <Card>
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

              {/* Wearable Health Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Health & Activity
                  </CardTitle>
                  <CardDescription>
                    {healthAuthorized ? 'Synced from your device' : 'Connect your wearable to track progress'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {healthAuthorized ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Footprints className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-xl font-bold">{healthData.steps.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Steps</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                        <p className="text-xl font-bold">{healthData.heartRate || '-'}</p>
                        <p className="text-xs text-muted-foreground">Heart Rate</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Moon className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
                        <p className="text-xl font-bold">{healthData.sleepHours || '-'}h</p>
                        <p className="text-xs text-muted-foreground">Sleep</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                        <p className="text-xl font-bold">{healthData.activeCalories || '-'}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <Activity className="h-10 w-10 mx-auto mb-3 text-primary/50" />
                        <p className="font-medium mb-1">Connect Your Wearable</p>
                        <p className="text-sm text-muted-foreground">
                          Sync steps, heart rate, sleep & more to personalize your experience
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="flex flex-col h-auto py-4 gap-2" disabled>
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          <span className="text-xs">Apple Health</span>
                          <span className="text-[10px] text-muted-foreground">iOS App Only</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-auto py-4 gap-2" disabled>
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span className="text-xs">Google Fit</span>
                          <span className="text-[10px] text-muted-foreground">Android App Only</span>
                        </Button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Download our mobile app to connect your wearable devices
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Today's Check-in */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Today's Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasCheckedInToday && latestCheckin ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mood</span>
                        <span className="font-medium">{latestCheckin.mood_level}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Energy</span>
                        <span className="font-medium">{latestCheckin.energy_level}/5</span>
                      </div>
                      <Badge variant="secondary" className="w-full justify-center">
                        ✓ Checked in today
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted-foreground">You haven't checked in today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Plan - Premium Feature */}
              <Card className={!subscription.subscribed ? 'relative overflow-hidden' : ''}>
                {!subscription.subscribed && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <Lock className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Elite Feature</p>
                    <Button size="sm" asChild>
                      <a href="/#pricing">Upgrade</a>
                    </Button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Personal Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {personalPlan ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Current Goal:</p>
                      <p className="font-medium line-clamp-2">{personalPlan.goals}</p>
                      <Button variant="outline" size="sm" asChild className="w-full mt-2">
                        <Link to="/personal-plan">View Plan</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                      <p className="text-sm text-muted-foreground mb-2">Get your personalized plan</p>
                      <Button size="sm" asChild className="w-full">
                        <Link to="/personal-plan">Create Plan</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Body Analysis - Premium Feature */}
              <Card className={!subscription.subscribed ? 'relative overflow-hidden' : ''}>
                {!subscription.subscribed && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <Lock className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Elite Feature</p>
                    <Button size="sm" asChild>
                      <a href="/#pricing">Upgrade</a>
                    </Button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    AI Body Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                    <p className="text-sm text-muted-foreground mb-2">Get your body composition analysis</p>
                    <Button size="sm" asChild className="w-full">
                      <Link to="/body-analysis">Analyze Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Calorie Tracker - Premium Feature */}
              <Card className={!subscription.subscribed ? 'relative overflow-hidden' : ''}>
                {!subscription.subscribed && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <Lock className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Elite Feature</p>
                    <Button size="sm" asChild>
                      <a href="/#pricing">Upgrade</a>
                    </Button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Apple className="h-4 w-4" />
                    Calorie Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500/50" />
                    <p className="text-sm text-muted-foreground mb-2">Track meals & macros</p>
                    <Button size="sm" asChild className="w-full">
                      <Link to="/calories">Track Calories</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Photos - Premium Feature */}
              <Card className={!subscription.subscribed ? 'relative overflow-hidden' : ''}>
                {!subscription.subscribed && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <Lock className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Elite Feature</p>
                    <Button size="sm" asChild>
                      <a href="/#pricing">Upgrade</a>
                    </Button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Progress Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{progressPhotos}</p>
                    <p className="text-sm text-muted-foreground mb-3">Photos uploaded</p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link to="/progress">View Gallery</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <Link to="/leaderboard">
                      <Trophy className="h-4 w-4 mr-2" />
                      Leaderboard
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <Link to="/community">
                      <Users className="h-4 w-4 mr-2" />
                      Activity Feed
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full justify-start">
                    <Link to="/forum">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Forum
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Social Connections */}
              <SocialConnections />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
