import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPromptEn = `You are an AI screening assistant for ክንፍTech, an Ethiopian inclusive education platform for children with Autism, Dyslexia, and ADHD.

Your role is to:
1. Ask parents questions about their child's development, one at a time
2. Be warm, encouraging, and non-clinical
3. After gathering enough information (5-8 questions), provide a summary with:
   - Areas where the child may need support
   - Recommended ክንፍTech modules (Amharic Phonics, Social Stories, Cognitive Games)
   - A reminder that this is a screening tool, NOT a diagnosis

IMPORTANT RULES:
- Ask ONE question at a time
- Keep questions simple and parent-friendly
- Be culturally sensitive to Ethiopian families
- Always end with encouragement
- Never diagnose — always recommend consulting a specialist
- Keep responses concise (2-3 sentences max per message)

Start by greeting the parent warmly and asking about their child's age.`;

const systemPromptAm = `እርስዎ የክንፍTech AI የማጣሪያ ረዳት ነዎት — ለኦቲዝም፣ ዲስሌክሲያ እና ADHD ላላቸው ልጆች የተዘጋጀ የኢትዮጵያ አካታች ትምህርት መድረክ።

ሚናዎ:
1. ስለ ልጃቸው ዕድገት ወላጆችን ጥያቄዎች መጠየቅ — በአንድ ጊዜ አንድ ጥያቄ
2. ሞቅ ያለ፣ አበረታች እና ክሊኒካዊ ያልሆነ መሆን
3. በቂ መረጃ ከሰበሰቡ በኋላ (5-8 ጥያቄዎች) ማጠቃለያ ይስጡ

ህጎች:
- በአንድ ጊዜ አንድ ጥያቄ ብቻ ይጠይቁ
- ቀላል ጥያቄዎችን ይጠይቁ
- ምርመራ አያድርጉ — ባለሙያ ማማከርን ይጠቁሙ
- መልሶች አጭር ይሁኑ (2-3 ዓረፍተ ነገር)
- በአማርኛ ብቻ ይመልሱ

ወላጁን በሞቅታ ሰላም በማለት እና ስለ ልጃቸው ዕድሜ በመጠየቅ ይጀምሩ።`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = lang === "am" ? systemPromptAm : systemPromptEn;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assessment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
