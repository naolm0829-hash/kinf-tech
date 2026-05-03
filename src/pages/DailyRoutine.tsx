import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Check, GripVertical, RotateCcw, Volume2, Pencil, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { playTapSound, playCorrectSound, speakAmharic } from "@/lib/sounds";

interface RoutineItem {
  id: string;
  emoji: string;
  english: string;
  amharic: string;
  time: "morning" | "afternoon" | "evening";
}

const defaultRoutine: RoutineItem[] = [
  { id: "wake",     emoji: "⏰", english: "Wake Up",        amharic: "ንቃ",         time: "morning" },
  { id: "brush",    emoji: "🪥", english: "Brush Teeth",    amharic: "ጥርስ ቦረሽ",    time: "morning" },
  { id: "bfast",    emoji: "🥣", english: "Eat Breakfast",  amharic: "ቁርስ ብላ",     time: "morning" },
  { id: "dress",    emoji: "👕", english: "Get Dressed",    amharic: "ልብስ ልበስ",    time: "morning" },
  { id: "school",   emoji: "🎒", english: "Go to School",   amharic: "ትምህርት ቤት ሂድ", time: "morning" },
  { id: "study",    emoji: "📚", english: "Study",          amharic: "ተማር",        time: "afternoon" },
  { id: "lunch",    emoji: "🍽️", english: "Eat Lunch",      amharic: "ምሳ ብላ",      time: "afternoon" },
  { id: "play",     emoji: "🎨", english: "Play / Art",     amharic: "ተጫወት",       time: "afternoon" },
  { id: "exercise", emoji: "🏃", english: "Exercise",       amharic: "ስፖርት ስራ",    time: "afternoon" },
  { id: "dinner",   emoji: "🍲", english: "Eat Dinner",     amharic: "እራት ብላ",     time: "evening" },
  { id: "bath",     emoji: "🛁", english: "Take a Bath",    amharic: "ታጠብ",        time: "evening" },
  { id: "story",    emoji: "📖", english: "Story Time",     amharic: "ተረት ሰዓት",    time: "evening" },
  { id: "sleep",    emoji: "🛏️", english: "Go to Sleep",    amharic: "ተኛ",         time: "evening" },
];

const timeGroups = [
  { key: "morning"   as const, labelEn: "🌅 Morning",   labelAm: "🌅 ጠዋት" },
  { key: "afternoon" as const, labelEn: "☀️ Afternoon", labelAm: "☀️ ከሰዓት" },
  { key: "evening"   as const, labelEn: "🌙 Evening",   labelAm: "🌙 ማታ" },
];

const emptyForm: Omit<RoutineItem, "id"> = { emoji: "✨", english: "", amharic: "", time: "morning" };

