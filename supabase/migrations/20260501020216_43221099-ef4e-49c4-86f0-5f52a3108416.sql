-- Roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Authenticated can view roles"
  ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin god-mode policies
CREATE POLICY "Admins full access community"
  ON public.community_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all progress"
  ON public.learning_progress FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update all progress"
  ON public.learning_progress FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete progress"
  ON public.learning_progress FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Weekly insights
CREATE TABLE public.weekly_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  focus_areas TEXT NOT NULL DEFAULT '',
  strengths TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own insights"
  ON public.weekly_insights FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own insights"
  ON public.weekly_insights FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own insights"
  ON public.weekly_insights FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER weekly_insights_updated_at
  BEFORE UPDATE ON public.weekly_insights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();