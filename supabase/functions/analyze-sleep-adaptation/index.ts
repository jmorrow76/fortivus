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
    const { sleepHours, sleepQuality, sleepDisruptions, hrvReading, restingHeartRate, plannedWorkout, age } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are an expert in sleep science and exercise physiology for men over 40. Analyze sleep data and adapt the planned workout accordingly.

Sleep Data:
- Hours Slept: ${sleepHours}
- Sleep Quality: ${sleepQuality}/10
- Sleep Disruptions: ${sleepDisruptions} times
- HRV Reading: ${hrvReading || 'Not available'}
- Resting Heart Rate: ${restingHeartRate || 'Not available'} bpm
- Age: ${age || '40+'}

Planned Workout:
${JSON.stringify(plannedWorkout, null, 2)}

Based on sleep quality and recovery indicators:
1. Calculate a readiness score (0-100)
2. Determine intensity and volume modifiers
3. Suggest exercise swaps if needed (replace high-intensity with recovery-focused)
4. Add recovery additions if necessary
5. Provide clear reasoning

Respond in this exact JSON format:
{
  "readiness_score": number (0-100),
  "readiness_level": "Excellent/Good/Moderate/Low/Poor",
  "intensity_modifier": number (0.5-1.2, where 1.0 is normal),
  "volume_modifier": number (0.5-1.2, where 1.0 is normal),
  "adapted_workout": {
    "type": "adapted workout type",
    "exercises": [{"name": "exercise", "sets": number, "reps": "string", "notes": "any modifications"}],
    "duration": "estimated minutes",
    "intensity": "Low/Moderate/High"
  },
  "exercise_swaps": [
    {"original": "original exercise", "replacement": "easier alternative", "reason": "why the swap"}
  ],
  "recovery_additions": [
    {"activity": "foam rolling", "duration": "10 min", "focus": "area to focus on"}
  ],
  "recommendations": ["tip 1", "tip 2"],
  "ai_reasoning": "comprehensive explanation of why these adaptations were made based on sleep data"
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
          { role: "system", content: "You are an expert in sleep science, recovery optimization, and exercise adaptation for men over 40. Always respond with valid JSON." },
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
    
    const adaptation = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(adaptation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-sleep-adaptation:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
