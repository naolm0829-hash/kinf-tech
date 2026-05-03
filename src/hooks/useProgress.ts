import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ModuleProgress {
  module_index: number;
  lessons_completed: number;
  total_lessons: number;
  quiz_score: number | null;
  quiz_total: number | null;
  completed: boolean;
}

export const useProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("learning_progress")
      .select("module_index, lessons_completed, total_lessons, quiz_score, quiz_total, completed")
      .eq("user_id", user.id);
    setProgress((data as ModuleProgress[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateLessonProgress = useCallback(
    async (moduleIndex: number, lessonsCompleted: number, totalLessons: number) => {
      if (!user) return;
      const { error } = await supabase.from("learning_progress").upsert(
        {
          user_id: user.id,
          module_index: moduleIndex,
          lessons_completed: lessonsCompleted,
          total_lessons: totalLessons,
          completed: lessonsCompleted >= totalLessons,
        },
        { onConflict: "user_id,module_index" }
      );
      if (!error) fetchProgress();
    },
    [user, fetchProgress]
  );

  const updateQuizScore = useCallback(
    async (moduleIndex: number, score: number, total: number, totalLessons: number) => {
      if (!user) return;
      const { error } = await supabase.from("learning_progress").upsert(
        {
          user_id: user.id,
          module_index: moduleIndex,
          lessons_completed: totalLessons,
          total_lessons: totalLessons,
          quiz_score: score,
          quiz_total: total,
          completed: true,
        },
        { onConflict: "user_id,module_index" }
      );
      if (!error) fetchProgress();
    },
    [user, fetchProgress]
  );

  const getModuleProgress = useCallback(
    (moduleIndex: number) => progress.find((p) => p.module_index === moduleIndex) ?? null,
    [progress]
  );

  return { progress, loading, updateLessonProgress, updateQuizScore, getModuleProgress };
};
