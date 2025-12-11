import type { OnboardingData } from '@/hooks/queries/useOnboardingQuery';

export interface WorkoutRecommendation {
  name: string;
  description: string;
  duration: string;
  exercises: { name: string; sets: string; reps: string; notes?: string }[];
}

export interface MealRecommendation {
  meal: string;
  name: string;
  description: string;
  macros: { calories: number; protein: number; carbs: number; fat: number };
}

export interface PersonalizedRecommendations {
  primaryFocus: string;
  workoutType: string;
  nutritionTip: string;
  recoveryPriority: string;
  suggestedWorkouts: WorkoutRecommendation[];
  suggestedMeals: MealRecommendation[];
  weeklySchedule: { day: string; focus: string; intensity: string }[];
  supplementSuggestions: string[];
}

export function getPersonalizedRecommendations(onboardingData: OnboardingData | null | undefined): PersonalizedRecommendations | null {
  if (!onboardingData) return null;

  const recommendations: PersonalizedRecommendations = {
    primaryFocus: '',
    workoutType: '',
    nutritionTip: '',
    recoveryPriority: '',
    suggestedWorkouts: [],
    suggestedMeals: [],
    weeklySchedule: [],
    supplementSuggestions: [],
  };

  // Primary focus and nutrition based on goal
  switch (onboardingData.fitness_goal) {
    case 'build_muscle':
      recommendations.primaryFocus = 'Progressive overload strength training with compound movements';
      recommendations.nutritionTip = 'Aim for 1g protein per pound of bodyweight, slight caloric surplus';
      recommendations.supplementSuggestions = ['Creatine Monohydrate', 'Whey Protein', 'Vitamin D3', 'Omega-3'];
      break;
    case 'lose_fat':
      recommendations.primaryFocus = 'Resistance training with strategic cardio for fat loss';
      recommendations.nutritionTip = 'Moderate caloric deficit (300-500 cal), prioritize protein to preserve muscle';
      recommendations.supplementSuggestions = ['Whey Protein', 'Green Tea Extract', 'Vitamin D3', 'Magnesium'];
      break;
    case 'improve_health':
      recommendations.primaryFocus = 'Balanced training combining strength, cardio, and mobility';
      recommendations.nutritionTip = 'Focus on whole foods, vegetables, and consistent meal timing';
      recommendations.supplementSuggestions = ['Omega-3', 'Vitamin D3', 'Magnesium', 'Probiotic'];
      break;
    case 'increase_energy':
      recommendations.primaryFocus = 'Movement consistency with sleep and stress optimization';
      recommendations.nutritionTip = 'Balance blood sugar with protein at every meal, reduce processed foods';
      recommendations.supplementSuggestions = ['B-Complex', 'Iron (if deficient)', 'CoQ10', 'Ashwagandha'];
      break;
    default:
      recommendations.primaryFocus = 'Sustainable fitness habits with progressive improvement';
      recommendations.nutritionTip = 'Balanced nutrition with adequate protein and whole foods';
      recommendations.supplementSuggestions = ['Multivitamin', 'Omega-3', 'Vitamin D3'];
  }

  // Workout type based on equipment
  const hasGym = onboardingData.available_equipment?.includes('full_gym') ?? false;
  const hasWeights = onboardingData.available_equipment?.includes('home_weights') ?? false;
  const hasBands = onboardingData.available_equipment?.includes('resistance_bands') ?? false;

  if (hasGym) {
    recommendations.workoutType = 'Full gym compound movements with machines for isolation';
  } else if (hasWeights) {
    recommendations.workoutType = 'Home dumbbell/kettlebell focused training';
  } else if (hasBands) {
    recommendations.workoutType = 'Resistance band training with bodyweight exercises';
  } else {
    recommendations.workoutType = 'Bodyweight training with progressive calisthenics';
  }

  // Recovery priority
  const currentChallenges = onboardingData.current_challenges ?? [];
  if (currentChallenges.includes('recovery')) {
    recommendations.recoveryPriority = 'Prioritize 7-9 hours sleep, add deload weeks every 4th week';
  } else if (currentChallenges.includes('mobility')) {
    recommendations.recoveryPriority = '10-15 min daily mobility work, focus on hip and thoracic spine';
  } else if (currentChallenges.includes('energy')) {
    recommendations.recoveryPriority = 'Address sleep quality and stress management first';
  } else {
    recommendations.recoveryPriority = 'Standard rest days with active recovery walks';
  }

  // Generate specific workouts based on goal and equipment
  recommendations.suggestedWorkouts = generateWorkouts(onboardingData, hasGym, hasWeights);

  // Generate meal suggestions based on goal and dietary preference
  recommendations.suggestedMeals = generateMeals(onboardingData);

  // Generate weekly schedule based on frequency
  recommendations.weeklySchedule = generateWeeklySchedule(onboardingData);

  return recommendations;
}

