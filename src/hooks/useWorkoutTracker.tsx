import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { haptics } from './useNativeFeatures';
import { useHealthData } from './useHealthData';
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

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  sort_order: number;
  target_sets: number | null;
  target_reps: number | null;
  target_weight: number | null;
  rest_seconds: number | null;
  notes: string | null;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  exercises?: (TemplateExercise & { exercise: Exercise })[];
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

export interface PRCelebrationData {
  exerciseName: string;
  weight: number;
  reps: number;
}

export const useWorkoutTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { writeWorkout, writeCalories } = useHealthData();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [activeExercises, setActiveExercises] = useState<ActiveWorkoutExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [prCelebration, setPrCelebration] = useState<PRCelebrationData | null>(null);

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

  // Fetch user's workout templates with exercises
  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        template_exercises(
          *,
          exercises(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }
    
    // Transform data to match interface
    const templatesWithExercises = (data || []).map(t => ({
      ...t,
      exercises: (t.template_exercises || []).map((te: any) => ({
        ...te,
        exercise: te.exercises
      })).sort((a: TemplateExercise, b: TemplateExercise) => a.sort_order - b.sort_order)
    }));
    
    setTemplates(templatesWithExercises);
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
      // Find exercise name
      const exerciseName = exercises.find(e => e.id === exerciseId)?.name || 
        activeExercises.find(ae => ae.exercise.id === exerciseId)?.exercise.name || 
        'Exercise';
      
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
        // Trigger celebration animation
        setPrCelebration({ exerciseName, weight, reps });
        
        setPersonalRecords(prev => {
          const filtered = prev.filter(pr => !(pr.exercise_id === exerciseId && pr.record_type === 'weight'));
          return [...filtered, data];
        });
      }
    }
  };
  
  // Clear PR celebration
  const clearPrCelebration = () => {
    setPrCelebration(null);
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
    const durationSeconds = durationMinutes * 60;
    
    // Estimate calories burned (rough estimate: 5 cal/min for strength training)
    const estimatedCalories = durationMinutes * 5;
    
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
    
    // Haptic feedback on workout complete
    haptics.success();
    
    // Sync to Apple HealthKit
    writeWorkout({
      type: 'strength',
      startDate: startTime,
      endDate: endTime,
      calories: estimatedCalories,
      duration: durationSeconds,
    });
    writeCalories(estimatedCalories, endTime);
    
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

  // Create a new template
  const createTemplate = async (name: string, description?: string) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('workout_templates')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
      })
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to create template', variant: 'destructive' });
      return null;
    }
    
    toast({ title: 'Template Created', description: `${name} is ready to use` });
    await fetchTemplates();
    return data;
  };

  // Add exercise to template
  const addExerciseToTemplate = async (
    templateId: string, 
    exerciseId: string, 
    options?: { targetSets?: number; targetReps?: number; targetWeight?: number; restSeconds?: number }
  ) => {
    if (!user) return;
    
    // Get current exercise count for sort order
    const template = templates.find(t => t.id === templateId);
    const sortOrder = template?.exercises?.length || 0;
    
    const { error } = await supabase
      .from('template_exercises')
      .insert({
        template_id: templateId,
        exercise_id: exerciseId,
        sort_order: sortOrder,
        target_sets: options?.targetSets || 3,
        target_reps: options?.targetReps || 10,
        target_weight: options?.targetWeight || null,
        rest_seconds: options?.restSeconds || 90,
      });
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to add exercise', variant: 'destructive' });
      return;
    }
    
    await fetchTemplates();
  };

  // Update template exercise settings
  const updateTemplateExercise = async (
    templateExerciseId: string,
    updates: { targetSets?: number; targetReps?: number; targetWeight?: number; restSeconds?: number }
  ) => {
    const updateData: any = {};
    if (updates.targetSets !== undefined) updateData.target_sets = updates.targetSets;
    if (updates.targetReps !== undefined) updateData.target_reps = updates.targetReps;
    if (updates.targetWeight !== undefined) updateData.target_weight = updates.targetWeight;
    if (updates.restSeconds !== undefined) updateData.rest_seconds = updates.restSeconds;

    const { error } = await supabase
      .from('template_exercises')
      .update(updateData)
      .eq('id', templateExerciseId);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to update exercise', variant: 'destructive' });
      return;
    }
    
    await fetchTemplates();
  };

  // Remove exercise from template
  const removeExerciseFromTemplate = async (templateExerciseId: string) => {
    const { error } = await supabase
      .from('template_exercises')
      .delete()
      .eq('id', templateExerciseId);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to remove exercise', variant: 'destructive' });
      return;
    }
    
    await fetchTemplates();
  };

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', templateId);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Template Deleted' });
    await fetchTemplates();
  };

  // Start workout from template
  const startWorkoutFromTemplate = async (template: WorkoutTemplate) => {
    if (!user || !template.exercises) return null;
    
    setLoading(true);
    
    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        name: template.name,
        template_id: template.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (sessionError || !session) {
      setLoading(false);
      toast({ title: 'Error', description: 'Failed to start workout', variant: 'destructive' });
      return null;
    }
    
    // Create sets for each exercise in template
    const exercisesWithSets: ActiveWorkoutExercise[] = [];
    
    for (const te of template.exercises) {
      const sets: ExerciseSet[] = [];
      const numSets = te.target_sets || 3;
      
      for (let i = 0; i < numSets; i++) {
        const { data: setData } = await supabase
          .from('exercise_sets')
          .insert({
            session_id: session.id,
            exercise_id: te.exercise_id,
            set_number: i + 1,
            weight: te.target_weight,
            reps: te.target_reps,
            is_warmup: false,
            is_completed: false,
          })
          .select()
          .single();
        
        if (setData) {
          sets.push(setData);
        }
      }
      
      exercisesWithSets.push({
        exercise: te.exercise,
        sets,
      });
    }
    
    setLoading(false);
    setActiveSession(session);
    setActiveExercises(exercisesWithSets);
    toast({ title: 'Workout Started', description: `Let's crush ${template.name}!` });
    return session;
  };

  // Save current workout as template
  const saveWorkoutAsTemplate = async (name: string, description?: string) => {
    if (!user || activeExercises.length === 0) return;
    
    const template = await createTemplate(name, description);
    if (!template) return;
    
    // Add each exercise to the template
    for (let i = 0; i < activeExercises.length; i++) {
      const ae = activeExercises[i];
      const completedSets = ae.sets.filter(s => s.is_completed);
      const avgWeight = completedSets.length > 0
        ? Math.round(completedSets.reduce((sum, s) => sum + (s.weight || 0), 0) / completedSets.length)
        : null;
      const avgReps = completedSets.length > 0
        ? Math.round(completedSets.reduce((sum, s) => sum + (s.reps || 0), 0) / completedSets.length)
        : null;
      
      await supabase.from('template_exercises').insert({
        template_id: template.id,
        exercise_id: ae.exercise.id,
        sort_order: i,
        target_sets: ae.sets.length,
        target_reps: avgReps,
        target_weight: avgWeight,
      });
    }
    
    await fetchTemplates();
    toast({ title: 'Template Saved', description: `${name} saved from your workout` });
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
    createTemplate,
    addExerciseToTemplate,
    updateTemplateExercise,
    removeExerciseFromTemplate,
    deleteTemplate,
    startWorkoutFromTemplate,
    saveWorkoutAsTemplate,
    getPreviousWorkoutData,
    getWorkoutDetails,
    fetchExercises,
    fetchTemplates,
    fetchWorkoutHistory,
    prCelebration,
    clearPrCelebration,
  };
};
