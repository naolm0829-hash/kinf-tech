
CREATE TABLE public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_index INTEGER NOT NULL,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  total_lessons INTEGER NOT NULL,
  quiz_score INTEGER,
  quiz_total INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_index)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.learning_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.learning_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.learning_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
