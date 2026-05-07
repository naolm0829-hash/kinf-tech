import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTherapist } from "@/hooks/useTherapist";

const TherapistDashboard = () => {
  const { user } = useAuth();
  const { isTherapist, loading } = useTherapist();
  const [families, setFamilies] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);

  useEffect(() => {
    if (!isTherapist || !user) return;
    (async () => {
      const { data: links } = await supabase.from("therapist_clients").select("parent_id").eq("therapist_id", user.id);
      const ids = (links ?? []).map((l: any) => l.parent_id);
      if (ids.length === 0) return;
      const [{ data: profs }, { data: prog }, { data: bj }] = await Promise.all([
        supabase.from("profiles").select("*").in("user_id", ids),
        supabase.from("learning_progress").select("*").in("user_id", ids),
        supabase.from("behavior_journal").select("*").in("user_id", ids).order("entry_date", { ascending: false }).limit(50),
      ]);
      setFamilies(profs ?? []); setProgress(prog ?? []); setJournals(bj ?? []);
    })();
  }, [isTherapist, user]);

  if (loading) return <div className="p-12 text-center">Loading…</div>;
  if (!isTherapist) return <div className="p-12 text-center"><Stethoscope className="mx-auto mb-2 h-10 w-10 text-muted-foreground" /><p>Therapists only.</p></div>;

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="mb-6 flex items-center gap-2 text-3xl font-extrabold"><Stethoscope className="h-7 w-7 text-primary" /> Therapist Dashboard</h1>
        {families.length === 0
          ? <Card><CardContent className="p-6 text-center text-muted-foreground"><Users className="mx-auto mb-2 h-8 w-8" />No client families assigned yet. An admin can link parents to you.</CardContent></Card>
          : <div className="space-y-3">
              {families.map((f) => {
                const fp = progress.filter((p) => p.user_id === f.user_id);
                const fj = journals.filter((j) => j.user_id === f.user_id);
                return (
                  <Card key={f.id}><CardContent className="space-y-2 p-4">
                    <p className="font-bold">{f.parent_name ?? f.email} {f.child_name && <span className="text-sm text-muted-foreground">· child: {f.child_name}</span>}</p>
                    <p className="text-xs text-muted-foreground">Lessons completed total: {fp.reduce((a, p) => a + (p.lessons_completed || 0), 0)}</p>
                    {fj.slice(0, 3).map((j) => (
                      <div key={j.id} className="rounded border p-2 text-xs">
                        <b>{j.entry_date}</b> · mood: {j.mood} · triggers: {j.triggers ?? "—"} · {j.notes}
                      </div>
                    ))}
                  </CardContent></Card>
                );
              })}
            </div>}
      </div>
    </div>
  );
};
export default TherapistDashboard;
