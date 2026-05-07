import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age: number | null;
  notes: string | null;
  avatar_emoji: string | null;
}

interface Ctx {
  children: Child[];
  activeChild: Child | null;
  setActiveChildId: (id: string | null) => void;
  refresh: () => Promise<void>;
  loading: boolean;
}

const ChildContext = createContext<Ctx>({} as Ctx);
export const useChildren = () => useContext(ChildContext);

export const ChildrenProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [list, setList] = useState<Child[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem("activeChildId"));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setList([]); setLoading(false); return; }
    const { data } = await supabase.from("children").select("*").eq("parent_id", user.id).order("created_at");
    setList((data ?? []) as Child[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (activeId) localStorage.setItem("activeChildId", activeId);
    else localStorage.removeItem("activeChildId");
  }, [activeId]);

  const activeChild = list.find((c) => c.id === activeId) ?? list[0] ?? null;

  return (
    <ChildContext.Provider value={{ children: list, activeChild, setActiveChildId: setActiveId, refresh, loading }}>
      {children}
    </ChildContext.Provider>
  );
};
