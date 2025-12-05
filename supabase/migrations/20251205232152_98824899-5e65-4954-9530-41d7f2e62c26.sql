
-- Hormonal profile tracking for testosterone cycle optimization
CREATE TABLE public.hormonal_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  age INTEGER,
  sleep_hours NUMERIC,
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_morning INTEGER CHECK (energy_morning >= 1 AND energy_morning <= 10),
  energy_afternoon INTEGER CHECK (energy_afternoon >= 1 AND energy_afternoon <= 10),
  energy_evening INTEGER CHECK (energy_evening >= 1 AND energy_evening <= 10),
  libido_level INTEGER CHECK (libido_level >= 1 AND libido_level <= 10),
  recovery_quality INTEGER CHECK (recovery_quality >= 1 AND recovery_quality <= 10),
  training_intensity_recommendation TEXT,
  nutrition_recommendations JSONB,
  supplement_recommendations JSONB,
  ai_insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Joint health tracking and injury prediction
CREATE TABLE public.joint_health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  joint_name TEXT NOT NULL,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  stiffness_level INTEGER CHECK (stiffness_level >= 0 AND stiffness_level <= 10),
  range_of_motion INTEGER CHECK (range_of_motion >= 0 AND range_of_motion <= 100),
  recent_training_load INTEGER,
  risk_score NUMERIC,
  risk_factors JSONB,
  preventive_recommendations JSONB,
  exercises_to_avoid TEXT[],
  mobility_protocol JSONB,
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cognitive and executive performance metrics
CREATE TABLE public.cognitive_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  focus_rating INTEGER CHECK (focus_rating >= 1 AND focus_rating <= 10),
  mental_clarity INTEGER CHECK (mental_clarity >= 1 AND mental_clarity <= 10),
  decision_fatigue INTEGER CHECK (decision_fatigue >= 1 AND decision_fatigue <= 10),
  work_hours INTEGER,
  meetings_count INTEGER,
  caffeine_intake INTEGER,
  screen_time_hours NUMERIC,
  cognitive_load_score NUMERIC,
  productivity_recommendations JSONB,
  optimal_workout_windows JSONB,
  stress_management_protocol JSONB,
  ai_insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comeback protocol for returning after breaks
CREATE TABLE public.comeback_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  days_off INTEGER NOT NULL,
  reason_for_break TEXT,
  injury_details TEXT,
  current_fitness_level INTEGER CHECK (current_fitness_level >= 1 AND current_fitness_level <= 10),
  previous_training_frequency INTEGER,
  goals TEXT,
  week_1_protocol JSONB,
  week_2_protocol JSONB,
  week_3_protocol JSONB,
  week_4_protocol JSONB,
  nutrition_adjustments JSONB,
  recovery_priorities JSONB,
  warning_signs TEXT[],
  progression_milestones JSONB,
  ai_guidance TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Sleep-adaptive workout modifications
CREATE TABLE public.sleep_workout_adaptations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  adaptation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  sleep_disruptions INTEGER,
  hrv_reading NUMERIC,
  resting_heart_rate INTEGER,
  readiness_score NUMERIC,
  original_workout_plan JSONB,
  adapted_workout_plan JSONB,
  intensity_modifier NUMERIC,
  volume_modifier NUMERIC,
  exercise_swaps JSONB,
  recovery_additions JSONB,
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.hormonal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joint_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comeback_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_workout_adaptations ENABLE ROW LEVEL SECURITY;

-- RLS policies for hormonal_profiles
CREATE POLICY "Users can view own hormonal profiles" ON public.hormonal_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own hormonal profiles" ON public.hormonal_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hormonal profiles" ON public.hormonal_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hormonal profiles" ON public.hormonal_profiles FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for joint_health_scores
CREATE POLICY "Users can view own joint scores" ON public.joint_health_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own joint scores" ON public.joint_health_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own joint scores" ON public.joint_health_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own joint scores" ON public.joint_health_scores FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for cognitive_metrics
CREATE POLICY "Users can view own cognitive metrics" ON public.cognitive_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own cognitive metrics" ON public.cognitive_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cognitive metrics" ON public.cognitive_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cognitive metrics" ON public.cognitive_metrics FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for comeback_protocols
CREATE POLICY "Users can view own comeback protocols" ON public.comeback_protocols FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own comeback protocols" ON public.comeback_protocols FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comeback protocols" ON public.comeback_protocols FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comeback protocols" ON public.comeback_protocols FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for sleep_workout_adaptations
CREATE POLICY "Users can view own sleep adaptations" ON public.sleep_workout_adaptations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sleep adaptations" ON public.sleep_workout_adaptations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep adaptations" ON public.sleep_workout_adaptations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep adaptations" ON public.sleep_workout_adaptations FOR DELETE USING (auth.uid() = user_id);
