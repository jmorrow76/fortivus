import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { age, sleepHours, stressLevel, energyMorning, energyAfternoon, energyEvening, libidoLevel, recoveryQuality } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are an expert in male hormonal health optimization for men over 40. Analyze the following data and provide personalized recommendations.

User Profile:
- Age: ${age}
- Average Sleep: ${sleepHours} hours
- Stress Level: ${stressLevel}/10
- Morning Energy: ${energyMorning}/10
- Afternoon Energy: ${energyAfternoon}/10
- Evening Energy: ${energyEvening}/10
- Libido Level: ${libidoLevel}/10
- Recovery Quality: ${recoveryQuality}/10

Based on this data, provide:

1. TRAINING_INTENSITY: A recommendation for optimal training intensity today (Low/Moderate/High/Very High) with explanation
2. NUTRITION_RECOMMENDATIONS: A JSON array of 5 specific nutrition recommendations to optimize testosterone and energy
3. SUPPLEMENT_RECOMMENDATIONS: A JSON array of 3-5 evidence-based supplement recommendations with dosages
4. AI_INSIGHTS: A comprehensive paragraph analyzing their hormonal health patterns and actionable advice

Consider testosterone optimization, cortisol management, sleep quality impact, and age-related hormonal changes.

Respond in this exact JSON format:
{
  "training_intensity": "string with intensity level and 2-3 sentence explanation",
  "nutrition_recommendations": ["recommendation 1", "recommendation 2", ...],
  "supplement_recommendations": [{"name": "supplement", "dosage": "amount", "timing": "when to take", "benefit": "why"}],
  "ai_insights": "comprehensive analysis paragraph"
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
          { role: "system", content: "You are an expert in male hormonal health and testosterone optimization. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-hormonal:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
