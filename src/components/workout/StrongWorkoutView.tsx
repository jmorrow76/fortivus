import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, X, Check, Plus, Search, ChevronRight, Save,
  Dumbbell
} from 'lucide-react';
import { StrongExerciseCard } from './StrongExerciseCard';
import { RestTimerOverlay } from './RestTimerOverlay';
import PRCelebration from '@/components/PRCelebration';
import { WorkoutSession, Exercise, ActiveWorkoutExercise, PRCelebrationData } from '@/hooks/useWorkoutTracker';

interface StrongWorkoutViewProps {
  session: WorkoutSession;
  activeExercises: ActiveWorkoutExercise[];
  exercises: Exercise[];
  userId: string | undefined;
  prCelebration: PRCelebrationData | null;
  onAddExercise: (exercise: Exercise) => void;
  onAddSet: (exerciseId: string) => void;
  onCompleteSet: (setId: string, reps: number, weight: number) => void;
  onDeleteSet: (setId: string, exerciseId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onFinish: () => void;
  onCancel: () => void;
  onSaveAsTemplate: () => void;
  onClearPR: () => void;
}

const muscleGroups = [
  'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'
];

export function StrongWorkoutView({
  session,
  activeExercises,
  exercises,
  userId,
  prCelebration,
  onAddExercise,
  onAddSet,
  onCompleteSet,
  onDeleteSet,
  onRemoveExercise,
  onFinish,
  onCancel,
  onSaveAsTemplate,
  onClearPR,
}: StrongWorkoutViewProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');

  // Elapsed time tracker
  useEffect(() => {
    const start = new Date(session.started_at).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.started_at]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || ex.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  const handleCompleteSet = (setId: string, reps: number, weight: number) => {
    onCompleteSet(setId, reps, weight);
    setRestDuration(90);
    setShowRestTimer(true);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const exercise = activeExercises.find(ae => ae.exercise.id === exerciseId);
    if (exercise) {
      exercise.sets.forEach(set => {
        onDeleteSet(set.id, exerciseId);
      });
    }
  };

  const completedSets = activeExercises.reduce(
    (sum, ae) => sum + ae.sets.filter(s => s.is_completed).length, 
    0
  );
  const totalSets = activeExercises.reduce((sum, ae) => sum + ae.sets.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* PR Celebration */}
      <PRCelebration
        isVisible={!!prCelebration}
        exerciseName={prCelebration?.exerciseName || ''}
        weight={prCelebration?.weight || 0}
        reps={prCelebration?.reps || 0}
        onComplete={onClearPR}
      />

      {/* Rest Timer Overlay */}
      <RestTimerOverlay
        isVisible={showRestTimer}
        initialSeconds={restDuration}
        onClose={() => setShowRestTimer(false)}
        onTimerEnd={() => setShowRestTimer(false)}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive/80 hover:bg-secondary"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>

          <div className="text-center">
            <h1 className="text-foreground font-semibold text-sm">{session.name}</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
              <Clock className="h-3 w-3" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:text-accent/80 hover:bg-secondary"
            onClick={onFinish}
          >
            <Check className="h-4 w-4 mr-1" />
            Finish
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-300"
              style={{ width: totalSets > 0 ? `${(completedSets / totalSets) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {completedSets}/{totalSets} sets
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-6 pb-32 space-y-4">
        {activeExercises.length === 0 ? (
          <div className="text-center py-16">
            <Dumbbell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No exercises yet</h2>
            <p className="text-muted-foreground mb-6">Add exercises to start your workout</p>
          </div>
        ) : (
          activeExercises.map(({ exercise, sets }) => (
            <StrongExerciseCard
              key={exercise.id}
              exerciseId={exercise.id}
              exerciseName={exercise.name}
              muscleGroup={exercise.muscle_group}
              sets={sets}
              userId={userId}
              onAddSet={() => onAddSet(exercise.id)}
              onCompleteSet={handleCompleteSet}
              onDeleteSet={(setId) => onDeleteSet(setId, exercise.id)}
              onRemoveExercise={() => handleRemoveExercise(exercise.id)}
            />
          ))
        )}

        {/* Add Exercise Button */}
        <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
          <DialogTrigger asChild>
            <Button 
              className="w-full py-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] max-w-lg h-[calc(100vh-4rem)] max-h-[600px] bg-card border-border flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-foreground">Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col flex-1 min-h-0 space-y-3">
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-10 flex-shrink-0">
                <div className="flex gap-2 pb-2">
                  {muscleGroups.map(muscle => (
                    <Badge
                      key={muscle}
                      variant={selectedMuscle === muscle ? 'default' : 'outline'}
                      className={`cursor-pointer capitalize whitespace-nowrap ${
                        selectedMuscle === muscle 
                          ? 'bg-accent hover:bg-accent/90 text-accent-foreground' 
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setSelectedMuscle(muscle)}
                    >
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-1">
                  {filteredExercises.map(exercise => (
                    <button
                      key={exercise.id}
                      className="w-full p-3 text-left hover:bg-secondary rounded-lg flex items-center justify-between group"
                      onClick={() => {
                        onAddExercise(exercise);
                        setShowExercisePicker(false);
                        setSearchTerm('');
                        setSelectedMuscle('all');
                      }}
                    >
                      <div>
                        <p className="font-medium text-foreground">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {exercise.muscle_group} • {exercise.equipment}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save as Template */}
        {activeExercises.length > 0 && (
          <Button
            variant="outline"
            className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={onSaveAsTemplate}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Template
          </Button>
        )}
      </div>
    </div>
  );
}