import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eraser, Volume2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { playTapSound, playCorrectSound, speakAmharic } from "@/lib/sounds";

type Item = { char: string; name: string; word: string; kind: "letter" | "number" };

const letterWords: Record<string, string> = {
  A: "Apple", B: "Ball", C: "Cat", D: "Dog", E: "Egg", F: "Fish", G: "Goat",
  H: "Hat", I: "Ice", J: "Jam", K: "Kite", L: "Lion", M: "Moon", N: "Nest",
  O: "Orange", P: "Pen", Q: "Queen", R: "Rain", S: "Sun", T: "Tree",
  U: "Umbrella", V: "Van", W: "Water", X: "Xylophone", Y: "Yarn", Z: "Zebra",
};

const numberWords: Record<string, string> = {
  "0": "Zero", "1": "One", "2": "Two", "3": "Three", "4": "Four",
  "5": "Five", "6": "Six", "7": "Seven", "8": "Eight", "9": "Nine",
};

const letters: Item[] = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map<Item>((c) => ({
    char: c, name: c, word: letterWords[c], kind: "letter",
  })),
  ...["0","1","2","3","4","5","6","7","8","9"].map<Item>((c) => ({
    char: c, name: c, word: numberWords[c], kind: "number",
  })),
];

const LetterTracing = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const { t } = useLanguage();

  const letter = letters[currentIndex];

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  useEffect(() => {
    clearCanvas();
  }, [currentIndex, clearCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "hsl(213, 45%, 62%)";
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
    if (hasDrawn) playCorrectSound();
  };

  const goNext = () => {
    if (currentIndex < letters.length - 1) {
      playTapSound();
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      playTapSound();
      setCurrentIndex((i) => i - 1);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">{t("tracing.title")}</h1>
          <p className="text-muted-foreground">Trace English letters A–Z and numbers 0–9</p>
        </div>

        <div className="mx-auto max-w-lg">
          <Card className="shadow-kinf-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {letters.length}
                </span>
                <Button variant="ghost" size="sm" onClick={() => speakAmharic(`${letter.name} for ${letter.word}`)} className="gap-1">
                  <Volume2 className="h-4 w-4" /> {letter.name} – {letter.word}
                </Button>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="select-none text-[10rem] font-bold text-muted/40 leading-none">
                    {letter.char}
                  </span>
                </div>
                <canvas
                  ref={canvasRef}
                  className="relative h-64 w-full cursor-crosshair rounded-xl border-2 border-dashed border-primary/30 bg-transparent touch-none"
                  style={{ width: "100%", height: "256px" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={goPrev} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> {t("lesson.previous")}
                </Button>
                <Button variant="outline" size="sm" onClick={clearCanvas} className="gap-1">
                  <Eraser className="h-4 w-4" /> {t("tracing.clear")}
                </Button>
                <Button size="sm" disabled={currentIndex === letters.length - 1} onClick={goNext} className="gap-1 bg-gradient-kinf hover:opacity-90">
                  {t("lesson.next")} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 space-y-3">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Letters</p>
              <div className="flex flex-wrap justify-center gap-2">
                {letters.filter((l) => l.kind === "letter").map((l) => {
                  const i = letters.indexOf(l);
                  return (
                    <motion.button
                      key={l.char}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { playTapSound(); setCurrentIndex(i); }}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold transition-colors ${
                        i === currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {l.char}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Numbers</p>
              <div className="flex flex-wrap justify-center gap-2">
                {letters.filter((l) => l.kind === "number").map((l) => {
                  const i = letters.indexOf(l);
                  return (
                    <motion.button
                      key={l.char}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { playTapSound(); setCurrentIndex(i); }}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold transition-colors ${
                        i === currentIndex ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {l.char}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterTracing;
