import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MOODS = ["😄 Happy", "🙂 Calm", "😐 Neutral", "😟 Anxious", "😢 Sad", "😠 Upset"];

interface Entry { id: string; entry_date: string; mood: string; triggers: string | null; notes: string | null; }

const BehaviorJournal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [mood, setMood] = useState(MOODS[0]);
  const [triggers, setTriggers] = useState("");
  const [notes, setNotes] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("behavior_journal").select("*").eq("user_id", user.id).order("entry_date", { ascending: false });
    setEntries((data ?? []) as Entry[]);
  };
  useEffect(() => { load(); }, [user]);

  if (!user) return <div className="p-12 text-center">Please sign in.</div>;

  const add = async () => {
    const { error } = await supabase.from("behavior_journal").insert({
      user_id: user.id, mood, triggers: triggers || null, notes: notes || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setTriggers(""); setNotes(""); load(); }
  };
  const del = async (id: string) => {
    await supabase.from("behavior_journal").delete().eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-3xl font-extrabold flex items-center gap-2"><Heart className="h-6 w-6 text-accent" /> Behavior Journal</h1>

        <Card className="mb-6">
          <CardContent className="space-y-3 p-5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Mood today</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <Button key={m} type="button" variant={mood === m ? "default" : "outline"} size="sm" onClick={() => setMood(m)}>{m}</Button>
                ))}
              </div>
            </div>
            <Input placeholder="Triggers (loud noise, transitions…)" value={triggers} onChange={(e) => setTriggers(e.target.value)} />
            <Textarea placeholder="Notes about today's behavior…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button onClick={add} className="gap-2"><Plus className="h-4 w-4" /> Save entry</Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {entries.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">{new Date(e.entry_date).toLocaleDateString()}</p>
                  <p className="font-semibold">{e.mood}</p>
                  {e.triggers && <p className="text-sm"><b>Triggers:</b> {e.triggers}</p>}
                  {e.notes && <p className="text-sm text-muted-foreground">{e.notes}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => del(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
          {entries.length === 0 && <p className="text-center text-sm text-muted-foreground">No entries yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default BehaviorJournal;
