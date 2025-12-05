import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Dumbbell } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}

interface ExerciseDataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  bestSet: string;
}

const ExerciseProgressChart = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [chartData, setChartData] = useState<ExerciseDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch exercises that user has performed
  useEffect(() => {
    const fetchUserExercises = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('exercise_sets')
        .select(`
          exercise_id,
          exercises!inner(id, name, muscle_group)
        `)
        .eq('is_completed', true)
        .not('weight', 'is', null);

      if (error) {
        console.error('Error fetching user exercises:', error);
        return;
      }

      // Get unique exercises
      const uniqueExercises = new Map<string, Exercise>();
      data?.forEach((item: any) => {
        if (!uniqueExercises.has(item.exercises.id)) {
          uniqueExercises.set(item.exercises.id, {
            id: item.exercises.id,
            name: item.exercises.name,
            muscle_group: item.exercises.muscle_group,
          });
        }
      });

      const exerciseList = Array.from(uniqueExercises.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      
      setExercises(exerciseList);
      if (exerciseList.length > 0 && !selectedExercise) {
        setSelectedExercise(exerciseList[0].id);
      }
    };

    fetchUserExercises();
  }, [user]);

  // Fetch progress data for selected exercise
  useEffect(() => {
    const fetchExerciseProgress = async () => {
      if (!user || !selectedExercise) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('exercise_sets')
        .select(`
          weight,
          reps,
          completed_at,
          workout_sessions!inner(user_id, completed_at)
        `)
        .eq('exercise_id', selectedExercise)
        .eq('is_completed', true)
        .eq('workout_sessions.user_id', user.id)
        .not('weight', 'is', null)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: true });

      setLoading(false);

      if (error) {
        console.error('Error fetching exercise progress:', error);
        return;
      }

      // Group by date and calculate max weight per day
      const dataByDate = new Map<string, { maxWeight: number; totalVolume: number; bestReps: number }>();
      
      data?.forEach((set: any) => {
        const date = format(new Date(set.completed_at), 'yyyy-MM-dd');
        const weight = Number(set.weight) || 0;
        const reps = Number(set.reps) || 0;
        const volume = weight * reps;
        
        const existing = dataByDate.get(date);
        if (!existing) {
          dataByDate.set(date, { maxWeight: weight, totalVolume: volume, bestReps: reps });
        } else {
          if (weight > existing.maxWeight) {
            existing.maxWeight = weight;
            existing.bestReps = reps;
          }
          existing.totalVolume += volume;
        }
      });

      const chartPoints: ExerciseDataPoint[] = Array.from(dataByDate.entries())
        .map(([date, values]) => ({
          date,
          maxWeight: values.maxWeight,
          totalVolume: values.totalVolume,
          bestSet: `${values.maxWeight}×${values.bestReps}`,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setChartData(chartPoints);
    };

    fetchExerciseProgress();
  }, [user, selectedExercise]);

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return { direction: 'neutral', change: 0 };
    
    const recent = chartData.slice(-3);
    const older = chartData.slice(0, Math.min(3, chartData.length - 3));
    
    if (older.length === 0) return { direction: 'neutral', change: 0 };
    
    const recentAvg = recent.reduce((sum, d) => sum + d.maxWeight, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.maxWeight, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      direction: change > 2 ? 'up' : change < -2 ? 'down' : 'neutral',
      change: Math.abs(change).toFixed(1),
    };
  };

  const trend = getTrend();
  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.maxWeight)) : 0;
  const selectedExerciseData = exercises.find(e => e.id === selectedExercise);

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Exercise Data Yet</h3>
          <p className="text-muted-foreground">
            Complete some workouts to see your progress charts here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exercise Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select exercise" />
          </SelectTrigger>
          <SelectContent>
            {exercises.map(exercise => (
              <SelectItem key={exercise.id} value={exercise.id}>
                {exercise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedExerciseData && (
          <Badge variant="secondary" className="capitalize">
            {selectedExerciseData.muscle_group}
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground">Max Weight</p>
            <p className="text-2xl font-bold">{maxWeight} lbs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground">Workouts</p>
            <p className="text-2xl font-bold">{chartData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground">Trend</p>
            <div className="flex items-center gap-2">
              {trend.direction === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
              {trend.direction === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
              {trend.direction === 'neutral' && <Minus className="w-5 h-5 text-muted-foreground" />}
              <span className={`text-2xl font-bold ${
                trend.direction === 'up' ? 'text-green-500' : 
                trend.direction === 'down' ? 'text-red-500' : ''
              }`}>
                {trend.change}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground">Best Set</p>
            <p className="text-2xl font-bold">
              {chartData.length > 0 ? chartData[chartData.length - 1].bestSet : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : chartData.length < 2 ? (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Need at least 2 workouts to show chart</p>
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis 
                    domain={['dataMin - 10', 'dataMax + 10']}
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    formatter={(value: number, name: string) => [
                      name === 'maxWeight' ? `${value} lbs` : value,
                      name === 'maxWeight' ? 'Max Weight' : name
                    ]}
                  />
                  <ReferenceLine 
                    y={maxWeight} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="5 5"
                    label={{ value: 'PR', position: 'right', fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxWeight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume Chart */}
      {chartData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Volume (Weight × Reps)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    formatter={(value: number) => [`${value.toLocaleString()} lbs`, 'Volume']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalVolume" 
                    stroke="hsl(var(--secondary-foreground))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--secondary-foreground))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseProgressChart;