function generateWorkouts(data: OnboardingData, hasGym: boolean, hasWeights: boolean): WorkoutRecommendation[] {
  const workouts: WorkoutRecommendation[] = [];
  const isBeginnerOrReturning = data.experience_level === 'beginner';
  const hasMobilityConcern = data.current_challenges?.includes('mobility') ?? false;
  const focusAreas = data.focus_areas ?? [];

  if (data.fitness_goal === 'build_muscle' || focusAreas.includes('strength')) {
    if (hasGym) {
      workouts.push({
        name: 'Upper Body Strength',
        description: 'Compound push movements for chest, shoulders, and triceps',
        duration: '45-55 min',
        exercises: [
          { name: 'Bench Press', sets: isBeginnerOrReturning ? '3' : '4', reps: '6-8', notes: 'Control the eccentric' },
          { name: 'Overhead Press', sets: '3', reps: '8-10' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12' },
          { name: 'Cable Lateral Raise', sets: '3', reps: '12-15' },
          { name: 'Tricep Pushdown', sets: '3', reps: '12-15' },
          ...(hasMobilityConcern ? [{ name: 'Face Pulls', sets: '3', reps: '15-20', notes: 'For shoulder health' }] : []),
        ],
      });
      workouts.push({
        name: 'Lower Body Power',
        description: 'Leg-focused compound movements for strength and size',
        duration: '50-60 min',
        exercises: [
          { name: 'Barbell Squat', sets: isBeginnerOrReturning ? '3' : '4', reps: '6-8', notes: 'Depth to parallel' },
          { name: 'Romanian Deadlift', sets: '3', reps: '8-10', notes: 'Feel the hamstring stretch' },
          { name: 'Leg Press', sets: '3', reps: '10-12' },
          { name: 'Walking Lunges', sets: '3', reps: '10 each leg' },
          { name: 'Leg Curl', sets: '3', reps: '12-15' },
          { name: 'Calf Raises', sets: '4', reps: '15-20' },
        ],
      });
    } else if (hasWeights) {
      workouts.push({
        name: 'Home Upper Body',
        description: 'Dumbbell-focused upper body workout',
        duration: '40-50 min',
        exercises: [
          { name: 'Dumbbell Floor Press', sets: '4', reps: '8-10' },
          { name: 'Dumbbell Shoulder Press', sets: '3', reps: '10-12' },
          { name: 'Dumbbell Row', sets: '3', reps: '10-12 each arm' },
          { name: 'Lateral Raises', sets: '3', reps: '12-15' },
          { name: 'Push-ups', sets: '3', reps: 'To failure' },
          { name: 'Dumbbell Curls', sets: '3', reps: '12-15' },
        ],
      });
      workouts.push({
        name: 'Home Lower Body',
        description: 'Dumbbell and bodyweight leg workout',
        duration: '40-45 min',
        exercises: [
          { name: 'Goblet Squat', sets: '4', reps: '10-12' },
          { name: 'Dumbbell RDL', sets: '3', reps: '10-12' },
          { name: 'Bulgarian Split Squat', sets: '3', reps: '10 each leg', notes: 'Hold dumbbells' },
          { name: 'Dumbbell Step-ups', sets: '3', reps: '10 each leg' },
          { name: 'Glute Bridges', sets: '3', reps: '15-20' },
        ],
      });
    } else {
      workouts.push({
        name: 'Bodyweight Strength',
        description: 'Progressive calisthenics for strength',
        duration: '35-45 min',
        exercises: [
          { name: 'Push-up Variations', sets: '4', reps: '10-15', notes: 'Progress to archer push-ups' },
          { name: 'Pike Push-ups', sets: '3', reps: '8-12', notes: 'For shoulders' },
          { name: 'Inverted Rows', sets: '3', reps: '10-12', notes: 'Use table or sturdy bar' },
          { name: 'Tricep Dips', sets: '3', reps: '10-15', notes: 'Use chair or bench' },
          { name: 'Plank', sets: '3', reps: '45-60 sec' },
        ],
      });
    }
  }

  if (data.fitness_goal === 'lose_fat' || focusAreas.includes('cardio')) {
    workouts.push({
      name: 'Metabolic Conditioning',
      description: 'High-intensity intervals for fat burning and cardiovascular health',
      duration: '25-30 min',
      exercises: [
        { name: 'Warm-up Walk/Jog', sets: '1', reps: '5 min' },
        { name: 'Sprint Intervals', sets: '8-10', reps: '30 sec work / 60 sec rest', notes: 'RPE 8-9 during work' },
        { name: 'Cool-down Walk', sets: '1', reps: '5 min' },
      ],
    });
  }

  if (hasMobilityConcern || focusAreas.includes('flexibility')) {
    workouts.push({
      name: 'Mobility & Recovery',
      description: 'Joint health and flexibility work for men 40+',
      duration: '20-25 min',
      exercises: [
        { name: 'Cat-Cow Stretch', sets: '2', reps: '10 each' },
        { name: 'Hip 90/90 Stretch', sets: '2', reps: '30 sec each side' },
        { name: 'Thoracic Spine Rotations', sets: '2', reps: '10 each side' },
        { name: 'World\'s Greatest Stretch', sets: '2', reps: '5 each side' },
        { name: 'Foam Rolling', sets: '1', reps: '5 min full body', notes: 'Focus on tight areas' },
      ],
    });
  }

  return workouts;
}

function generateMeals(data: OnboardingData): MealRecommendation[] {
  const meals: MealRecommendation[] = [];
  const isLowCarb = data.dietary_preference === 'low_carb';
  const isVegetarian = data.dietary_preference === 'vegetarian';
  const isMediterranean = data.dietary_preference === 'mediterranean';
  const isIntermittentFasting = data.dietary_preference === 'intermittent_fasting';

  if (!isIntermittentFasting) {
    if (isLowCarb) {
      meals.push({
        meal: 'Breakfast',
        name: 'Protein-Packed Eggs & Avocado',
        description: '3 whole eggs scrambled with spinach, 1/2 avocado, 2 strips turkey bacon',
        macros: { calories: 480, protein: 32, carbs: 8, fat: 36 },
      });
    } else if (isVegetarian) {
      meals.push({
        meal: 'Breakfast',
        name: 'Greek Yogurt Power Bowl',
        description: 'Greek yogurt with berries, nuts, seeds, and a drizzle of honey',
        macros: { calories: 420, protein: 28, carbs: 42, fat: 16 },
      });
    } else {
      meals.push({
        meal: 'Breakfast',
        name: 'Muscle-Building Breakfast',
        description: '3 eggs, oatmeal with protein powder mixed in, banana',
        macros: { calories: 550, protein: 38, carbs: 58, fat: 18 },
      });
    }
  } else {
    meals.push({
      meal: 'First Meal (12pm)',
      name: 'Break-Fast Power Meal',
      description: 'Large salad with grilled chicken, avocado, olive oil dressing, nuts',
      macros: { calories: 650, protein: 45, carbs: 20, fat: 42 },
    });
  }

  if (isMediterranean) {
    meals.push({
      meal: 'Lunch',
      name: 'Mediterranean Plate',
      description: 'Grilled salmon, quinoa, roasted vegetables, tzatziki, olive oil',
      macros: { calories: 580, protein: 42, carbs: 38, fat: 28 },
    });
  } else if (isLowCarb) {
    meals.push({
      meal: 'Lunch',
      name: 'Steak Salad Bowl',
      description: 'Grilled steak strips on mixed greens, feta, olive oil, cherry tomatoes',
      macros: { calories: 520, protein: 45, carbs: 12, fat: 34 },
    });
  } else {
    meals.push({
      meal: 'Lunch',
      name: 'Balanced Builder',
      description: 'Grilled chicken breast, brown rice, steamed broccoli, olive oil',
      macros: { calories: 560, protein: 48, carbs: 52, fat: 16 },
    });
  }

  if (isVegetarian) {
    meals.push({
      meal: 'Dinner',
      name: 'Plant Protein Dinner',
      description: 'Tofu stir-fry with vegetables, edamame, brown rice, sesame oil',
      macros: { calories: 520, protein: 32, carbs: 48, fat: 22 },
    });
  } else {
    meals.push({
      meal: 'Dinner',
      name: 'Recovery Dinner',
      description: 'Grilled salmon or lean beef, sweet potato, green vegetables, olive oil',
      macros: { calories: 620, protein: 45, carbs: 42, fat: 28 },
    });
  }

  meals.push({
    meal: 'Post-Workout Snack',
    name: 'Recovery Shake',
    description: 'Whey protein, banana, almond butter, almond milk',
    macros: { calories: 380, protein: 35, carbs: 32, fat: 14 },
  });

  return meals;
}

function generateWeeklySchedule(data: OnboardingData): { day: string; focus: string; intensity: string }[] {
  const schedule: { day: string; focus: string; intensity: string }[] = [];
  const frequency = data.workout_frequency;
  const needsRecovery = data.current_challenges?.includes('recovery') ?? false;

  if (frequency === '1-2') {
    schedule.push(
      { day: 'Monday', focus: 'Full Body Strength', intensity: 'Moderate' },
      { day: 'Tuesday', focus: 'Rest / Light Walk', intensity: 'Low' },
      { day: 'Wednesday', focus: 'Rest / Mobility', intensity: 'Low' },
      { day: 'Thursday', focus: 'Full Body Strength', intensity: 'Moderate' },
      { day: 'Friday', focus: 'Rest', intensity: 'None' },
      { day: 'Saturday', focus: 'Active Recovery', intensity: 'Low' },
      { day: 'Sunday', focus: 'Rest', intensity: 'None' },
    );
  } else if (frequency === '3-4') {
    schedule.push(
      { day: 'Monday', focus: 'Upper Body Push', intensity: needsRecovery ? 'Moderate' : 'High' },
      { day: 'Tuesday', focus: 'Lower Body', intensity: needsRecovery ? 'Moderate' : 'High' },
      { day: 'Wednesday', focus: 'Rest / Mobility', intensity: 'Low' },
      { day: 'Thursday', focus: 'Upper Body Pull', intensity: needsRecovery ? 'Moderate' : 'High' },
      { day: 'Friday', focus: 'Conditioning / Cardio', intensity: 'Moderate' },
      { day: 'Saturday', focus: 'Active Recovery', intensity: 'Low' },
      { day: 'Sunday', focus: 'Rest', intensity: 'None' },
    );
  } else if (frequency === '5-6') {
    schedule.push(
      { day: 'Monday', focus: 'Push (Chest/Shoulders/Triceps)', intensity: 'High' },
      { day: 'Tuesday', focus: 'Pull (Back/Biceps)', intensity: 'High' },
      { day: 'Wednesday', focus: 'Legs', intensity: 'High' },
      { day: 'Thursday', focus: 'Push (Variation)', intensity: 'Moderate' },
      { day: 'Friday', focus: 'Pull (Variation)', intensity: 'Moderate' },
      { day: 'Saturday', focus: 'Legs/Conditioning', intensity: 'Moderate' },
      { day: 'Sunday', focus: 'Rest / Mobility', intensity: 'Low' },
    );
  } else {
    schedule.push(
      { day: 'Monday', focus: 'Upper Body', intensity: 'Moderate' },
      { day: 'Tuesday', focus: 'Rest / Walk', intensity: 'Low' },
      { day: 'Wednesday', focus: 'Lower Body', intensity: 'Moderate' },
      { day: 'Thursday', focus: 'Rest', intensity: 'None' },
      { day: 'Friday', focus: 'Full Body', intensity: 'Moderate' },
      { day: 'Saturday', focus: 'Active Recovery', intensity: 'Low' },
      { day: 'Sunday', focus: 'Rest', intensity: 'None' },
    );
  }

  return schedule;
}
