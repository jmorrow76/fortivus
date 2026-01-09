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
    <div className="min-h-screen bg-zinc-950">
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
      <div className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>

          <div className="text-center">
            <h1 className="text-white font-semibold text-sm">{session.name}</h1>
            <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs">
              <Clock className="h-3 w-3" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 hover:bg-zinc-800"
            onClick={onFinish}
          >
            <Check className="h-4 w-4 mr-1" />
            Finish
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: totalSets > 0 ? `${(completedSets / totalSets) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-zinc-500">
            {completedSets}/{totalSets} sets
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-6 pb-32 space-y-4">
        {activeExercises.length === 0 ? (
          <div className="text-center py-16">
            <Dumbbell className="h-16 w-16 mx-auto text-zinc-700 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No exercises yet</h2>
            <p className="text-zinc-500 mb-6">Add exercises to start your workout</p>
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
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search exercises..."
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-12">
                <div className="flex gap-2 pb-2">
                  {muscleGroups.map(muscle => (
                    <Badge
                      key={muscle}
                      variant={selectedMuscle === muscle ? 'default' : 'outline'}
                      className={`cursor-pointer capitalize whitespace-nowrap ${
                        selectedMuscle === muscle 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                      onClick={() => setSelectedMuscle(muscle)}
                    >
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
              <ScrollArea className="h-[350px]">
                <div className="space-y-1">
                  {filteredExercises.map(exercise => (
                    <button
                      key={exercise.id}
                      className="w-full p-3 text-left hover:bg-zinc-800 rounded-lg flex items-center justify-between group"
                      onClick={() => {
                        onAddExercise(exercise);
                        setShowExercisePicker(false);
                        setSearchTerm('');
                        setSelectedMuscle('all');
                      }}
                    >
                      <div>
                        <p className="font-medium text-white">{exercise.name}</p>
                        <p className="text-sm text-zinc-500 capitalize">
                          {exercise.muscle_group} • {exercise.equipment}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400" />
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
            className="w-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
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