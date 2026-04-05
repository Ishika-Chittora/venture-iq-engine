import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-chat-mode, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are VentureIQ, an expert startup risk analysis engine. Given a startup profile, produce a comprehensive evaluation.

You MUST respond with valid JSON matching this exact schema:
{
  "overallScore": <number 0-100>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "feasibility": {
    "market": <number 0-100>,
    "technical": <number 0-100>,
    "financial": <number 0-100>,
    "team": <number 0-100>,
    "timing": <number 0-100>
  },
  "competitors": [
    { "name": "<string>", "description": "<string>", "threat": "<High|Medium|Low>", "competitiveEdge": "<actionable tip to beat this competitor>" }
  ],
  "swot": {
    "strengths": [{ "text": "<string>", "impact": "<High|Medium|Low>" }],
    "weaknesses": [{ "text": "<string>", "impact": "<High|Medium|Low>" }],
    "opportunities": [{ "text": "<string>", "impact": "<High|Medium|Low>" }],
    "threats": [{ "text": "<string>", "impact": "<High|Medium|Low>" }]
  },
  "projections": [
    { "month": <1-24>, "revenue": <number>, "expenses": <number>, "profit": <number>, "runway": <number> }
  ],
  "burnRate": <monthly burn number>,
  "cacLtvRatio": <number>,
  "breakEvenMonth": <number 1-24>,
  "marketSentiment": <number 0-1>,
  "confidenceScore": <number 0-100, representing data reliability>,
  "summary": "<2-3 sentence executive summary>",
  "recommendations": ["<actionable recommendation>"],
  "actionPlan": {
    "week1": ["<Foundation task 1>", "<Foundation task 2>", "<Foundation task 3>"],
    "week2": ["<MVP/Validation task 1>", "<MVP/Validation task 2>", "<MVP/Validation task 3>"],
    "week3": ["<Marketing task 1>", "<Marketing task 2>", "<Marketing task 3>"],
    "week4": ["<Growth task 1>", "<Growth task 2>", "<Growth task 3>"]
  }
}

Rules:
- Generate exactly 24 monthly projections
- Generate 3-5 competitors, 3-4 items per SWOT category, 4-6 recommendations
- Generate 3-4 actionable tasks per week in the actionPlan (Week 1: Foundation & Setup, Week 2: MVP & Validation, Week 3: Marketing & Outreach, Week 4: Growth & Optimization)
- Base financial projections on the provided monthly burn rate and team size
- Calculate CAC/LTV ratio realistically for the industry
- Break-even month should be realistic (typically 12-24 for startups)
- Market sentiment between 0 and 1 based on industry trends
- confidenceScore: 80-100 if the niche is well-known with lots of data, 40-70 if moderately known, 10-39 if extremely niche with sparse data
- Overall score considers all feasibility axes plus financial health
- Risk level: 80+ = Low, 60-79 = Medium, 40-59 = High, <40 = Critical
- Return ONLY the JSON object, no markdown, no explanation`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Chat mode - contextual Q&A
    if (body.chatMode && body.messages) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: body.messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Evaluation mode
    const input = body;
    const userPrompt = `Evaluate this startup:
- Name: ${input.name}
- Description: ${input.description}
- Industry: ${input.industry}
- Target Market: ${input.targetMarket}
- Funding Stage: ${input.fundingStage}
- Monthly Burn: $${input.monthlyBurn}
- Team Size: ${input.teamSize}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI evaluation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(cleaned);

    if (typeof result.overallScore !== "number" || !result.feasibility || !result.projections) {
      throw new Error("Invalid evaluation structure from AI");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-startup error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Evaluation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
