import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OnboardingData {
  fitness_goal: string;
  experience_level: string;
  age_range: string;
  workout_frequency: string;
  current_challenges: string[];
  available_equipment: string[];
  focus_areas: string[];
  dietary_preference?: string;
  injuries_limitations?: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setIsLoading(false);
      setHasCompletedOnboarding(null);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setOnboardingData({
          fitness_goal: data.fitness_goal,
          experience_level: data.experience_level,
          age_range: data.age_range,
          workout_frequency: data.workout_frequency,
          current_challenges: data.current_challenges || [],
          available_equipment: data.available_equipment || [],
          focus_areas: data.focus_areas || [],
          dietary_preference: data.dietary_preference || undefined,
          injuries_limitations: data.injuries_limitations || undefined,
        });
        setHasCompletedOnboarding(true);
      } else {
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboarding = async (data: OnboardingData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          ...data,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      setOnboardingData(data);
      setHasCompletedOnboarding(true);
      return true;
    } catch (error) {
      console.error('Error saving onboarding:', error);
      return false;
    }
  };

  const getPersonalizedRecommendations = () => {
    if (!onboardingData) return null;

    const recommendations = {
      primaryFocus: '',
      workoutType: '',
      nutritionTip: '',
      recoveryPriority: '',
    };

    // Primary focus based on goal
    switch (onboardingData.fitness_goal) {
      case 'build_muscle':
        recommendations.primaryFocus = 'Strength training with progressive overload';
        recommendations.nutritionTip = 'Focus on protein intake: 1g per pound of bodyweight';
        break;
      case 'lose_fat':
        recommendations.primaryFocus = 'Caloric deficit with resistance training';
        recommendations.nutritionTip = 'Track calories and prioritize protein to preserve muscle';
        break;
      case 'improve_health':
        recommendations.primaryFocus = 'Balanced training combining strength and cardio';
        recommendations.nutritionTip = 'Focus on whole foods and consistent meal timing';
        break;
      case 'increase_energy':
        recommendations.primaryFocus = 'Movement consistency and sleep optimization';
        recommendations.nutritionTip = 'Balance blood sugar with protein at every meal';
        break;
      default:
        recommendations.primaryFocus = 'Sustainable fitness habits';
        recommendations.nutritionTip = 'Balanced nutrition with adequate protein';
    }

    // Workout type based on equipment and experience
    if (onboardingData.available_equipment.includes('full_gym')) {
      recommendations.workoutType = 'Full gym compound movements';
    } else if (onboardingData.available_equipment.includes('home_weights')) {
      recommendations.workoutType = 'Home dumbbell/kettlebell workouts';
    } else {
      recommendations.workoutType = 'Bodyweight and resistance band training';
    }

    // Recovery priority based on challenges
    if (onboardingData.current_challenges.includes('recovery')) {
      recommendations.recoveryPriority = 'Sleep optimization and active recovery days';
    } else if (onboardingData.current_challenges.includes('mobility')) {
      recommendations.recoveryPriority = 'Daily mobility work and stretching';
    } else if (onboardingData.current_challenges.includes('energy')) {
      recommendations.recoveryPriority = 'Stress management and sleep quality';
    } else {
      recommendations.recoveryPriority = 'Consistent rest days and quality sleep';
    }

    return recommendations;
  };

  return {
    onboardingData,
    hasCompletedOnboarding,
    isLoading,
    saveOnboarding,
    getPersonalizedRecommendations,
    refreshOnboarding: checkOnboardingStatus,
  };
};
