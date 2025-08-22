-- Add tables for meal plan sharing and subscription management

-- Add meal plan shares table for tracking shared meal plans
CREATE TABLE IF NOT EXISTS meal_plan_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_method TEXT NOT NULL CHECK (share_method IN ('link', 'email')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add subscriptions table for detailed subscription tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'premium', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add preferred_cuisines column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_cuisines TEXT[] DEFAULT '{}';

-- Add stripe_customer_id to profiles for payment processing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add cuisine column to meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS cuisine TEXT;

-- Enable RLS on new tables
ALTER TABLE meal_plan_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meal_plan_shares
CREATE POLICY "Users can view their own meal plan shares" ON meal_plan_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plan shares" ON meal_plan_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_plan_shares_user_id ON meal_plan_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_shares_meal_plan_id ON meal_plan_shares(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
