import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2, ChevronLeft, ChevronRight } from "lucide-react";

const stories = [
  {
    title: "The Brave Little Lion",
    emoji: "🦁",
    pages: [
      "Once there was a little lion named Leo. Leo lived in the warm grasslands of Ethiopia.",
      "Leo was small but very brave. He helped his friends every day.",
      "One day, a baby zebra got stuck in the mud. Leo ran fast to help.",
      "Leo pulled and pulled until the zebra was free. Everyone cheered for Leo!",
      "From that day on, Leo learned: being kind is the bravest thing of all. The end.",
    ],
  },
  {
    title: "Sara and the Magic Coffee Tree",
    emoji: "☕",
    pages: [
      "Sara lived in a green village. Every morning she helped pick coffee beans.",
      "One day she found a tiny tree that sparkled in the sun.",
      "The tree whispered: 'Water me with kindness, and I will grow.'",
      "Sara watered it every day and shared with her friends.",
      "Soon the village had the sweetest coffee in all of Ethiopia. The end.",
    ],
  },
];

const Stories = () => {
  const [idx, setIdx] = useState(0);
  const [page, setPage] = useState(0);
  const story = stories[idx];

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="mb-6 text-3xl font-extrabold flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Read-Aloud Stories</h1>

        <div className="mb-4 flex flex-wrap gap-2">
          {stories.map((s, i) => (
            <Button key={i} variant={i === idx ? "default" : "outline"} size="sm" onClick={() => { setIdx(i); setPage(0); }}>
              {s.emoji} {s.title}
            </Button>
          ))}
        </div>

        <Card className="shadow-kinf-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-4 text-7xl">{story.emoji}</div>
            <h2 className="mb-6 text-2xl font-bold">{story.title}</h2>
            <p className="mb-6 text-xl leading-relaxed" style={{ letterSpacing: "0.03em", lineHeight: 1.9 }}>
              {story.pages[page]}
            </p>
            <Button onClick={() => speak(story.pages[page])} className="mb-6 gap-2">
              <Volume2 className="h-4 w-4" /> Read aloud
            </Button>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <span className="text-sm font-semibold text-muted-foreground">Page {page + 1} / {story.pages.length}</span>
              <Button variant="outline" size="sm" disabled={page >= story.pages.length - 1} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stories;
