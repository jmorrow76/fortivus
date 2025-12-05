import { useState, useMemo } from 'react';
import { Dumbbell, Clock, Flame, Trash2, Plus, TrendingUp, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWorkoutLog, WorkoutLog as WorkoutLogType } from '@/hooks/useWorkoutLog';
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts';

const COLORS = {
  strength: '#f97316',
  cardio: '#3b82f6',
  hiit: '#ef4444',
  recovery: '#22c55e',
  flexibility: '#a855f7',
};

export function WorkoutLog() {
  const { workouts, loading, logWorkout, deleteWorkout, getWeeklyStats, WORKOUT_TYPES } = useWorkoutLog();
  const [isOpen, setIsOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weeklyStats = getWeeklyStats();

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const monthWorkouts = workouts.filter(w => new Date(w.created_at) >= thirtyDaysAgo);
    return {
      totalWorkouts: monthWorkouts.length,
      totalMinutes: monthWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0),
      totalXp: monthWorkouts.reduce((sum, w) => sum + w.xp_earned, 0),
      avgPerWeek: Math.round(monthWorkouts.length / 4.3),
    };
  }, [workouts]);

  // Workout type distribution
  const workoutTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    workouts.forEach(w => {
      typeCounts[w.workout_type] = (typeCounts[w.workout_type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({
      name: WORKOUT_TYPES.find(t => t.value === name)?.label || name,
      value,
      color: COLORS[name as keyof typeof COLORS] || '#6b7280',
    }));
  }, [workouts, WORKOUT_TYPES]);

  // Weekly activity data (last 4 weeks)
  const weeklyActivityData = useMemo(() => {
    const weeks: { week: string; workouts: number; minutes: number; xp: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = subDays(startOfWeek(subDays(new Date(), (i - 1) * 7)), 1);
      const weekWorkouts = workouts.filter(w => {
        const date = new Date(w.created_at);
        return date >= weekStart && date <= (i === 0 ? new Date() : weekEnd);
      });
      weeks.push({
        week: format(weekStart, 'MMM d'),
        workouts: weekWorkouts.length,
        minutes: weekWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0),
        xp: weekWorkouts.reduce((sum, w) => sum + w.xp_earned, 0),
      });
    }
    return weeks;
  }, [workouts]);

  // Daily activity heatmap data (last 30 days)
  const dailyActivityData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });
    return days.map(day => {
      const dayWorkouts = workouts.filter(w => isSameDay(new Date(w.created_at), day));
      return {
        date: format(day, 'MMM d'),
        shortDate: format(day, 'd'),
        workouts: dayWorkouts.length,
        minutes: dayWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0),
      };
    });
  }, [workouts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutType || !duration) return;

    setIsSubmitting(true);
    await logWorkout(workoutType, parseInt(duration), notes);
    setIsSubmitting(false);
    setIsOpen(false);
    setWorkoutType('');
    setDuration('30');
    setNotes('');
  };

  const getWorkoutLabel = (type: string) => {
    return WORKOUT_TYPES.find(w => w.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header with Log Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            Workout Dashboard
          </h2>
          <p className="text-muted-foreground">Track your training progress</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log a Workout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workout-type">Workout Type</Label>
                <Select value={workoutType} onValueChange={setWorkoutType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workout type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} (+{type.xp} base XP)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground">
                  +5 bonus XP for every 15 minutes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How was your workout?"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || !workoutType}>
                {isSubmitting ? 'Logging...' : 'Log Workout'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{monthlyStats.totalWorkouts}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{monthlyStats.totalMinutes}</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{monthlyStats.totalXp}</p>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{monthlyStats.avgPerWeek}</p>
                <p className="text-xs text-muted-foreground">Avg/Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Last 4 weeks of training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="workouts" name="Workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Workout Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Workout Types
            </CardTitle>
            <CardDescription>Training distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {workoutTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workoutTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {workoutTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No workout data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Daily Activity (Last 30 Days)
          </CardTitle>
          <CardDescription>Minutes trained per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="shortDate" 
                  tick={{ fontSize: 10 }} 
                  interval={2}
                  className="text-muted-foreground" 
                />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => dailyActivityData.find(d => d.shortDate === value)?.date}
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  name="Minutes"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Workouts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Workouts</CardTitle>
          <CardDescription>Your training history</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : workouts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No workouts logged yet. Start tracking!</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workouts.map((workout) => (
                <WorkoutItem
                  key={workout.id}
                  workout={workout}
                  getWorkoutLabel={getWorkoutLabel}
                  onDelete={deleteWorkout}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WorkoutItem({
  workout,
  getWorkoutLabel,
  onDelete,
}: {
  workout: WorkoutLogType;
  getWorkoutLabel: (type: string) => string;
  onDelete: (id: string) => void;
}) {
  const typeColor = COLORS[workout.workout_type as keyof typeof COLORS] || '#6b7280';
  
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: typeColor }}
        />
        <div className="flex-1">
          <p className="font-medium">{getWorkoutLabel(workout.workout_type)}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {workout.duration_minutes} min
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3" />
              +{workout.xp_earned} XP
            </span>
            <span>{format(new Date(workout.created_at), 'MMM d, yyyy')}</span>
          </div>
          {workout.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{workout.notes}</p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(workout.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
