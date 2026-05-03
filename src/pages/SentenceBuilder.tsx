import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, X, Trash2, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { playTapSound, speakAmharic } from "@/lib/sounds";

const wordBank = [
  // Pronouns
  { emoji: "🙋", english: "I", amharic: "እኔ", group: "Pronouns" },
  { emoji: "👉", english: "you", amharic: "አንተ", group: "Pronouns" },
  { emoji: "👨", english: "he", amharic: "እሱ", group: "Pronouns" },
  { emoji: "👩", english: "she", amharic: "እሷ", group: "Pronouns" },
  { emoji: "👥", english: "we", amharic: "እኛ", group: "Pronouns" },
  { emoji: "👶", english: "child", amharic: "ልጅ", group: "Pronouns" },
  // Verbs
  { emoji: "▶️", english: "want", amharic: "እፈልጋለሁ", group: "Verbs" },
  { emoji: "🍽️", english: "eat", amharic: "መብላት", group: "Verbs" },
  { emoji: "🥤", english: "drink", amharic: "መጠጣት", group: "Verbs" },
  { emoji: "🛌", english: "sleep", amharic: "መተኛት", group: "Verbs" },
  { emoji: "🏃", english: "run", amharic: "መሮጥ", group: "Verbs" },
  { emoji: "🚶", english: "walk", amharic: "መራመድ", group: "Verbs" },
  { emoji: "🪑", english: "sit", amharic: "ቁጭ", group: "Verbs" },
  { emoji: "📚", english: "read", amharic: "ማንበብ", group: "Verbs" },
  { emoji: "✏️", english: "write", amharic: "መጻፍ", group: "Verbs" },
  { emoji: "🎨", english: "draw", amharic: "መሳል", group: "Verbs" },
  { emoji: "🤲", english: "play", amharic: "መጫወት", group: "Verbs" },
  { emoji: "🗣️", english: "speak", amharic: "መናገር", group: "Verbs" },
  { emoji: "👀", english: "see", amharic: "ማየት", group: "Verbs" },
  { emoji: "👂", english: "hear", amharic: "መስማት", group: "Verbs" },
  { emoji: "❤️", english: "love", amharic: "መውደድ", group: "Verbs" },
  { emoji: "🆘", english: "help", amharic: "እርዳታ", group: "Verbs" },
  { emoji: "🙏", english: "thank", amharic: "ማመስገን", group: "Verbs" },
  { emoji: "🛁", english: "wash", amharic: "መታጠብ", group: "Verbs" },
  // Nouns - food
  { emoji: "💧", english: "water", amharic: "ውሃ", group: "Food" },
  { emoji: "🥛", english: "milk", amharic: "ወተት", group: "Food" },
  { emoji: "🍞", english: "bread", amharic: "ዳቦ", group: "Food" },
  { emoji: "🍎", english: "apple", amharic: "ፖም", group: "Food" },
  { emoji: "🍌", english: "banana", amharic: "ሙዝ", group: "Food" },
  { emoji: "🍚", english: "rice", amharic: "ሩዝ", group: "Food" },
  { emoji: "🥚", english: "egg", amharic: "እንቁላል", group: "Food" },
  { emoji: "🍗", english: "meat", amharic: "ስጋ", group: "Food" },
  { emoji: "🍵", english: "tea", amharic: "ሻይ", group: "Food" },
  { emoji: "☕", english: "coffee", amharic: "ቡና", group: "Food" },
  // Places
  { emoji: "🏠", english: "home", amharic: "ቤት", group: "Places" },
  { emoji: "🏫", english: "school", amharic: "ትምህርት ቤት", group: "Places" },
  { emoji: "🏥", english: "hospital", amharic: "ሆስፒታል", group: "Places" },
  { emoji: "🛒", english: "shop", amharic: "ሱቅ", group: "Places" },
  { emoji: "🚽", english: "bathroom", amharic: "መጸዳጃ", group: "Places" },
  { emoji: "🛏️", english: "bed", amharic: "አልጋ", group: "Places" },
  { emoji: "🌳", english: "park", amharic: "ፓርክ", group: "Places" },
  // People
  { emoji: "👩", english: "mom", amharic: "እማማ", group: "People" },
  { emoji: "👨", english: "dad", amharic: "አባባ", group: "People" },
  { emoji: "🧒", english: "brother", amharic: "ወንድም", group: "People" },
  { emoji: "👧", english: "sister", amharic: "እህት", group: "People" },
  { emoji: "👵", english: "grandma", amharic: "አያት", group: "People" },
  { emoji: "👴", english: "grandpa", amharic: "ሙት አያት", group: "People" },
  { emoji: "🧑‍🏫", english: "teacher", amharic: "መምህር", group: "People" },
  { emoji: "🤝", english: "friend", amharic: "ጓደኛ", group: "People" },
  { emoji: "🧑‍⚕️", english: "doctor", amharic: "ሐኪም", group: "People" },
  // Feelings
  { emoji: "😊", english: "happy", amharic: "ደስታ", group: "Feelings" },
  { emoji: "😢", english: "sad", amharic: "ሀዘን", group: "Feelings" },
  { emoji: "😡", english: "angry", amharic: "ቁጣ", group: "Feelings" },
  { emoji: "😨", english: "scared", amharic: "ፍርሃት", group: "Feelings" },
  { emoji: "😴", english: "tired", amharic: "ድካም", group: "Feelings" },
  { emoji: "🤒", english: "sick", amharic: "ታምሟል", group: "Feelings" },
  { emoji: "🥶", english: "cold", amharic: "ቀዝቃዛ", group: "Feelings" },
  { emoji: "🥵", english: "hot", amharic: "ሙቀት", group: "Feelings" },
  { emoji: "😋", english: "hungry", amharic: "ራብ", group: "Feelings" },
  { emoji: "👅", english: "thirsty", amharic: "ጥም", group: "Feelings" },
  // Connectors
  { emoji: "✅", english: "yes", amharic: "አዎ", group: "Words" },
  { emoji: "🚫", english: "no", amharic: "አይ", group: "Words" },
  { emoji: "❓", english: "where", amharic: "የት", group: "Words" },
  { emoji: "❔", english: "what", amharic: "ምን", group: "Words" },
  { emoji: "🕐", english: "when", amharic: "መቼ", group: "Words" },
  { emoji: "👋", english: "hello", amharic: "ሰላም", group: "Words" },
  { emoji: "👋", english: "goodbye", amharic: "ደህና ሁን", group: "Words" },
  { emoji: "🙏", english: "please", amharic: "እባክህ", group: "Words" },
  { emoji: "🙏", english: "thank you", amharic: "አመሰግናለሁ", group: "Words" },
  { emoji: "🔜", english: "go to", amharic: "ወደ", group: "Words" },
  { emoji: "➕", english: "and", amharic: "እና", group: "Words" },
  { emoji: "🔁", english: "more", amharic: "ተጨማሪ", group: "Words" },
  { emoji: "🛑", english: "stop", amharic: "አቁም", group: "Words" },
  { emoji: "▶️", english: "now", amharic: "አሁን", group: "Words" },
];

