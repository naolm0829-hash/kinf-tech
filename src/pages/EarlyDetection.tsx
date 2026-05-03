import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle, ChevronRight, Loader2, FileText, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Question {
  id: number;
  text: string;
  category: string;
}

const screeningQuestions: Question[] = [
  { id: 1, text: "Does your child respond when you call their name?", category: "Social Communication" },
  { id: 2, text: "Does your child make eye contact when you talk to them?", category: "Social Communication" },
  { id: 3, text: "Does your child point to things to show interest (e.g., an airplane)?", category: "Social Communication" },
  { id: 4, text: "Does your child play pretend or make-believe (e.g., feeding a doll)?", category: "Imaginative Play" },
  { id: 5, text: "Does your child follow simple instructions (e.g., 'give me the cup')?", category: "Language" },
  { id: 6, text: "Does your child use at least 10 words?", category: "Language" },
  { id: 7, text: "Does your child seem overly sensitive to sounds, textures, or lights?", category: "Sensory" },
  { id: 8, text: "Does your child show interest in other children?", category: "Social Interaction" },
  { id: 9, text: "Does your child have unusual repetitive movements (hand flapping, rocking)?", category: "Behavior" },
  { id: 10, text: "Does your child have difficulty with changes in routine?", category: "Behavior" },
  { id: 11, text: "Can your child sit still for a short activity (5+ minutes)?", category: "Attention" },
  { id: 12, text: "Does your child frequently lose things or get easily distracted?", category: "Attention" },
  { id: 13, text: "Does your child have difficulty recognizing letters or numbers for their age?", category: "Learning" },
  { id: 14, text: "Does your child mix up similar-looking letters (b/d, p/q)?", category: "Learning" },
  { id: 15, text: "What is your child's age in years?", category: "Demographics" },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/early-detection`;

const EarlyDetection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [phase, setPhase] = useState<"intro" | "questions" | "analyzing" | "report">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [report, setReport] = useState("");
  const [childAge, setChildAge] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reportRef.current) reportRef.current.scrollTop = reportRef.current.scrollHeight;
  }, [report]);

  const answerQuestion = (answer: string) => {
    const newAnswers = { ...answers, [screeningQuestions[currentQ].id]: answer };
    setAnswers(newAnswers);

    if (currentQ < screeningQuestions.length - 2) {
      setCurrentQ((prev) => prev + 1);
    } else if (currentQ === screeningQuestions.length - 2) {
      // Last real question done, ask for age
      setCurrentQ(screeningQuestions.length - 1);
    }
  };

  const submitAge = () => {
    if (!childAge.trim()) return;
    const newAnswers = { ...answers, [15]: childAge };
    setAnswers(newAnswers);
    generateReport(newAnswers);
  };

  const generateReport = async (finalAnswers: Record<number, string>) => {
    setPhase("analyzing");

    const summary = screeningQuestions.map((q) => `${q.text} → ${finalAnswers[q.id] || "N/A"}`).join("\n");

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ answers: summary }),
      });

      if (resp.status === 429) { toast.error("Rate limited — try again shortly."); setPhase("questions"); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setPhase("questions"); return; }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      setPhase("report");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) setReport((prev) => prev + c);
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate report.");
      setPhase("questions");
    }
  };

  const printReport = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>ክንፍTech Early Detection Report</title>
      <style>body{font-family:system-ui;max-width:700px;margin:40px auto;padding:20px;line-height:1.6}
      h1{color:#2563eb}h2{color:#374151;border-bottom:2px solid #e5e7eb;padding-bottom:8px}
      .disclaimer{background:#fef3c7;border:1px solid #f59e0b;padding:12px;border-radius:8px;margin:20px 0;font-size:14px}
      </style></head><body>
      <h1>🧠 ክንፍTech — Early Development Screening Report</h1>
      <div class="disclaimer">⚠️ This is a screening tool, NOT a medical diagnosis. Please share this report with a qualified healthcare professional.</div>
      <div>${report.replace(/\n/g, "<br>")}</div>
      <p style="margin-top:40px;font-size:12px;color:#9ca3af">Generated by ክንፍTech • ${new Date().toLocaleDateString()}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const progress = Math.round(((currentQ + 1) / screeningQuestions.length) * 100);
  const currentQuestion = screeningQuestions[currentQ];

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-kinf-blue-light">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-foreground">{t("detection.title")}</h1>
          <p className="mb-4 text-sm text-muted-foreground">{t("detection.subtitle")}</p>
          <div className="mb-6 rounded-xl border border-accent/30 bg-kinf-warm-light p-4 text-left text-xs text-foreground">
            <div className="mb-2 flex items-center gap-2 font-bold">
              <AlertTriangle className="h-4 w-4 text-accent" />
              {t("detection.disclaimer")}
            </div>
            <p className="text-muted-foreground">{t("detection.disclaimerText")}</p>
          </div>
          <Button size="lg" onClick={() => setPhase("questions")} className="gap-2 bg-gradient-kinf hover:opacity-90">
            <Brain className="h-4 w-4" />
            {t("detection.begin")}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (phase === "questions") {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto max-w-lg px-4">
          <h1 className="mb-6 text-center text-2xl font-extrabold text-foreground">{t("detection.title")}</h1>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{t("detection.question")} {currentQ + 1}/{screeningQuestions.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-kinf" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="shadow-kinf-lg">
                <CardContent className="p-6">
                  <span className="mb-2 inline-block rounded-full bg-kinf-blue-light px-3 py-1 text-xs font-semibold text-primary">
                    {currentQuestion.category}
                  </span>
                  <h2 className="mb-6 text-lg font-bold text-foreground">{currentQuestion.text}</h2>

                  {currentQ === screeningQuestions.length - 1 ? (
                    <div className="space-y-3">
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        placeholder="e.g. 3"
                        className="w-full rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button onClick={submitAge} className="w-full gap-2 bg-gradient-kinf hover:opacity-90">
                        <ChevronRight className="h-4 w-4" />
                        {t("detection.generateReport")}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {["Yes", "No", "Sometimes", "Not Sure"].map((opt) => (
                        <Button
                          key={opt}
                          variant={answers[currentQuestion.id] === opt ? "default" : "outline"}
                          onClick={() => answerQuestion(opt)}
                          className={answers[currentQuestion.id] === opt ? "bg-gradient-kinf" : ""}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-bold text-foreground">{t("detection.analyzing")}</h2>
          <p className="text-sm text-muted-foreground">{t("detection.analyzingDesc")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="mb-6 text-center text-2xl font-extrabold text-foreground">{t("detection.reportTitle")}</h1>
        <Card className="shadow-kinf-lg">
          <CardContent className="p-6">
            <div className="mb-4 rounded-xl border border-accent/30 bg-kinf-warm-light p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mr-1 inline h-3 w-3 text-accent" />
              {t("detection.disclaimerText")}
            </div>
            <div ref={reportRef} className="prose prose-sm max-h-[500px] overflow-y-auto text-foreground">
              {report.split("\n").map((line, i) => (
                <p key={i} className={line.startsWith("#") ? "font-bold text-lg" : ""}>{line.replace(/^#+\s*/, "")}</p>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={printReport} className="flex-1 gap-2 bg-gradient-kinf hover:opacity-90">
                <FileText className="h-4 w-4" />
                {t("detection.printReport")}
              </Button>
              <Button variant="outline" onClick={() => { setPhase("intro"); setAnswers({}); setCurrentQ(0); setReport(""); setChildAge(""); }}>
                {t("detection.startOver")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EarlyDetection;
