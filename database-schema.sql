-- Complete Database Schema for Freemium Credit System
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- 1. USER PROFILES TABLE
-- ============================================================================

-- Create user_profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'premium', 'team_owner', 'team_member', 'admin')),
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 2. TEAMS AND TEAM MEMBERS
-- ============================================================================

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_members table for team membership
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team policies
CREATE POLICY "Team members can view their teams" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can update their teams" ON public.teams
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON public.teams
  FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Team owners can create teams" ON public.teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Team member policies
CREATE POLICY "Team members can view memberships" ON public.team_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage memberships" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = team_id AND t.owner_id = auth.uid()
    )
  );

-- Admin policies for both tables
CREATE POLICY "Admins can manage all teams" ON public.teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all team memberships" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 3. CREDIT TRANSACTIONS
-- ============================================================================

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'grant', 'refund')),
  amount INTEGER NOT NULL, -- Positive for credits added, negative for credits used
  description TEXT NOT NULL,
  feature_used TEXT, -- For usage transactions, what feature was used
  tokens_consumed INTEGER, -- For AI features, how many tokens were used
  stripe_payment_id TEXT, -- For purchase transactions
  admin_note TEXT, -- For admin-granted credits
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure either user_id or team_id is set, but not both
  CONSTRAINT check_user_or_team CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR 
    (user_id IS NULL AND team_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team members can view team transactions" ON public.credit_transactions
  FOR SELECT USING (
    team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = credit_transactions.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transactions" ON public.credit_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (true);

-- Create function to update credits after transaction
CREATE OR REPLACE FUNCTION public.update_credits_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    -- Update user credits
    UPDATE public.user_profiles 
    SET credits = credits + NEW.amount,
        updated_at = now()
    WHERE id = NEW.user_id;
  ELSIF NEW.team_id IS NOT NULL THEN
    -- Update team credits
    UPDATE public.teams 
    SET credits = credits + NEW.amount,
        updated_at = now()
    WHERE id = NEW.team_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_credit_transaction_created ON public.credit_transactions;
CREATE TRIGGER on_credit_transaction_created
  AFTER INSERT ON public.credit_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_credits_after_transaction();

-- ============================================================================
-- 4. SUBSCRIPTIONS
-- ============================================================================

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('premium', 'team')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  monthly_credits INTEGER NOT NULL DEFAULT 0, -- Credits allocated per month
  price_amount INTEGER, -- Price in cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure either user_id or team_id is set, but not both
  CONSTRAINT check_user_or_team_subscription CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR 
    (user_id IS NULL AND team_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team members can view team subscriptions" ON public.subscriptions
  FOR SELECT USING (
    team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = subscriptions.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
  FOR ALL WITH CHECK (true);

-- Function to grant monthly credits when subscription becomes active
CREATE OR REPLACE FUNCTION public.grant_monthly_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Only grant credits if subscription becomes active or renews
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active' OR NEW.current_period_start > OLD.current_period_start) THEN
    INSERT INTO public.credit_transactions (
      user_id,
      team_id,
      type,
      amount,
      description
    ) VALUES (
      NEW.user_id,
      NEW.team_id,
      'grant',
      NEW.monthly_credits,
      'Monthly subscription credits for ' || NEW.plan_type || ' plan'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription updates
DROP TRIGGER IF EXISTS on_subscription_updated ON public.subscriptions;
CREATE TRIGGER on_subscription_updated
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.grant_monthly_credits();

-- ============================================================================
-- 5. VIEWS AND UTILITY FUNCTIONS
-- ============================================================================

-- Create view for user dashboard data
CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.credits as personal_credits,
  up.created_at,
  -- Team information
  t.id as team_id,
  t.name as team_name,
  t.credits as team_credits,
  tm.role as team_role,
  -- Subscription information
  s.plan_type,
  s.status as subscription_status,
  s.current_period_end,
  s.monthly_credits
FROM public.user_profiles up
LEFT JOIN public.team_members tm ON up.id = tm.user_id
LEFT JOIN public.teams t ON tm.team_id = t.id
LEFT JOIN public.subscriptions s ON (s.user_id = up.id OR s.team_id = t.id)
WHERE up.id = auth.uid();

-- Function to get available credits for a user (personal + team)
CREATE OR REPLACE FUNCTION public.get_available_credits(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  personal_credits INTEGER := 0;
  team_credits INTEGER := 0;
BEGIN
  -- Get personal credits
  SELECT credits INTO personal_credits
  FROM public.user_profiles
  WHERE id = user_uuid;
  
  -- Get team credits if user is in a team
  SELECT COALESCE(t.credits, 0) INTO team_credits
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = user_uuid;
  
  RETURN COALESCE(personal_credits, 0) + COALESCE(team_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume credits (tries team credits first, then personal)
CREATE OR REPLACE FUNCTION public.consume_credits(
  user_uuid UUID,
  credit_amount INTEGER,
  feature_name TEXT,
  token_count INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  team_credits INTEGER := 0;
  personal_credits INTEGER := 0;
  team_uuid UUID := NULL;
  credits_to_use INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO personal_credits
  FROM public.user_profiles
  WHERE id = user_uuid;
  
  -- Check if user is in a team and get team credits
  SELECT t.id, t.credits INTO team_uuid, team_credits
  FROM public.teams t
  JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = user_uuid;
  
  -- Check if enough credits available
  IF COALESCE(personal_credits, 0) + COALESCE(team_credits, 0) < credit_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Use team credits first if available
  IF team_uuid IS NOT NULL AND team_credits >= credit_amount THEN
    -- Use team credits
    INSERT INTO public.credit_transactions (
      team_id, type, amount, description, feature_used, tokens_consumed
    ) VALUES (
      team_uuid, 'usage', -credit_amount, 
      'Used for ' || feature_name, feature_name, token_count
    );
  ELSIF team_uuid IS NOT NULL AND team_credits > 0 THEN
    -- Use partial team credits + personal credits
    credits_to_use := team_credits;
    INSERT INTO public.credit_transactions (
      team_id, type, amount, description, feature_used, tokens_consumed
    ) VALUES (
      team_uuid, 'usage', -credits_to_use, 
      'Used for ' || feature_name || ' (partial)', feature_name, token_count
    );
    
    -- Use remaining from personal credits
    INSERT INTO public.credit_transactions (
      user_id, type, amount, description, feature_used, tokens_consumed
    ) VALUES (
      user_uuid, 'usage', -(credit_amount - credits_to_use), 
      'Used for ' || feature_name || ' (remaining)', feature_name, token_count
    );
  ELSE
    -- Use only personal credits
    INSERT INTO public.credit_transactions (
      user_id, type, amount, description, feature_used, tokens_consumed
    ) VALUES (
      user_uuid, 'usage', -credit_amount, 
      'Used for ' || feature_name, feature_name, token_count
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. CREATE ADMIN USER (UPDATE EMAIL)
-- ============================================================================

-- Insert admin user (update the email to your admin email)
-- IMPORTANT: Change 'admin@example.com' to your actual admin email
INSERT INTO public.user_profiles (id, email, full_name, role, credits)
SELECT 
  id, 
  email, 
  'System Admin', 
  'admin', 
  1000
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  credits = 1000,
  updated_at = now();

-- ============================================================================
-- COMPLETED: Database schema is now ready!
-- ============================================================================