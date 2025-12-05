-- Create foods table (shared community database)
CREATE TABLE public.foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  calories INTEGER NOT NULL,
  protein NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat NUMERIC(6,1) NOT NULL DEFAULT 0,
  fiber NUMERIC(6,1) DEFAULT 0,
  serving_size NUMERIC(8,2) NOT NULL DEFAULT 100,
  serving_unit TEXT NOT NULL DEFAULT 'g',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_logs table for user food tracking
CREATE TABLE public.meal_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  food_id UUID REFERENCES public.foods(id),
  custom_food_name TEXT,
  custom_calories INTEGER,
  custom_protein NUMERIC(6,1),
  custom_carbs NUMERIC(6,1),
  custom_fat NUMERIC(6,1),
  servings NUMERIC(6,2) NOT NULL DEFAULT 1,
  meal_type TEXT NOT NULL DEFAULT 'snack',
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- Foods policies (community readable, authenticated can add)
CREATE POLICY "Anyone can view foods"
  ON public.foods FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add foods"
  ON public.foods FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Meal logs policies (user's own data only)
CREATE POLICY "Users can view their own meal logs"
  ON public.meal_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal logs"
  ON public.meal_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs"
  ON public.meal_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs"
  ON public.meal_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster food search
CREATE INDEX idx_foods_name ON public.foods USING gin(to_tsvector('english', name));
CREATE INDEX idx_meal_logs_user_date ON public.meal_logs(user_id, log_date);