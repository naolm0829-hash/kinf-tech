import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Waves, Music2, Pause, Play } from "lucide-react";
import { motion } from "framer-motion";

const sounds = [
  { id: "rain", label: "Rain", url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_8cb749ba8e.mp3" },
  { id: "ocean", label: "Ocean", url: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_c8e6e0b1b1.mp3" },
  { id: "forest", label: "Forest", url: "https://cdn.pixabay.com/download/audio/2022/02/23/audio_24a36e8d56.mp3" },
];

const CalmCorner = () => {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [count, setCount] = useState(4);
  const [active, setActive] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPhase((p) => (p === "in" ? "hold" : p === "hold" ? "out" : "in"));
        return 4;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const play = (url: string, id: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (active === id) { setActive(null); return; }
    const a = new Audio(url); a.loop = true; a.volume = 0.5;
    a.play().catch(() => {});
    audioRef.current = a; setActive(id);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <h1 className="mb-2 text-4xl font-extrabold">🌿 Calm Corner</h1>
        <p className="mb-8 text-muted-foreground">Take a quiet moment. Breathe. Listen.</p>

        <Card className="mb-8">
          <CardContent className="flex flex-col items-center p-10">
            <motion.div
              animate={{ scale: phase === "in" ? 1.6 : phase === "hold" ? 1.6 : 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="flex h-44 w-44 items-center justify-center rounded-full bg-gradient-kinf shadow-kinf-lg"
            >
              <div className="text-center text-primary-foreground">
                <Wind className="mx-auto mb-1 h-7 w-7" />
                <p className="text-sm font-bold uppercase">{phase === "in" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out"}</p>
                <p className="text-3xl font-extrabold">{count}</p>
              </div>
            </motion.div>
            <p className="mt-6 text-sm text-muted-foreground">4 · 4 · 4 breathing</p>
          </CardContent>
        </Card>

        <h2 className="mb-3 flex items-center justify-center gap-2 text-xl font-bold"><Waves className="h-5 w-5" /> Soothing sounds</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {sounds.map((s) => (
            <Button key={s.id} variant={active === s.id ? "default" : "outline"} className="h-16 gap-2" onClick={() => play(s.url, s.id)}>
              {active === s.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <Music2 className="h-4 w-4" /> {s.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalmCorner;
