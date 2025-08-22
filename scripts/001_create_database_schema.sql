-- Create users profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  dietary_preferences TEXT[],
  allergies TEXT[],
  cooking_skill_level TEXT CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced')),
  household_size INTEGER DEFAULT 1,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal plans table
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  dietary_preferences TEXT[],
  total_calories INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_name TEXT NOT NULL,
  recipe_description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 1,
  calories_per_serving INTEGER,
  nutrition_info JSONB, -- protein, carbs, fat, fiber, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping lists table
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  items JSONB NOT NULL, -- array of {name, quantity, unit, category, checked}
  total_estimated_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved recipes table
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_name TEXT NOT NULL,
  recipe_description TEXT,
  ingredients JSONB NOT NULL,
  instructions TEXT[],
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 1,
  calories_per_serving INTEGER,
  nutrition_info JSONB,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for meal_plans
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plans" ON public.meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" ON public.meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meals
CREATE POLICY "Users can view meals from their meal plans" ON public.meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert meals to their meal plans" ON public.meals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update meals from their meal plans" ON public.meals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete meals from their meal plans" ON public.meals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- Create RLS policies for shopping_lists
CREATE POLICY "Users can view their own shopping lists" ON public.shopping_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping lists" ON public.shopping_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists" ON public.shopping_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists" ON public.shopping_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_recipes
CREATE POLICY "Users can view their own saved recipes" ON public.saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved recipes" ON public.saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved recipes" ON public.saved_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes" ON public.saved_recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week_start ON public.meal_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_meals_meal_plan_id ON public.meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_day_type ON public.meals(day_of_week, meal_type);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON public.shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_tags ON public.saved_recipes USING GIN(tags);

-- Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_recipes_updated_at
  BEFORE UPDATE ON public.saved_recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
