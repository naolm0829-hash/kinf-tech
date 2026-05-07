import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { playSuccessSound, playTapSound } from "@/lib/sounds";

const EMOJI = ["🐶", "🐱", "🐰", "🦁", "🐸", "🐼", "🐧", "🦊"];

interface Card { id: number; emoji: string; flipped: boolean; matched: boolean; }

const shuffle = () => {
  const deck: Card[] = [...EMOJI, ...EMOJI]
    .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, id: i }));
  return deck;
};

const MemoryMatch = () => {
  const [cards, setCards] = useState<Card[]>(shuffle);
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (cards.length && cards.every((c) => c.matched)) { setWon(true); playSuccessSound(); }
  }, [cards]);

  const flip = (id: number) => {
    if (picked.length === 2) return;
    const c = cards.find((x) => x.id === id);
    if (!c || c.flipped || c.matched) return;
    playTapSound();
    const next = cards.map((x) => x.id === id ? { ...x, flipped: true } : x);
    setCards(next);
    const np = [...picked, id];
    setPicked(np);
    if (np.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = np.map((pid) => next.find((x) => x.id === pid)!);
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setCards((cs) => cs.map((x) => x.emoji === a.emoji ? { ...x, matched: true } : x));
          setPicked([]);
        }, 400);
      } else {
        setTimeout(() => {
          setCards((cs) => cs.map((x) => np.includes(x.id) ? { ...x, flipped: false } : x));
          setPicked([]);
        }, 800);
      }
    }
  };

  const reset = () => { setCards(shuffle()); setPicked([]); setMoves(0); setWon(false); };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Memory Match</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold">Moves: {moves}</span>
            <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="mr-1 h-3 w-3" /> Reset</Button>
          </div>
        </div>

        {won && (
          <Card className="mb-4 border-secondary bg-secondary/10">
            <CardContent className="flex items-center gap-3 p-4">
              <Trophy className="h-6 w-6 text-secondary" />
              <p className="font-bold">You won in {moves} moves! 🎉</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-4 gap-3">
          {cards.map((c) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => flip(c.id)}
              className={`aspect-square rounded-2xl border-2 text-4xl shadow-kinf transition-colors ${
                c.matched ? "border-secondary bg-secondary/20" : c.flipped ? "border-primary bg-card" : "border-border bg-muted"
              }`}
              aria-label={c.flipped || c.matched ? c.emoji : "hidden card"}
            >
              {(c.flipped || c.matched) ? c.emoji : "❓"}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryMatch;
