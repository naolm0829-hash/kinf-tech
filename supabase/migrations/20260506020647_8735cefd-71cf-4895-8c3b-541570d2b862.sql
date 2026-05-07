-- Behavior journal
CREATE TABLE public.behavior_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL DEFAULT current_date,
  mood text NOT NULL,
  triggers text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.behavior_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal" ON public.behavior_journal FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all journal" ON public.behavior_journal FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bj_updated BEFORE UPDATE ON public.behavior_journal FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Announcements (admin -> all users)
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed reads active announcements" ON public.announcements FOR SELECT TO authenticated USING (active = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Promo codes (admin creates, applies discount/free months)
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  free_months integer NOT NULL DEFAULT 1,
  max_uses integer NOT NULL DEFAULT 100,
  uses integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read active codes" ON public.promo_codes FOR SELECT TO authenticated USING (active = true OR has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage codes" ON public.promo_codes FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Promo redemptions
CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code_id)
);
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own redemptions" ON public.promo_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own redemption" ON public.promo_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RPC: redeem promo code -> activates premium for free_months
CREATE OR REPLACE FUNCTION public.redeem_promo(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_code public.promo_codes;
  v_expires timestamptz;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not signed in'); END IF;
  SELECT * INTO v_code FROM public.promo_codes WHERE code = upper(trim(_code)) AND active = true;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','invalid code'); END IF;
  IF v_code.uses >= v_code.max_uses THEN RETURN jsonb_build_object('ok',false,'error','code exhausted'); END IF;
  IF EXISTS (SELECT 1 FROM public.promo_redemptions WHERE user_id = v_uid AND code_id = v_code.id) THEN
    RETURN jsonb_build_object('ok',false,'error','already redeemed');
  END IF;
  v_expires := now() + (v_code.free_months || ' months')::interval;
  INSERT INTO public.promo_redemptions(user_id, code_id) VALUES (v_uid, v_code.id);
  UPDATE public.promo_codes SET uses = uses + 1 WHERE id = v_code.id;
  INSERT INTO public.subscriptions(user_id, plan, status, activated_at, expires_at)
  VALUES (v_uid, 'premium', 'active', now(), v_expires)
  ON CONFLICT (user_id) DO UPDATE SET status='active', plan='premium', activated_at=now(),
    expires_at = GREATEST(COALESCE(public.subscriptions.expires_at, now()), v_expires);
  RETURN jsonb_build_object('ok',true,'expires_at',v_expires);
END;
$$;

-- Ensure subscriptions has unique user_id for upsert
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_key') THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;