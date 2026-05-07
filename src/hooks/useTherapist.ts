import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTherapist = () => {
  const { user } = useAuth();
  const [isTherapist, setIsTherapist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsTherapist(false); setLoading(false); return; }
    let cancelled = false;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "therapist").maybeSingle()
      .then(({ data }) => { if (!cancelled) { setIsTherapist(!!data); setLoading(false); } });
    return () => { cancelled = true; };
  }, [user]);

  return { isTherapist, loading };
};
