import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface A { id: string; title: string; body: string; }

const Announcements = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<A[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("kinf-dismissed-ann") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("announcements").select("id,title,body").eq("active", true).order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => setItems((data ?? []) as A[]));
  }, [user]);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("kinf-dismissed-ann", JSON.stringify(next));
  };

  const visible = items.filter((i) => !dismissed.includes(i.id));
  if (!user || visible.length === 0) return null;

  return (
    <div className="container mx-auto max-w-5xl px-4 pt-3 space-y-2">
      {visible.map((a) => (
        <div key={a.id} className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-bold">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.body}</p>
          </div>
          <button onClick={() => dismiss(a.id)} aria-label="Dismiss"><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
        </div>
      ))}
    </div>
  );
};

export default Announcements;
