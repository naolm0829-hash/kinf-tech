import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, UserCircle2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/contexts/ChildContext";
import { toast } from "sonner";

const EMOJIS = ["🧒", "👧", "👦", "🧑", "👶", "🦄", "🐻", "🐼", "🦁", "🌟"];

const Children = () => {
  const { user } = useAuth();
  const { children, activeChild, setActiveChildId, refresh } = useChildren();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [notes, setNotes] = useState("");
  const [emoji, setEmoji] = useState("🧒");

  if (!user) return <div className="p-12 text-center">Please sign in.</div>;

  const add = async () => {
    if (!name.trim()) return toast.error("Enter a name");
    const { error } = await supabase.from("children").insert({
      parent_id: user.id, name: name.trim(),
      age: age ? parseInt(age) : null, notes: notes || null, avatar_emoji: emoji,
    });
    if (error) toast.error(error.message);
    else { toast.success("Child added"); setName(""); setAge(""); setNotes(""); refresh(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this child profile?")) return;
    await supabase.from("children").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="mb-2 text-3xl font-extrabold">My Children</h1>
        <p className="mb-6 text-muted-foreground">Switch between profiles to track each child separately.</p>

        <Card className="mb-6"><CardContent className="space-y-3 p-4">
          <h2 className="font-bold">Add new child</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <Textarea placeholder="Notes (interests, sensitivities…)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex flex-wrap gap-1">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => setEmoji(e)} className={`rounded-lg border px-2 py-1 text-xl ${emoji === e ? "border-primary bg-primary/10" : ""}`}>{e}</button>
            ))}
          </div>
          <Button onClick={add} className="gap-2"><Plus className="h-4 w-4" /> Add child</Button>
        </CardContent></Card>

        <div className="space-y-2">
          {children.map((c) => {
            const isActive = activeChild?.id === c.id;
            return (
              <Card key={c.id} className={isActive ? "border-primary" : ""}><CardContent className="flex items-center gap-3 p-3">
                <span className="text-3xl">{c.avatar_emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold">{c.name} {c.age && <span className="text-sm text-muted-foreground">· age {c.age}</span>}</p>
                  {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                </div>
                {isActive
                  ? <span className="flex items-center gap-1 text-xs text-primary"><Check className="h-3 w-3" /> Active</span>
                  : <Button size="sm" variant="outline" onClick={() => setActiveChildId(c.id)}>Switch</Button>}
                <Button size="sm" variant="destructive" onClick={() => del(c.id)}><Trash2 className="h-3 w-3" /></Button>
              </CardContent></Card>
            );
          })}
          {children.length === 0 && <p className="text-center text-sm text-muted-foreground"><UserCircle2 className="mx-auto mb-2 h-8 w-8" />No child profiles yet.</p>}
        </div>
      </div>
    </div>
  );
};
export default Children;
