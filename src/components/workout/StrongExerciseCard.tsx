import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Plus, Trash2, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseSet {
  id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  is_warmup: boolean;
  is_completed: boolean;
}

interface PreviousSet {
  weight: number | null;
  reps: number | null;
}

interface StrongExerciseCardProps {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: ExerciseSet[];
  userId: string | undefined;
  onAddSet: () => void;
  onCompleteSet: (setId: string, reps: number, weight: number) => void;
  onDeleteSet: (setId: string) => void;
  onRemoveExercise: () => void;
}

export function StrongExerciseCard({
  exerciseId,
  exerciseName,
  muscleGroup,
  sets,
  userId,
  onAddSet,
  onCompleteSet,
  onDeleteSet,
  onRemoveExercise,
}: StrongExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingSets, setEditingSets] = useState<Record<string, { weight: string; reps: string }>>({});
  const [previousSets, setPreviousSets] = useState<PreviousSet[]>([]);

  // Fetch previous workout data for this exercise
  useEffect(() => {
    const fetchPreviousData = async () => {
      if (!userId) return;

      const { data } = await supabase
        .from('exercise_sets')
        .select(`
          weight,
          reps,
          set_number,
          workout_sessions!inner(user_id, completed_at)
        `)
        .eq('exercise_id', exerciseId)
        .eq('workout_sessions.user_id', userId)
        .not('workout_sessions.completed_at', 'is', null)
        .eq('is_completed', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        // Group by set number and get the most recent for each
        const setMap = new Map<number, PreviousSet>();
        data.forEach((d: any) => {
          if (!setMap.has(d.set_number)) {
            setMap.set(d.set_number, { weight: d.weight, reps: d.reps });
          }
        });
        
        const sortedSets = Array.from(setMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([, set]) => set);
        
        setPreviousSets(sortedSets);
      }
    };

    fetchPreviousData();
  }, [exerciseId, userId]);

  const handleCompleteSet = (setId: string) => {
    const editing = editingSets[setId];
    const set = sets.find(s => s.id === setId);
    
    const reps = parseInt(editing?.reps || '') || set?.reps || 0;
    const weight = parseFloat(editing?.weight || '') || set?.weight || 0;
    
    onCompleteSet(setId, reps, weight);
  };

  const getPreviousForSet = (setIndex: number): string => {
    const prev = previousSets[setIndex];
    if (!prev || (!prev.weight && !prev.reps)) return '-';
    return `${prev.weight || 0} × ${prev.reps || 0}`;
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-secondary/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <div>
            <h3 className="font-semibold text-foreground">{exerciseName}</h3>
            <p className="text-xs text-muted-foreground capitalize">{muscleGroup}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-secondary"
                onClick={onRemoveExercise}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Exercise
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Sets table */}
      {isExpanded && (
        <div className="p-4">
          {/* Table header */}
          <div className="grid grid-cols-[32px_minmax(50px,1fr)_minmax(60px,1fr)_minmax(50px,1fr)_40px] gap-1 sm:gap-2 mb-2 text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <span className="text-center">Set</span>
            <span className="text-center">Prev</span>
            <span className="text-center">lbs</span>
            <span className="text-center">Reps</span>
            <span></span>
          </div>

          {/* Sets */}
          <div className="space-y-2">
            {sets.map((set, idx) => (
              <div 
                key={set.id} 
                className={cn(
                  "grid grid-cols-[32px_minmax(50px,1fr)_minmax(60px,1fr)_minmax(50px,1fr)_40px] gap-1 sm:gap-2 items-center py-1",
                  set.is_completed && "opacity-60"
                )}
              >
                {/* Set number */}
                <span className={cn(
                  "text-center font-medium text-xs sm:text-sm",
                  set.is_warmup ? "text-yellow-500" : "text-foreground"
                )}>
                  {set.is_warmup ? 'W' : idx + 1}
                </span>

                {/* Previous */}
                <span className="text-center text-[11px] sm:text-sm text-muted-foreground truncate">
                  {getPreviousForSet(idx)}
                </span>

                {/* Weight */}
                <Input
                  type="number"
                  placeholder={previousSets[idx]?.weight?.toString() || "0"}
                  className={cn(
                    "h-9 sm:h-10 text-center text-sm px-1 bg-secondary border-border text-foreground",
                    set.is_completed && "bg-secondary/50"
                  )}
                  value={editingSets[set.id]?.weight ?? set.weight ?? ''}
                  onChange={(e) => setEditingSets(prev => ({
                    ...prev,
                    [set.id]: { 
                      ...prev[set.id], 
                      weight: e.target.value, 
                      reps: prev[set.id]?.reps ?? set.reps?.toString() ?? '' 
                    }
                  }))}
                  disabled={set.is_completed}
                />

                {/* Reps */}
                <Input
                  type="number"
                  placeholder={previousSets[idx]?.reps?.toString() || "0"}
                  className={cn(
                    "h-9 sm:h-10 text-center text-sm px-1 bg-secondary border-border text-foreground",
                    set.is_completed && "bg-secondary/50"
                  )}
                  value={editingSets[set.id]?.reps ?? set.reps ?? ''}
                  onChange={(e) => setEditingSets(prev => ({
                    ...prev,
                    [set.id]: { 
                      ...prev[set.id], 
                      reps: e.target.value, 
                      weight: prev[set.id]?.weight ?? set.weight?.toString() ?? '' 
                    }
                  }))}
                  disabled={set.is_completed}
                />

                {/* Complete/Delete */}
                <div className="flex justify-center">
                  {set.is_completed ? (
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 bg-secondary hover:bg-accent hover:text-accent-foreground border-border"
                      onClick={() => handleCompleteSet(set.id)}
                    >
                      <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Set button */}
          <Button
            variant="ghost"
            className="w-full mt-4 text-accent hover:text-accent/80 hover:bg-secondary"
            onClick={onAddSet}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Set
          </Button>
        </div>
      )}
    </div>
  );
}