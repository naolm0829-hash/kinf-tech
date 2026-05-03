import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a child development screening assistant for ክንፍTech, an Ethiopian special needs education platform.

You will receive parent answers to a developmental screening questionnaire. Analyze the responses and generate a detailed, compassionate report.

IMPORTANT RULES:
- This is a SCREENING TOOL, NOT a diagnosis
- Be compassionate and encouraging
- Highlight strengths first, then areas of concern
- Suggest specific next steps
- Recommend professional consultation when appropriate

REPORT STRUCTURE:
1. **Summary** - Brief overview of findings
2. **Strengths Observed** - Positive developmental indicators
3. **Areas for Attention** - Potential concerns grouped by category (Communication, Behavior, Attention, Learning)
4. **Risk Indicators** - Flag if patterns suggest possible ASD, ADHD, or Dyslexia traits (emphasize this is NOT a diagnosis)
5. **Recommended Next Steps** - Actionable suggestions including:
   - Activities on ክንፍTech (Learning Lab, Pictogram Board, etc.)
   - Professional referrals if warranted
   - Home activities parents can try
6. **Resources** - Where to seek help in Ethiopia (pediatricians, special education centers)

Keep the tone warm, professional, and hopeful. Use clear language a parent can understand.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here are the parent's screening answers:\n\n${answers}\n\nPlease generate a comprehensive developmental screening report.` },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("early-detection error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
