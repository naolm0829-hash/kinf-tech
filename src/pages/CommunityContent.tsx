import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Heart, BookOpen, Puzzle, Palette, X, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  content_type: string;
  body: string;
  likes: number;
  created_at: string;
}

const categories = [
  { key: "all", label: "All", icon: BookOpen },
  { key: "activity", label: "Activities", icon: Puzzle },
  { key: "lesson", label: "Lessons", icon: BookOpen },
  { key: "pictogram", label: "Pictograms", icon: Palette },
  { key: "story", label: "Stories", icon: Users },
];

const CommunityContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "activity", content_type: "lesson", body: "" });

  const fetchContent = async () => {
    setLoading(true);
    let query = supabase.from("community_content").select("*").order("created_at", { ascending: false });
    if (activeCategory !== "all") query = query.eq("category", activeCategory);
    const { data, error } = await query;
    if (error) { console.error(error); toast.error("Failed to load content"); }
    else setItems((data as ContentItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, [activeCategory]);

  const handleSubmit = async () => {
    if (!user) { toast.error(t("community.signInRequired")); return; }
    if (!form.title.trim() || !form.description.trim()) { toast.error("Title and description are required"); return; }

    const { error } = await supabase.from("community_content").insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      content_type: form.content_type,
      body: form.body.trim(),
    });

    if (error) { console.error(error); toast.error("Failed to submit"); return; }
    toast.success(t("community.submitted"));
    setForm({ title: "", description: "", category: "activity", content_type: "lesson", body: "" });
    setShowForm(false);
    fetchContent();
  };

  const handleLike = async (id: string, currentLikes: number) => {
    if (!user) { toast.error(t("community.signInRequired")); return; }
    // Optimistic update
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, likes: currentLikes + 1 } : item)));
    const { error } = await supabase.from("community_content").update({ likes: currentLikes + 1 }).eq("id", id);
    if (error) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, likes: currentLikes } : item)));
      toast.error("Failed to like");
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">{t("community.title")}</h1>
          <p className="text-muted-foreground">{t("community.subtitle")}</p>
        </div>

        {/* Category tabs */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.key}
              variant={activeCategory === cat.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.key)}
              className={activeCategory === cat.key ? "bg-gradient-kinf" : ""}
            >
              <cat.icon className="mr-1 h-3 w-3" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Submit button */}
        {user && (
          <div className="mb-6 text-center">
            <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-gradient-kinf hover:opacity-90">
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? t("community.cancel") : t("community.contribute")}
            </Button>
          </div>
        )}

        {/* Submit form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Card className="mb-6 shadow-kinf-lg">
                <CardContent className="space-y-4 p-6">
                  <input
                    type="text"
                    placeholder={t("community.titlePlaceholder")}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    placeholder={t("community.descPlaceholder")}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex gap-3">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="flex-1 rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="activity">Activity</option>
                      <option value="lesson">Lesson</option>
                      <option value="pictogram">Pictogram</option>
                      <option value="story">Story</option>
                    </select>
                    <select
                      value={form.content_type}
                      onChange={(e) => setForm({ ...form, content_type: e.target.value })}
                      className="flex-1 rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="lesson">Lesson Plan</option>
                      <option value="game">Game/Activity</option>
                      <option value="visual">Visual Aid</option>
                      <option value="tip">Tip/Advice</option>
                    </select>
                  </div>
                  <textarea
                    placeholder={t("community.bodyPlaceholder")}
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    rows={5}
                    className="w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button onClick={handleSubmit} className="w-full gap-2 bg-gradient-kinf hover:opacity-90">
                    <Send className="h-4 w-4" />
                    {t("community.submit")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content grid */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-semibold text-muted-foreground">{t("community.empty")}</p>
            <p className="text-sm text-muted-foreground">{t("community.beFirst")}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="group h-full shadow-kinf transition-all hover:-translate-y-1 hover:shadow-kinf-lg">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-start justify-between">
                      <span className="rounded-full bg-kinf-blue-light px-2 py-0.5 text-xs font-semibold text-primary">
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="mb-1 text-base font-bold text-foreground">{item.title}</h3>
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    {item.body && (
                      <p className="mb-3 rounded-lg bg-muted p-3 text-xs text-foreground line-clamp-4">{item.body}</p>
                    )}
                    <button
                      onClick={() => handleLike(item.id, item.likes)}
                      className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-accent"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      {item.likes}
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityContent;
