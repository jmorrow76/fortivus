import { useState } from 'react';
import { Dumbbell, Clock, Flame, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { format } from 'date-fns';

export function WorkoutLog() {
  const { workouts, loading, logWorkout, deleteWorkout, getWeeklyStats, WORKOUT_TYPES } = useWorkoutLog();
  const [isOpen, setIsOpen] = useState(false);
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weeklyStats = getWeeklyStats();

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Workout Log
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <Dumbbell className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{weeklyStats.totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{weeklyStats.totalMinutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <Flame className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{weeklyStats.totalXp}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Recent Workouts
          </h4>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : workouts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No workouts logged yet. Start tracking!</p>
          ) : (
            <div className="space-y-2">
              {workouts.slice(0, 5).map((workout) => (
                <WorkoutItem
                  key={workout.id}
                  workout={workout}
                  getWorkoutLabel={getWorkoutLabel}
                  onDelete={deleteWorkout}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
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
          <span>{format(new Date(workout.created_at), 'MMM d')}</span>
        </div>
        {workout.notes && (
          <p className="text-xs text-muted-foreground mt-1">{workout.notes}</p>
        )}
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
