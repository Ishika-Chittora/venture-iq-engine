import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-chat-mode",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is missing");

    // ─── CHAT MODE (chatbot + compare summary) ───────────────────────
    if (body.chatMode) {
      const messages: Array<{ role: string; content: string }> = body.messages || [];

      const systemMsg = messages.find((m) => m.role === 'system')?.content || '';
      // findLast to get the most recent user message (not the first)
      const userMessages = messages.filter((m) => m.role === 'user');
      const latestUserMsg = userMessages[userMessages.length - 1]?.content || '';

      // Build conversation history (exclude system message)
      const history = messages
        .filter((m) => m.role !== 'system')
        .slice(0, -1) // exclude last user message, we'll add it below
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const fullPrompt = [
        systemMsg,
        history ? `\n\nConversation so far:\n${history}` : '',
        `\n\nUser: ${latestUserMsg}`,
        '\n\nAssistant:',
      ].join('');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error("Gemini returned no reply: " + JSON.stringify(data));
      }

      return new Response(JSON.stringify({ reply: reply.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── EVALUATION MODE (normal startup analysis) ────────────────────
    const prompt = `You are a startup evaluation AI. Analyze this startup idea and return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation. Just raw JSON.

Startup data: ${JSON.stringify(body)}

Return this exact JSON structure:
{
  "overallScore": <number 0-100>,
  "riskLevel": <"Low"|"Medium"|"High"|"Critical">,
  "burnRate": <monthly burn in dollars as number>,
  "cacLtvRatio": <number>,
  "breakEvenMonth": <number>,
  "marketSentiment": <number 0-1>,
  "summary": <string>,
  "confidenceScore": <number 0-1>,
  "feasibility": {
    "market": <number 0-100>,
    "technical": <number 0-100>,
    "financial": <number 0-100>,
    "team": <number 0-100>,
    "timing": <number 0-100>
  },
  "competitors": [
    { "name": <string>, "description": <string>, "threat": <"High"|"Medium"|"Low">, "competitiveEdge": <string> }
  ],
  "swot": {
    "strengths": [{ "text": <string>, "impact": <"High"|"Medium"|"Low"> }],
    "weaknesses": [{ "text": <string>, "impact": <"High"|"Medium"|"Low"> }],
    "opportunities": [{ "text": <string>, "impact": <"High"|"Medium"|"Low"> }],
    "threats": [{ "text": <string>, "impact": <"High"|"Medium"|"Low"> }]
  },
  "projections": [
    { "month": <number>, "revenue": <number>, "expenses": <number>, "profit": <number>, "runway": <number> }
  ],
  "recommendations": [<string>],
  "actionPlan": {
    "week1": [<string>],
    "week2": [<string>],
    "week3": [<string>],
    "week4": [<string>]
  }
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Gemini returned no content: " + JSON.stringify(data));
    }

    let rawText = data.candidates[0].content.parts[0].text;
    rawText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(rawText);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Edge function error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});