
-- 1. Add email to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update handle_new_user to capture metadata from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, parent_name, child_name, child_age)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'parent_name',
    NEW.raw_user_meta_data->>'child_name',
    NULLIF(NEW.raw_user_meta_data->>'child_age','')::int
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      parent_name = COALESCE(EXCLUDED.parent_name, public.profiles.parent_name),
      child_name = COALESCE(EXCLUDED.child_name, public.profiles.child_name),
      child_age = COALESCE(EXCLUDED.child_age, public.profiles.child_age);
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint on user_id for profiles upsert if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 3. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'premium',
  status TEXT NOT NULL DEFAULT 'inactive',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert subscriptions" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update subscriptions" ON public.subscriptions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own inactive sub" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Payment receipts table
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 140,
  currency TEXT NOT NULL DEFAULT 'ETB',
  transaction_id TEXT NOT NULL,
  sender_phone TEXT,
  screenshot_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own receipts" ON public.payment_receipts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own receipts" ON public.payment_receipts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all receipts" ON public.payment_receipts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update receipts" ON public.payment_receipts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete receipts" ON public.payment_receipts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_payment_receipts_updated_at
  BEFORE UPDATE ON public.payment_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Storage bucket for receipts (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts','receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own receipts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins read all receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND public.has_role(auth.uid(),'admin'));

-- 6. Allow admin to delete profiles (to fully manage users)
CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- 7. Backfill emails for existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id AND p.email IS NULL;
