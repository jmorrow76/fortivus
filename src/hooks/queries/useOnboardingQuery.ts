import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const onboardingKeys = {
  all: ['onboarding'] as const,
  detail: (userId: string) => [...onboardingKeys.all, userId] as const,
};

export interface OnboardingData {
  id: string;
  user_id: string;
  fitness_goal: string;
  experience_level: string;
  age_range: string;
  workout_frequency: string;
  current_challenges: string[] | null;
  available_equipment: string[] | null;
  focus_areas: string[] | null;
  dietary_preference: string | null;
  injuries_limitations: string | null;
  completed_at: string;
}

export function useOnboardingQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: onboardingKeys.detail(user?.id ?? ''),
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as OnboardingData | null;
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes - rarely changes
  });
}

export function useUpdateOnboardingMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (onboardingData: Omit<OnboardingData, 'id' | 'user_id' | 'completed_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data: result, error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          fitness_goal: onboardingData.fitness_goal,
          experience_level: onboardingData.experience_level,
          age_range: onboardingData.age_range,
          workout_frequency: onboardingData.workout_frequency,
          current_challenges: onboardingData.current_challenges,
          available_equipment: onboardingData.available_equipment,
          focus_areas: onboardingData.focus_areas,
          dietary_preference: onboardingData.dietary_preference,
          injuries_limitations: onboardingData.injuries_limitations,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(user.id) });
      }
    },
  });
}
