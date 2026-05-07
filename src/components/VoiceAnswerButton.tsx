import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  options: string[];
  onAnswer: (index: number) => void;
  disabled?: boolean;
}

export const VoiceAnswerButton = ({ options, onAnswer, disabled }: Props) => {
  const recRef = useRef<any>(null);
  const [listening, setListening] = useState(false);

  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice not supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e: any) => {
      const said = (e.results[0][0].transcript || "").toLowerCase().trim();
      // Match letter (a/b/c/d) first
      const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4 };
      let idx = -1;
      const firstWord = said.split(/\s+/)[0];
      if (firstWord in letterMap && letterMap[firstWord] < options.length) idx = letterMap[firstWord];
      if (idx === -1) {
        idx = options.findIndex((o) => said.includes(o.toLowerCase()));
      }
      if (idx >= 0) { onAnswer(idx); toast.success(`Heard: ${said}`); }
      else toast.error(`Didn't match: "${said}"`);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); toast.error("Mic error"); };
    rec.start();
    recRef.current = rec;
    setListening(true);
  };
  const stop = () => { recRef.current?.stop?.(); setListening(false); };

  return (
    <Button type="button" size="sm" variant={listening ? "destructive" : "outline"}
      onClick={listening ? stop : start} disabled={disabled} className="gap-2">
      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {listening ? "Listening… tap to stop" : "Answer with voice"}
    </Button>
  );
};
