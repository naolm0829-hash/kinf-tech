import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Bot, User, ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assessment`;

async function streamChat({
  messages,
  lang,
  onDelta,
  onDone,
}: {
  messages: Message[];
  lang: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, lang }),
  });

  if (resp.status === 429) {
    toast.error("Rate limited — please wait a moment and try again.");
    onDone();
    return;
  }
  if (resp.status === 402) {
    toast.error("AI credits exhausted. Please add funds.");
    onDone();
    return;
  }
  if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const Assessment = () => {
  const { lang, t } = useLanguage();
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startAssessment = async () => {
    setStarted(true);
    setIsLoading(true);

    const initialMsg: Message = {
      role: "user",
      content: lang === "am" ? "ሰላም! ማጣሪያውን ለመጀመር እፈልጋለሁ።" : "Hello! I'd like to start the screening for my child.",
    };

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [initialMsg],
        lang,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast.error("Failed to connect to AI. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages,
        lang,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast.error("Failed to get response. Please try again.");
    }
  };

  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-kinf-blue-light">
            <Bot className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-foreground">{t("assess.title")}</h1>
          <p className="mb-6 text-sm text-muted-foreground">{t("assess.subtitle")}</p>
          <Button size="lg" onClick={startAssessment} className="gap-2 bg-gradient-kinf hover:opacity-90">
            <MessageSquare className="h-4 w-4" />
            {t("assess.begin")}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="mb-6 text-center text-2xl font-extrabold text-foreground">{t("assess.chatTitle")}</h1>
        <Card className="shadow-kinf-lg">
          <CardContent className="flex h-[500px] flex-col p-0">
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kinf-blue-light">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-gradient-kinf text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kinf-sage-light">
                        <User className="h-3.5 w-3.5 text-secondary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kinf-blue-light">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t("assess.placeholder")}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <Button size="icon" onClick={handleSend} disabled={isLoading} className="shrink-0 bg-gradient-kinf hover:opacity-90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-center">
                <Button variant="link" size="sm" asChild className="text-xs text-muted-foreground">
                  <a href="/learning-lab">
                    <ArrowRight className="mr-1 h-3 w-3" />
                    {t("assess.goToLab")}
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assessment;
