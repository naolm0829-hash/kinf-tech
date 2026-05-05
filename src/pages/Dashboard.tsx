import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TreePine, Star, BookOpen, Trophy, TrendingUp, Flame, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import RewardBadge from "@/components/RewardBadge";
import WeeklyInsights from "@/components/WeeklyInsights";
import jsPDF from "jspdf";
import { toast } from "sonner";

const badges = [
  { emoji: "🌟", label: "First Lesson", threshold: 1, type: "lessons" },
  { emoji: "📚", label: "5 Lessons", threshold: 5, type: "lessons" },
  { emoji: "🎓", label: "10 Lessons", threshold: 10, type: "lessons" },
  { emoji: "🏆", label: "Module Master", threshold: 1, type: "modules" },
  { emoji: "🧠", label: "Quiz Whiz", threshold: 5, type: "quiz" },
  { emoji: "🔥", label: "3-Day Streak", threshold: 3, type: "streak" },
];

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { progress, loading } = useProgress();

  // Module names and total lessons for reference
  const moduleInfo = [
    { label: t("dash.amharicPhonics"), totalLessons: 8, color: "bg-primary" },
    { label: t("dash.socialStories"), totalLessons: 6, color: "bg-secondary" },
    { label: t("dash.cognitiveGames"), totalLessons: 5, color: "bg-accent" },
  ];

  const progressData = moduleInfo.map((info, i) => {
    const p = progress.find((pr) => pr.module_index === i);
    const pct = p ? Math.round((p.lessons_completed / p.total_lessons) * 100) : 0;
    return { ...info, progress: pct };
  });

  // Milestones based on actual progress
  const completedModules = progress.filter((p) => p.completed).length;
  const totalQuizScore = progress.reduce((acc, p) => acc + (p.quiz_score ?? 0), 0);
  const totalLessonsCompleted = progress.reduce((acc, p) => acc + p.lessons_completed, 0);

  const milestones = [
    { text: `${totalLessonsCompleted} ${t("dash.milestone1")}`, icon: BookOpen, date: totalLessonsCompleted > 0 ? "✓" : "—", achieved: totalLessonsCompleted > 0 },
    { text: `${completedModules} ${t("dash.milestone2")}`, icon: Star, date: completedModules > 0 ? "✓" : "—", achieved: completedModules > 0 },
    { text: `${totalQuizScore} ${t("dash.milestone3")}`, icon: Trophy, date: totalQuizScore > 0 ? "✓" : "—", achieved: totalQuizScore > 0 },
  ];

  // Tree grows based on total lessons completed (across all 9 modules ≈ 60 lessons)
  const growthPct = Math.min(totalLessonsCompleted / 40, 1);

  // Streak tracking
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    if (!user) return;
    const key = `kinf-streak-${user.id}`;
    const data = JSON.parse(localStorage.getItem(key) || '{"count":0,"last":""}');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.last === today) {
      setStreak(data.count);
    } else if (data.last === yesterday) {
      const newCount = data.count + 1;
      localStorage.setItem(key, JSON.stringify({ count: newCount, last: today }));
      setStreak(newCount);
    } else {
      localStorage.setItem(key, JSON.stringify({ count: 1, last: today }));
      setStreak(1);
    }
  }, [user]);

  // Realistic tree: bigger canopy as growthPct grows
  const canopyRadius = 30 + growthPct * 60; // 30 → 90
  const trunkHeight = 90 + growthPct * 40;  // 90 → 130
  const fruits = Array.from({ length: completedModules }).slice(0, 6);

  const downloadReport = async () => {
    if (!user) return;
    toast.info("Generating report…");
    const { data: profile } = await supabase
      .from("profiles")
      .select("parent_name, child_name, child_age")
      .eq("user_id", user.id)
      .maybeSingle();

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 50;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageW, 80, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("KinfTech — Growth Tree Report", 40, 45);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 40, 65);

    y = 110;
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Child & Parent", 40, y); y += 18;
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text(`Parent: ${profile?.parent_name ?? "-"}`, 40, y); y += 16;
    doc.text(`Child:  ${profile?.child_name ?? "-"}${profile?.child_age ? ` (age ${profile.child_age})` : ""}`, 40, y); y += 28;

    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("Summary", 40, y); y += 18;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    doc.text(`Total lessons completed: ${totalLessonsCompleted}`, 40, y); y += 16;
    doc.text(`Modules finished: ${completedModules}`, 40, y); y += 16;
    doc.text(`Total quiz score: ${totalQuizScore}`, 40, y); y += 16;
    doc.text(`Current streak: ${streak} day(s)`, 40, y); y += 16;
    doc.text(`Growth Tree: ${Math.round(growthPct * 100)}% grown`, 40, y); y += 28;

    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("Module breakdown", 40, y); y += 18;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);

    if (progress.length === 0) {
      doc.text("No progress recorded yet.", 40, y); y += 16;
    } else {
      [...progress].sort((a, b) => a.module_index - b.module_index).forEach((p) => {
        if (y > 760) { doc.addPage(); y = 50; }
        const pct = Math.round((p.lessons_completed / p.total_lessons) * 100);
        const quiz = p.quiz_score !== null ? `   Quiz ${p.quiz_score}/${p.quiz_total}` : "";
        doc.text(`Module ${p.module_index + 1}:  ${p.lessons_completed}/${p.total_lessons} lessons  (${pct}%)${quiz}${p.completed ? "  [done]" : ""}`, 40, y);
        y += 16;
      });
    }

    y += 20;
    if (y > 740) { doc.addPage(); y = 50; }
    doc.setFont("helvetica", "italic"); doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Generated by KinfTech - Ethiopian special-needs learning platform.", 40, y);

    const filename = `KinfTech-Report-${(profile?.child_name ?? "child").replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    toast.success("Report downloaded");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md shadow-kinf">
          <CardContent className="p-8 text-center">
            <h2 className="mb-2 text-xl font-bold text-foreground">{t("dash.title")}</h2>
            <p className="text-sm text-muted-foreground">Please sign in to see your child's progress.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-foreground">{t("dash.title")}</h1>
          <p className="text-muted-foreground">{t("dash.subtitle")}</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          <Card className="shadow-kinf-lg">
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <TreePine className="h-5 w-5 text-secondary" />
                {t("dash.growthTree")}
              </h2>
              <div className="relative mx-auto h-72 w-full max-w-xs">
                <svg viewBox="0 0 240 280" className="h-full w-full" aria-label="Growth tree">
                  <defs>
                    <radialGradient id="canopy" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="hsl(135, 45%, 70%)" />
                      <stop offset="60%" stopColor="hsl(140, 50%, 50%)" />
                      <stop offset="100%" stopColor="hsl(145, 55%, 32%)" />
                    </radialGradient>
                    <linearGradient id="trunk" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="hsl(28, 35%, 28%)" />
                      <stop offset="50%" stopColor="hsl(28, 40%, 42%)" />
                      <stop offset="100%" stopColor="hsl(28, 35%, 24%)" />
                    </linearGradient>
                    <radialGradient id="ground" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="hsl(95, 40%, 65%)" />
                      <stop offset="100%" stopColor="hsl(95, 30%, 45%)" />
                    </radialGradient>
                  </defs>

                  {/* Ground / hill */}
                  <ellipse cx="120" cy="262" rx="110" ry="14" fill="url(#ground)" opacity="0.6" />

                  {/* Trunk (curved) */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    d={`M 120 258 C 110 ${258 - trunkHeight * 0.4}, 130 ${258 - trunkHeight * 0.7}, 120 ${258 - trunkHeight}`}
                    stroke="url(#trunk)"
                    strokeWidth={14}
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Branches */}
                  {growthPct > 0.2 && (
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      d={`M 120 ${258 - trunkHeight * 0.55} Q 95 ${258 - trunkHeight * 0.65}, 80 ${258 - trunkHeight * 0.85}`}
                      stroke="url(#trunk)" strokeWidth={5} strokeLinecap="round" fill="none"
                    />
                  )}
                  {growthPct > 0.4 && (
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      d={`M 120 ${258 - trunkHeight * 0.5} Q 145 ${258 - trunkHeight * 0.6}, 158 ${258 - trunkHeight * 0.8}`}
                      stroke="url(#trunk)" strokeWidth={5} strokeLinecap="round" fill="none"
                    />
                  )}

                  {/* Canopy — 3 overlapping circles for fluffy look */}
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.1, type: "spring", stiffness: 80, damping: 14 }}
                    style={{ transformOrigin: `120px ${258 - trunkHeight}px` }}
                  >
                    <circle cx="120" cy={258 - trunkHeight - canopyRadius * 0.3} r={canopyRadius} fill="url(#canopy)" />
                    <circle cx={120 - canopyRadius * 0.6} cy={258 - trunkHeight - canopyRadius * 0.1} r={canopyRadius * 0.75} fill="url(#canopy)" />
                    <circle cx={120 + canopyRadius * 0.6} cy={258 - trunkHeight - canopyRadius * 0.1} r={canopyRadius * 0.75} fill="url(#canopy)" />
                    <circle cx="120" cy={258 - trunkHeight - canopyRadius * 0.7} r={canopyRadius * 0.7} fill="url(#canopy)" opacity={0.95} />
                  </motion.g>

                  {/* Fruit / stars per completed module */}
                  {fruits.map((_, i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    const fx = 120 + Math.cos(angle) * canopyRadius * 0.7;
                    const fy = 258 - trunkHeight - canopyRadius * 0.3 + Math.sin(angle) * canopyRadius * 0.55;
                    return (
                      <motion.circle
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.4 + i * 0.15, type: "spring" }}
                        cx={fx} cy={fy} r={5}
                        fill="hsl(0, 70%, 55%)"
                        stroke="hsl(0, 60%, 35%)"
                        strokeWidth={1}
                      />
                    );
                  })}
                </svg>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {t("dash.starMilestone")}
              </p>
              <p className="mt-1 text-center text-[11px] text-muted-foreground">
                {totalLessonsCompleted} lessons · {completedModules} modules complete
              </p>
              <Button onClick={downloadReport} variant="outline" className="mt-4 w-full gap-2">
                <Download className="h-4 w-4" />
                Download progress report (PDF)
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="shadow-kinf">
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {t("dash.moduleProgress")}
                </h2>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <div className="space-y-4">
                    {progressData.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-semibold text-foreground">{item.label}</span>
                          <span className="text-muted-foreground">{item.progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-kinf">
              <CardContent className="p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <Trophy className="h-5 w-5 text-accent" />
                  {t("dash.recentMilestones")}
                </h2>
                <div className="space-y-3">
                  {milestones.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-3 rounded-xl p-3 ${m.achieved ? "bg-muted" : "bg-muted/50 opacity-60"}`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kinf-warm-light">
                        <m.icon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{m.text}</p>
                        <p className="text-xs text-muted-foreground">{m.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rewards & Badges */}
            <Card className="shadow-kinf">
              <CardContent className="p-6">
                <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-foreground">
                  <Flame className="h-5 w-5 text-accent" />
                  {t("rewards.title")}
                </h2>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-3xl">🔥</span>
                  <span className="text-2xl font-extrabold text-foreground">{streak}</span>
                  <span className="text-sm text-muted-foreground">{t("rewards.streak")}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {badges.map((b) => {
                    const earned =
                      b.type === "lessons" ? totalLessonsCompleted >= b.threshold :
                      b.type === "modules" ? completedModules >= b.threshold :
                      b.type === "quiz" ? totalQuizScore >= b.threshold :
                      streak >= b.threshold;
                    return <RewardBadge key={b.label} emoji={b.emoji} label={b.label} earned={earned} />;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-5xl">
          <WeeklyInsights />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