interface SentenceWord {
  id: number;
  emoji: string;
  english: string;
  amharic: string;
}

const SentenceBuilder = () => {
  const [sentence, setSentence] = useState<SentenceWord[]>([]);
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("All");
  const { t } = useLanguage();
  let idCounter = 0;

  const groups = useMemo(() => ["All", ...Array.from(new Set(wordBank.map((w) => w.group)))], []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wordBank.filter((w) => {
      if (activeGroup !== "All" && w.group !== activeGroup) return false;
      if (!q) return true;
      return w.english.toLowerCase().includes(q) || w.amharic.includes(search);
    });
  }, [search, activeGroup]);

  const addWord = (word: typeof wordBank[0]) => {
    playTapSound();
    setSentence((prev) => [...prev, { ...word, id: Date.now() + idCounter++ }]);
  };

  const removeWord = (id: number) => {
    setSentence((prev) => prev.filter((w) => w.id !== id));
  };

  const speakSentence = () => {
    if (sentence.length === 0) return;
    const text = sentence.map((w) => w.english).join(" ");
    speakAmharic(text);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">{t("sentence.title")}</h1>
          <p className="text-muted-foreground">{t("sentence.subtitle")}</p>
        </div>

        <div className="mx-auto mb-6 max-w-3xl">
          <Card className="shadow-kinf-lg">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">{t("sentence.yourSentence")}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSentence([])} disabled={sentence.length === 0}>
                    <Trash2 className="mr-1 h-3 w-3" /> {t("sentence.clear")}
                  </Button>
                  <Button size="sm" onClick={speakSentence} disabled={sentence.length === 0} className="gap-1 bg-gradient-kinf hover:opacity-90">
                    <Volume2 className="h-3 w-3" /> {t("sentence.speak")}
                  </Button>
                </div>
              </div>
              <div className="flex min-h-[4rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-muted/50 p-3">
                <AnimatePresence>
                  {sentence.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("sentence.tapToAdd")}</p>
                  ) : (
                    sentence.map((w) => (
                      <motion.button
                        key={w.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => removeWord(w.id)}
                        className="group flex items-center gap-1 rounded-lg bg-card px-3 py-2 shadow-sm transition-colors hover:bg-destructive/10"
                      >
                        <span className="text-lg">{w.emoji}</span>
                        <span className="text-sm font-semibold text-foreground">{w.english}</span>
                        <X className="ml-1 h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto mb-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search words..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="mx-auto mb-4 flex max-w-3xl flex-wrap justify-center gap-2">
          {groups.map((g) => (
            <Button key={g} variant={activeGroup === g ? "default" : "outline"} size="sm"
              onClick={() => setActiveGroup(g)}
              className={activeGroup === g ? "bg-gradient-kinf hover:opacity-90" : ""}>
              {g}
            </Button>
          ))}
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {filtered.map((w) => (
            <motion.div key={`${w.group}-${w.english}`} whileTap={{ scale: 0.9 }}>
              <Card
                className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-kinf active:scale-95"
                onClick={() => addWord(w)}
              >
                <CardContent className="flex flex-col items-center p-3">
                  <span className="text-2xl">{w.emoji}</span>
                  <span className="mt-1 text-xs font-bold text-foreground">{w.english}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">No words found.</p>
        )}
      </div>
    </div>
  );
};

export default SentenceBuilder;
