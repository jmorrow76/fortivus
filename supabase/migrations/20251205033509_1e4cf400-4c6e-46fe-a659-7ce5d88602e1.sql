-- Create exercises table (library of exercises)
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  equipment TEXT DEFAULT 'bodyweight',
  instructions TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout templates table
CREATE TABLE public.workout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create template exercises (exercises within a template)
CREATE TABLE public.template_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  target_sets INTEGER DEFAULT 3,
  target_reps INTEGER DEFAULT 10,
  target_weight NUMERIC,
  rest_seconds INTEGER DEFAULT 90,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout sessions (actual logged workouts)
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.workout_templates(id),
  name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercise sets (individual sets within a workout)
CREATE TABLE public.exercise_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight NUMERIC,
  is_warmup BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personal records table
CREATE TABLE public.personal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  record_type TEXT NOT NULL DEFAULT 'weight', -- 'weight', 'reps', 'volume'
  value NUMERIC NOT NULL,
  reps_at_weight INTEGER,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id UUID REFERENCES public.workout_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id, record_type)
);

-- Create indexes
CREATE INDEX idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX idx_workout_templates_user ON public.workout_templates(user_id);
CREATE INDEX idx_workout_sessions_user ON public.workout_sessions(user_id);
CREATE INDEX idx_exercise_sets_session ON public.exercise_sets(session_id);
CREATE INDEX idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_id);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises (everyone can view, users can create custom)
CREATE POLICY "Anyone can view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Users can create custom exercises" ON public.exercises FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own exercises" ON public.exercises FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own exercises" ON public.exercises FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for workout_templates
CREATE POLICY "Users can view own templates" ON public.workout_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create templates" ON public.workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.workout_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.workout_templates FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for template_exercises
CREATE POLICY "Users can view own template exercises" ON public.template_exercises FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workout_templates WHERE id = template_id AND user_id = auth.uid()));
CREATE POLICY "Users can create template exercises" ON public.template_exercises FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_templates WHERE id = template_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own template exercises" ON public.template_exercises FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.workout_templates WHERE id = template_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own template exercises" ON public.template_exercises FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.workout_templates WHERE id = template_id AND user_id = auth.uid()));

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view own sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exercise_sets
CREATE POLICY "Users can view own sets" ON public.exercise_sets FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "Users can create sets" ON public.exercise_sets FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own sets" ON public.exercise_sets FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own sets" ON public.exercise_sets FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid()));

-- RLS Policies for personal_records
CREATE POLICY "Users can view own PRs" ON public.personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create PRs" ON public.personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own PRs" ON public.personal_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own PRs" ON public.personal_records FOR DELETE USING (auth.uid() = user_id);