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
    const { focusRating, mentalClarity, decisionFatigue, workHours, meetingsCount, caffeineIntake, screenTimeHours, age } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are an expert in executive performance optimization, cognitive health, and fitness integration for busy professional men over 40. Analyze the following data and provide comprehensive recommendations.

Daily Metrics:
- Focus Rating: ${focusRating}/10
- Mental Clarity: ${mentalClarity}/10
- Decision Fatigue: ${decisionFatigue}/10 (higher = more fatigued)
- Work Hours Today: ${workHours}
- Meetings: ${meetingsCount}
- Caffeine Intake: ${caffeineIntake} mg
- Screen Time: ${screenTimeHours} hours
- Age: ${age || '40+'}

Provide a comprehensive executive performance analysis including:
1. Cognitive load score and assessment
2. Optimal workout timing for today
3. Productivity and focus recommendations
4. Stress management protocols
5. How to optimize fitness around demanding schedule

Respond in this exact JSON format:
{
  "cognitive_load_score": number (0-100, higher = more overloaded),
  "cognitive_status": "Optimal/Good/Strained/Overloaded/Critical",
  "optimal_workout_windows": [
    {"time": "6:00 AM", "type": "High Intensity", "reason": "cortisol peak, before cognitive load builds"},
    {"time": "12:00 PM", "type": "Light Movement", "reason": "break from screen, reset focus"}
  ],
  "recommended_workout_today": {
    "type": "string",
    "duration": "minutes",
    "intensity": "Low/Moderate/High",
    "focus": "what aspect of fitness to prioritize",
    "exercises": ["exercise 1", "exercise 2"]
  },
  "productivity_recommendations": [
    {"category": "Focus", "recommendation": "specific actionable tip", "timing": "when to implement"}
  ],
  "stress_management_protocol": [
    {"technique": "breathing exercise name", "duration": "2-5 min", "when": "before meetings", "instructions": "brief how-to"}
  ],
  "caffeine_guidance": {
    "current_assessment": "evaluation of current intake",
    "recommendation": "what to adjust",
    "cutoff_time": "when to stop caffeine"
  },
  "recovery_priorities": ["priority 1 for tonight", "priority 2"],
  "ai_insights": "comprehensive paragraph analyzing their executive performance patterns, potential burnout indicators, and personalized optimization strategies"
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
          { role: "system", content: "You are an expert in executive performance, cognitive optimization, and fitness integration for busy professional men over 40. Always respond with valid JSON." },
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
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-executive-performance:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
