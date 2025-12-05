import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles: string[];
  equipment: string;
  instructions: string | null;
  is_custom: boolean;
}

export interface ExerciseSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  is_warmup: boolean;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  template_id: string | null;
  name: string;
  started_at: string;
  completed_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  record_type: string;
  value: number;
  reps_at_weight: number | null;
  achieved_at: string;
}

export interface ActiveWorkoutExercise {
  exercise: Exercise;
  sets: ExerciseSet[];
}

export const useWorkoutTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [activeExercises, setActiveExercises] = useState<ActiveWorkoutExercise[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all exercises
  const fetchExercises = useCallback(async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group')
      .order('name');
    
    if (error) {
      console.error('Error fetching exercises:', error);
      return;
    }
    setExercises(data || []);
  }, []);

  // Fetch user's workout templates
  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }
    setTemplates(data || []);
  }, [user]);

  // Fetch workout history
  const fetchWorkoutHistory = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching workout history:', error);
      return;
    }
    setWorkoutHistory(data || []);
  }, [user]);

  // Fetch personal records
  const fetchPersonalRecords = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching PRs:', error);
      return;
    }
    setPersonalRecords(data || []);
  }, [user]);

  // Start a new workout session
  const startWorkout = async (name: string, templateId?: string) => {
    if (!user) return null;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        name,
        template_id: templateId || null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    setLoading(false);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to start workout', variant: 'destructive' });
      return null;
    }
    
    setActiveSession(data);
    setActiveExercises([]);
    toast({ title: 'Workout Started', description: `Let's crush ${name}!` });
    return data;
  };

  // Add exercise to active workout
  const addExerciseToWorkout = async (exercise: Exercise) => {
    if (!activeSession) return;
    
    // Check if exercise already in workout
    if (activeExercises.some(ae => ae.exercise.id === exercise.id)) {
      toast({ title: 'Already Added', description: 'Exercise is already in your workout', variant: 'destructive' });
      return;
    }
    
    // Create first set
    const { data: setData, error } = await supabase
      .from('exercise_sets')
      .insert({
        session_id: activeSession.id,
        exercise_id: exercise.id,
        set_number: 1,
        is_warmup: false,
        is_completed: false,
      })
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to add exercise', variant: 'destructive' });
      return;
    }
    
    setActiveExercises(prev => [...prev, { exercise, sets: [setData] }]);
  };

  // Add a set to an exercise
  const addSet = async (exerciseId: string) => {
    if (!activeSession) return;
    
    const exerciseIndex = activeExercises.findIndex(ae => ae.exercise.id === exerciseId);
    if (exerciseIndex === -1) return;
    
    const currentSets = activeExercises[exerciseIndex].sets;
    const lastSet = currentSets[currentSets.length - 1];
    
    const { data, error } = await supabase
      .from('exercise_sets')
      .insert({
        session_id: activeSession.id,
        exercise_id: exerciseId,
        set_number: currentSets.length + 1,
        weight: lastSet?.weight,
        reps: lastSet?.reps,
        is_warmup: false,
        is_completed: false,
      })
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to add set', variant: 'destructive' });
      return;
    }
    
    setActiveExercises(prev => prev.map((ae, i) => 
      i === exerciseIndex ? { ...ae, sets: [...ae.sets, data] } : ae
    ));
  };

  // Update a set
  const updateSet = async (setId: string, updates: Partial<ExerciseSet>) => {
    const { error } = await supabase
      .from('exercise_sets')
      .update(updates)
      .eq('id', setId);
    
    if (error) {
      console.error('Error updating set:', error);
      return;
    }
    
    setActiveExercises(prev => prev.map(ae => ({
      ...ae,
      sets: ae.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
    })));
  };

  // Complete a set
  const completeSet = async (setId: string, reps: number, weight: number) => {
    await updateSet(setId, {
      reps,
      weight,
      is_completed: true,
      completed_at: new Date().toISOString(),
    });
    
    // Check for PR
    const set = activeExercises.flatMap(ae => ae.sets).find(s => s.id === setId);
    if (set) {
      await checkAndUpdatePR(set.exercise_id, weight, reps);
    }
  };

  // Check and update personal record
  const checkAndUpdatePR = async (exerciseId: string, weight: number, reps: number) => {
    if (!user || !activeSession) return;
    
    const existingPR = personalRecords.find(
      pr => pr.exercise_id === exerciseId && pr.record_type === 'weight'
    );
    
    if (!existingPR || weight > existingPR.value) {
      const { data, error } = await supabase
        .from('personal_records')
        .upsert({
          user_id: user.id,
          exercise_id: exerciseId,
          record_type: 'weight',
          value: weight,
          reps_at_weight: reps,
          achieved_at: new Date().toISOString(),
          session_id: activeSession.id,
        }, { onConflict: 'user_id,exercise_id,record_type' })
        .select()
        .single();
      
      if (!error && data) {
        toast({ title: '🏆 New PR!', description: `${weight} lbs for ${reps} reps!` });
        setPersonalRecords(prev => {
          const filtered = prev.filter(pr => !(pr.exercise_id === exerciseId && pr.record_type === 'weight'));
          return [...filtered, data];
        });
      }
    }
  };

  // Delete a set
  const deleteSet = async (setId: string, exerciseId: string) => {
    const { error } = await supabase
      .from('exercise_sets')
      .delete()
      .eq('id', setId);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete set', variant: 'destructive' });
      return;
    }
    
    setActiveExercises(prev => {
      const updated = prev.map(ae => {
        if (ae.exercise.id !== exerciseId) return ae;
        const newSets = ae.sets.filter(s => s.id !== setId);
        return { ...ae, sets: newSets };
      });
      // Remove exercise if no sets left
      return updated.filter(ae => ae.sets.length > 0);
    });
  };

  // Finish workout
  const finishWorkout = async (notes?: string) => {
    if (!activeSession) return;
    
    const startTime = new Date(activeSession.started_at);
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    
    const { error } = await supabase
      .from('workout_sessions')
      .update({
        completed_at: endTime.toISOString(),
        duration_minutes: durationMinutes,
        notes,
      })
      .eq('id', activeSession.id);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to save workout', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Workout Complete!', description: `${durationMinutes} minutes - Great job!` });
    setActiveSession(null);
    setActiveExercises([]);
    fetchWorkoutHistory();
  };

  // Cancel workout
  const cancelWorkout = async () => {
    if (!activeSession) return;
    
    await supabase.from('workout_sessions').delete().eq('id', activeSession.id);
    setActiveSession(null);
    setActiveExercises([]);
    toast({ title: 'Workout Cancelled', description: 'Your workout was discarded' });
  };

  // Get previous workout data for an exercise
  const getPreviousWorkoutData = async (exerciseId: string): Promise<ExerciseSet[]> => {
    if (!user) return [];
    
    const { data } = await supabase
      .from('exercise_sets')
      .select(`
        *,
        workout_sessions!inner(user_id, completed_at)
      `)
      .eq('exercise_id', exerciseId)
      .eq('workout_sessions.user_id', user.id)
      .not('workout_sessions.completed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);
    
    return (data as ExerciseSet[]) || [];
  };

  // Get workout details with sets
  const getWorkoutDetails = async (sessionId: string) => {
    const { data: sets } = await supabase
      .from('exercise_sets')
      .select('*, exercises(*)')
      .eq('session_id', sessionId)
      .order('created_at');
    
    return sets;
  };

  // Initial data fetch
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  useEffect(() => {
    if (user) {
      fetchTemplates();
      fetchWorkoutHistory();
      fetchPersonalRecords();
    }
  }, [user, fetchTemplates, fetchWorkoutHistory, fetchPersonalRecords]);

  return {
    exercises,
    templates,
    workoutHistory,
    personalRecords,
    activeSession,
    activeExercises,
    loading,
    startWorkout,
    addExerciseToWorkout,
    addSet,
    updateSet,
    completeSet,
    deleteSet,
    finishWorkout,
    cancelWorkout,
    getPreviousWorkoutData,
    getWorkoutDetails,
    fetchExercises,
    fetchTemplates,
    fetchWorkoutHistory,
  };
};
