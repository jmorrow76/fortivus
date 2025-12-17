import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Food {
  id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  serving_size: number;
  serving_unit: string;
  is_verified: boolean;
  created_by: string | null;
}

export interface MealLog {
  id: string;
  user_id: string;
  food_id: string | null;
  custom_food_name: string | null;
  custom_calories: number | null;
  custom_protein: number | null;
  custom_carbs: number | null;
  custom_fat: number | null;
  servings: number;
  meal_type: string;
  log_date: string;
  created_at: string;
  food?: Food;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = typeof MEAL_TYPES[number];

export interface FrequentFood extends Food {
  logCount: number;
}

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DEFAULT_GOALS: MacroGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65
};

export function useCalorieTracker() {
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [frequentFoods, setFrequentFoods] = useState<FrequentFood[]>([]);
  const [macroGoals, setMacroGoals] = useState<MacroGoals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchFoods = useCallback(async (search?: string) => {
    let query = supabase
      .from('foods')
      .select('*')
      .order('is_verified', { ascending: false })
      .order('name');
    
    if (search && search.length >= 2) {
      query = query.ilike('name', `%${search}%`);
    }
    
    query = query.limit(100);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching foods:', error);
      return [];
    }
    
    return (data || []) as Food[];
  }, []);

  const fetchMealLogs = useCallback(async (date: Date) => {
    if (!user) return;
    
    const dateStr = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', dateStr)
      .order('created_at');
    
    if (error) {
      console.error('Error fetching meal logs:', error);
      return;
    }
    
    // Fetch associated foods
    const foodIds = data?.filter(m => m.food_id).map(m => m.food_id) || [];
    let foodsMap: Record<string, Food> = {};
    
    if (foodIds.length > 0) {
      const { data: foodsData } = await supabase
        .from('foods')
        .select('*')
        .in('id', foodIds);
      
      foodsMap = (foodsData || []).reduce((acc, f) => {
        acc[f.id] = f as Food;
        return acc;
      }, {} as Record<string, Food>);
    }
    
    const logsWithFoods = (data || []).map(log => ({
      ...log,
      food: log.food_id ? foodsMap[log.food_id] : undefined
    })) as MealLog[];
    
    setMealLogs(logsWithFoods);
  }, [user]);

  const fetchFrequentFoods = useCallback(async () => {
    if (!user) return;
    
    // Get all meal logs for this user to find frequently logged foods
    const { data: allLogs, error } = await supabase
      .from('meal_logs')
      .select('food_id')
      .eq('user_id', user.id)
      .not('food_id', 'is', null);
    
    if (error || !allLogs) return;
    
    // Count food occurrences
    const foodCounts: Record<string, number> = {};
    allLogs.forEach(log => {
      if (log.food_id) {
        foodCounts[log.food_id] = (foodCounts[log.food_id] || 0) + 1;
      }
    });
    
    // Get top 6 most frequent food IDs
    const topFoodIds = Object.entries(foodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);
    
    if (topFoodIds.length === 0) return;
    
    // Fetch the food details
    const { data: foodsData } = await supabase
      .from('foods')
      .select('*')
      .in('id', topFoodIds);
    
    if (foodsData) {
      const frequentWithCounts = foodsData.map(food => ({
        ...food,
        logCount: foodCounts[food.id] || 0
      })) as FrequentFood[];
      
      // Sort by log count
      frequentWithCounts.sort((a, b) => b.logCount - a.logCount);
      setFrequentFoods(frequentWithCounts);
    }
  }, [user]);

  const fetchMacroGoals = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('calorie_goal, protein_goal, carbs_goal, fat_goal')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching macro goals:', error);
      return;
    }
    
    if (data) {
      setMacroGoals({
        calories: data.calorie_goal || DEFAULT_GOALS.calories,
        protein: data.protein_goal || DEFAULT_GOALS.protein,
        carbs: data.carbs_goal || DEFAULT_GOALS.carbs,
        fat: data.fat_goal || DEFAULT_GOALS.fat
      });
    }
  }, [user]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const allFoods = await fetchFoods();
      setFoods(allFoods);
      await fetchMealLogs(selectedDate);
      await fetchFrequentFoods();
      await fetchMacroGoals();
      setLoading(false);
    };
    
    if (user) {
      loadInitialData();
    }
  }, [user, selectedDate, fetchFoods, fetchMealLogs, fetchFrequentFoods, fetchMacroGoals]);

  const searchFoods = async (query: string) => {
    const results = await fetchFoods(query);
    setFoods(results);
    return results;
  };

  const addFood = async (food: Omit<Food, 'id' | 'created_at' | 'is_verified'>) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('foods')
      .insert({
        ...food,
        created_by: user.id,
        is_verified: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding food:', error);
      toast.error('Failed to add food');
      return null;
    }
    
    toast.success('Food added to database');
    setFoods(prev => [data as Food, ...prev]);
    return data as Food;
  };

  const logMeal = async (
    foodId: string | null,
    servings: number,
    mealType: MealType,
    customFood?: { name: string; calories: number; protein: number; carbs: number; fat: number }
  ) => {
    if (!user) return false;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        food_id: foodId,
        servings,
        meal_type: mealType,
        log_date: dateStr,
        custom_food_name: customFood?.name || null,
        custom_calories: customFood?.calories || null,
        custom_protein: customFood?.protein || null,
        custom_carbs: customFood?.carbs || null,
        custom_fat: customFood?.fat || null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error logging meal:', error);
      toast.error('Failed to log meal');
      return false;
    }
    
    await fetchMealLogs(selectedDate);
    toast.success('Meal logged');
    return true;
  };

  // Add food to shared database and log it - used for menu analyzer results
  const addFoodAndLog = async (
    foodData: { name: string; calories: number; protein: number; carbs: number; fat: number },
    servings: number,
    mealType: MealType
  ) => {
    if (!user) return false;
    
    // First check if this food already exists (by exact name match)
    const { data: existingFood } = await supabase
      .from('foods')
      .select('*')
      .ilike('name', foodData.name)
      .maybeSingle();
    
    let foodId: string;
    
    if (existingFood) {
      // Use existing food
      foodId = existingFood.id;
    } else {
      // Add new food to database for all users
      const { data: newFood, error: foodError } = await supabase
        .from('foods')
        .insert({
          name: foodData.name,
          calories: foodData.calories,
          protein: foodData.protein,
          carbs: foodData.carbs,
          fat: foodData.fat,
          serving_size: 1,
          serving_unit: 'serving',
          created_by: user.id,
          is_verified: false
        })
        .select()
        .single();
      
      if (foodError || !newFood) {
        console.error('Error adding food to database:', foodError);
        // Fall back to custom food logging
        return logMeal(null, servings, mealType, foodData);
      }
      
      foodId = newFood.id;
      // Update local foods list
      setFoods(prev => [newFood as Food, ...prev]);
    }
    
    // Log the meal with the food reference
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        food_id: foodId,
        servings,
        meal_type: mealType,
        log_date: dateStr
      });
    
    if (error) {
      console.error('Error logging meal:', error);
      toast.error('Failed to log meal');
      return false;
    }
    
    await fetchMealLogs(selectedDate);
    await fetchFrequentFoods();
    toast.success('Meal logged & added to food database');
    return true;
  };

  const deleteMealLog = async (logId: string) => {
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', logId);
    
    if (error) {
      console.error('Error deleting meal log:', error);
      toast.error('Failed to delete');
      return false;
    }
    
    setMealLogs(prev => prev.filter(m => m.id !== logId));
    toast.success('Meal removed');
    return true;
  };

  const getDailyTotals = useCallback((): DailyTotals => {
    return mealLogs.reduce((totals, log) => {
      let calories = 0, protein = 0, carbs = 0, fat = 0;
      
      if (log.food) {
        calories = (log.food.calories * log.servings);
        protein = (Number(log.food.protein) * log.servings);
        carbs = (Number(log.food.carbs) * log.servings);
        fat = (Number(log.food.fat) * log.servings);
      } else if (log.custom_calories) {
        calories = (log.custom_calories * log.servings);
        protein = ((log.custom_protein || 0) * log.servings);
        carbs = ((log.custom_carbs || 0) * log.servings);
        fat = ((log.custom_fat || 0) * log.servings);
      }
      
      return {
        calories: totals.calories + Math.round(calories),
        protein: totals.protein + Math.round(protein),
        carbs: totals.carbs + Math.round(carbs),
        fat: totals.fat + Math.round(fat)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [mealLogs]);

  const getMealsByType = useCallback((type: MealType) => {
    return mealLogs.filter(log => log.meal_type === type);
  }, [mealLogs]);

  return {
    foods,
    mealLogs,
    frequentFoods,
    macroGoals,
    loading,
    selectedDate,
    setSelectedDate,
    searchFoods,
    addFood,
    logMeal,
    addFoodAndLog,
    deleteMealLog,
    getDailyTotals,
    getMealsByType,
    refreshLogs: async () => {
      await fetchMealLogs(selectedDate);
      await fetchFrequentFoods();
    }
  };
}
