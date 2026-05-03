
CREATE TABLE public.community_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'activity',
  content_type text NOT NULL DEFAULT 'lesson',
  body text NOT NULL DEFAULT '',
  likes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community content"
ON public.community_content FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own content"
ON public.community_content FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
ON public.community_content FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
ON public.community_content FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_community_content_updated_at
  BEFORE UPDATE ON public.community_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