const DailyRoutine = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const storageKey = `kinf-routine-v2-${user?.id ?? "guest"}`;

  const [items, setItems] = useState<RoutineItem[]>(defaultRoutine);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [editing, setEditing] = useState<RoutineItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved: RoutineItem[] = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length > 0) setItems(saved);
    } catch { /* ignore */ }
  }, [storageKey]);

  const persist = (next: RoutineItem[]) => {
    setItems(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const toggleComplete = (id: string) => {
    playTapSound();
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else { next.add(id); playCorrectSound(); }
      return next;
    });
  };

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const fromIdx = items.findIndex((i) => i.id === dragId);
    const toIdx = items.findIndex((i) => i.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    moved.time = items[toIdx].time;
    next.splice(toIdx, 0, moved);
    persist(next);
    setDragId(null);
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    persist(next);
  };

  const resetOrder = () => {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    setItems(defaultRoutine);
  };

  const openEdit = (item: RoutineItem) => {
    setEditing(item);
    setForm({ emoji: item.emoji, english: item.english, amharic: item.amharic, time: item.time });
  };
  const openAdd = () => { setAdding(true); setForm(emptyForm); };
  const closeDialog = () => { setEditing(null); setAdding(false); };

  const saveEdit = () => {
    if (!form.english.trim()) return;
    if (editing) {
      const next = items.map((i) => i.id === editing.id ? { ...i, ...form } : i);
      persist(next);
    } else {
      const newItem: RoutineItem = { id: `c-${Date.now()}`, ...form, english: form.english.trim(), amharic: form.amharic.trim() || form.english.trim() };
      persist([...items, newItem]);
    }
    closeDialog();
  };

  const deleteItem = (id: string) => {
    persist(items.filter((i) => i.id !== id));
    setCompleted((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const totalDone = completed.size;
  const totalItems = items.length;
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">{t("routine.title")}</h1>
          <p className="text-muted-foreground">{t("routine.subtitle")}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            👋 Parents: edit, add, delete, or drag steps to fit your child's day.
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-2xl">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-foreground">
              {totalDone}/{totalItems} {t("routine.completed")}
            </span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-gradient-kinf" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        <div className="mx-auto mb-4 flex max-w-2xl justify-end gap-2">
          <Button variant="outline" size="sm" onClick={openAdd} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add step
          </Button>
          <Button variant="outline" size="sm" onClick={resetOrder} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>

        <div className="mx-auto max-w-2xl space-y-8">
          {timeGroups.map((group) => {
            const groupItems = items.filter((item) => item.time === group.key);
            return (
              <div key={group.key}>
                <h2 className="mb-3 text-lg font-bold text-foreground">
                  {lang === "am" ? group.labelAm : group.labelEn}
                </h2>
                <div className="space-y-2">
                  {groupItems.map((item, idxInGroup) => {
                    const done = completed.has(item.id);
                    const globalIdx = items.indexOf(item);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idxInGroup * 0.04 }}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(item.id)}
                        className={dragId === item.id ? "opacity-50" : ""}
                      >
                        <Card className={`transition-all ${done ? "border-secondary/50 bg-secondary/10" : "hover:-translate-y-0.5 hover:shadow-kinf"}`}>
                          <CardContent className="flex items-center gap-2 p-3">
                            <button type="button" className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing" aria-label="Drag">
                              <GripVertical className="h-4 w-4" />
                            </button>

                            <span className="text-2xl">{item.emoji}</span>

                            <div className="flex-1 cursor-pointer" onClick={() => toggleComplete(item.id)}>
                              <p className={`font-bold text-sm ${done ? "text-secondary line-through" : "text-foreground"}`}>{item.english}</p>
                              <p className="text-xs text-muted-foreground">{item.amharic}</p>
                            </div>

                            <div className="flex flex-col">
                              <button onClick={() => moveItem(item.id, -1)} disabled={globalIdx === 0} className="text-xs text-muted-foreground disabled:opacity-20">▲</button>
                              <button onClick={() => moveItem(item.id, 1)} disabled={globalIdx === items.length - 1} className="text-xs text-muted-foreground disabled:opacity-20">▼</button>
                            </div>

                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); speakAmharic(item.english); }} aria-label="Listen">
                              <Volume2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)} aria-label="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.id)} aria-label="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>

                            <button
                              type="button"
                              onClick={() => toggleComplete(item.id)}
                              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${done ? "border-secondary bg-secondary text-secondary-foreground" : "border-muted-foreground/30"}`}
                              aria-label="Toggle complete"
                            >
                              {done && <Check className="h-3.5 w-3.5" />}
                            </button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                  {groupItems.length === 0 && <p className="text-xs italic text-muted-foreground">No steps here yet.</p>}
                </div>
              </div>
            );
          })}
        </div>

        <Dialog open={editing !== null || adding} onOpenChange={(o) => { if (!o) closeDialog(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit step" : "Add step"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Emoji</Label>
                <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={4} placeholder="📺" />
              </div>
              <div>
                <Label>Step name (English)</Label>
                <Input value={form.english} onChange={(e) => setForm({ ...form, english: e.target.value })} placeholder="Watch TV" />
              </div>
              <div>
                <Label>Amharic (optional)</Label>
                <Input value={form.amharic} onChange={(e) => setForm({ ...form, amharic: e.target.value })} placeholder="ቴሌቪዥን ተመልከት" />
              </div>
              <div>
                <Label>Time of day</Label>
                <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v as RoutineItem["time"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">🌅 Morning</SelectItem>
                    <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                    <SelectItem value="evening">🌙 Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={saveEdit} className="bg-gradient-kinf" disabled={!form.english.trim()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DailyRoutine;
