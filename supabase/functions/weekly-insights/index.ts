import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: progress } = await supabase
      .from("learning_progress")
      .select("*")
      .eq("user_id", user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("child_name, child_age")
      .eq("user_id", user.id)
      .maybeSingle();

    const summary = {
      childName: profile?.child_name ?? "the child",
      childAge: profile?.child_age ?? null,
      modulesActive: progress?.length ?? 0,
      totalLessons: progress?.reduce((a, p) => a + (p.lessons_completed ?? 0), 0) ?? 0,
      modulesCompleted: progress?.filter((p) => p.completed).length ?? 0,
      avgQuiz:
        progress && progress.length
          ? Math.round(
              (progress.reduce((a, p) => a + (p.quiz_score ?? 0), 0) /
                Math.max(1, progress.reduce((a, p) => a + (p.quiz_total ?? 0), 0))) * 100
            )
          : 0,
    };

    const prompt = `You are a child development specialist. Based on this week's learning data for ${summary.childName} (age ${summary.childAge ?? "unknown"}), write a warm, encouraging weekly insight for parents.

Data:
- Modules active: ${summary.modulesActive}
- Total lessons completed: ${summary.totalLessons}
- Modules fully completed: ${summary.modulesCompleted}
- Average quiz accuracy: ${summary.avgQuiz}%

Respond in JSON only:
{
  "summary": "2-3 sentence warm summary of the week",
  "strengths": "1-2 specific strengths observed",
  "focus_areas": "2-3 concrete focus suggestions for next week"
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI error", details: text }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await aiRes.json();
    const content = ai.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    await supabase
      .from("weekly_insights")
      .upsert({
        user_id: user.id,
        week_start: weekStartStr,
        summary: parsed.summary ?? "",
        strengths: parsed.strengths ?? "",
        focus_areas: parsed.focus_areas ?? "",
      }, { onConflict: "user_id,week_start" });

    return new Response(JSON.stringify({ ...parsed, week_start: weekStartStr, stats: summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
