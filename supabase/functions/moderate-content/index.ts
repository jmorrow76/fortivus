import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MODERATE-CONTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { content, type } = await req.json();
    
    if (!content) {
      throw new Error("Content is required");
    }

    logStep("Moderating content", { type, contentLength: content.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a content moderator for a fitness community forum for men over 40. Your job is to determine if user-generated content is appropriate.

APPROVE content that:
- Discusses fitness, health, nutrition, training, recovery
- Shares personal experiences and motivation
- Asks questions about workouts, supplements, diet
- Offers helpful advice and encouragement
- Contains mild profanity in context

FLAG content that contains:
- Hate speech, discrimination, or harassment
- Spam or promotional content
- Medical advice that could be dangerous
- Personal attacks or bullying
- Explicit sexual content
- Violence or threats
- Misinformation about health/fitness

Respond with a JSON object:
{
  "approved": boolean,
  "reason": "brief explanation if not approved, empty string if approved",
  "confidence": number between 0 and 1
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please moderate this ${type || 'content'}:\n\n${content}` }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        logStep("Rate limited, approving by default");
        return new Response(JSON.stringify({ 
          approved: true, 
          reason: "", 
          confidence: 0.5,
          rateLimited: true 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    logStep("AI response received", { response: aiResponse.substring(0, 100) });

    // Parse the JSON response
    let result;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      logStep("Parse error, defaulting to approved", { error: parseError });
      result = { approved: true, reason: "", confidence: 0.5 };
    }

    logStep("Moderation complete", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // On error, approve by default to not block users
    return new Response(JSON.stringify({ 
      approved: true, 
      reason: "", 
      confidence: 0,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 so content still posts
    });
  }
});
