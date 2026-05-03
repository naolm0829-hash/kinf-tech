import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Plus, Trash2, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  mood: string;
  created_at: string;
}

const moods = ["😊", "😐", "😟", "😢", "😡", "😴", "🤗", "🤔"];

const ParentNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newText, setNewText] = useState("");
  const [selectedMood, setSelectedMood] = useState("😊");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  // Load from localStorage for now (no DB table yet for notes)
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`kinf-notes-${user.id}`);
    if (saved) setNotes(JSON.parse(saved));
  }, [user]);

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    if (user) localStorage.setItem(`kinf-notes-${user.id}`, JSON.stringify(updated));
  };

  const addNote = () => {
    if (!newText.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      text: newText.trim(),
      mood: selectedMood,
      created_at: new Date().toISOString(),
    };
    saveNotes([note, ...notes]);
    setNewText("");
    toast.success(t("notes.saved"));
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md shadow-kinf">
          <CardContent className="p-8 text-center">
            <h2 className="mb-2 text-xl font-bold text-foreground">{t("notes.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("notes.signInRequired")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">{t("notes.title")}</h1>
          <p className="text-muted-foreground">{t("notes.subtitle")}</p>
        </div>

        <div className="mx-auto max-w-2xl">
          {/* New note form */}
          <Card className="mb-6 shadow-kinf-lg">
            <CardContent className="p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={`rounded-lg p-2 text-xl transition-all ${
                      selectedMood === m ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder={t("notes.placeholder")}
                className="mb-3 min-h-[80px]"
              />
              <Button onClick={addNote} disabled={!newText.trim()} className="gap-2 bg-gradient-kinf hover:opacity-90">
                <Plus className="h-4 w-4" /> {t("notes.addNote")}
              </Button>
            </CardContent>
          </Card>

          {/* Notes list */}
          {notes.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>{t("notes.empty")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="shadow-sm">
                    <CardContent className="flex items-start gap-3 p-4">
                      <span className="mt-0.5 text-2xl">{note.mood}</span>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{note.text}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString()} · {new Date(note.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteNote(note.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentNotes;
