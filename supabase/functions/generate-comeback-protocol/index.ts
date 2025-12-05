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
    const { daysOff, reasonForBreak, injuryDetails, currentFitnessLevel, previousTrainingFrequency, goals, age } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are an expert fitness coach specializing in return-to-training protocols for men over 40. Create a comprehensive 4-week comeback protocol.

User Profile:
- Age: ${age || '40+'}
- Days Away from Training: ${daysOff}
- Reason for Break: ${reasonForBreak || 'General break'}
- Injury Details: ${injuryDetails || 'None specified'}
- Current Fitness Level: ${currentFitnessLevel}/10
- Previous Training Frequency: ${previousTrainingFrequency} days/week
- Goals: ${goals || 'Return to previous fitness level'}

Create a progressive 4-week return protocol that:
1. Starts conservatively to prevent re-injury
2. Gradually increases volume and intensity
3. Includes recovery-focused elements
4. Addresses any injury concerns
5. Sets realistic expectations for someone over 40

Respond in this exact JSON format:
{
  "week_1_protocol": {
    "focus": "string describing the week's focus",
    "training_days": number,
    "intensity": "percentage of normal",
    "volume": "percentage of normal",
    "workouts": [{"day": "Monday", "type": "workout type", "details": "specific workout", "duration": "minutes"}],
    "recovery_work": ["mobility work", "stretching", etc],
    "key_notes": "important reminders for this week"
  },
  "week_2_protocol": { same structure },
  "week_3_protocol": { same structure },
  "week_4_protocol": { same structure },
  "nutrition_adjustments": [
    {"phase": "Week 1-2", "focus": "description", "specifics": ["specific recommendation"]}
  ],
  "recovery_priorities": [
    {"priority": "Sleep", "recommendation": "8+ hours", "why": "explanation"}
  ],
  "warning_signs": ["sign that you're progressing too fast"],
  "progression_milestones": [
    {"week": 1, "milestone": "what success looks like"}
  ],
  "ai_guidance": "comprehensive paragraph with personalized advice and encouragement"
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
          { role: "system", content: "You are an expert fitness coach specializing in safe return-to-training protocols for men over 40. Always respond with valid JSON." },
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
    
    const protocol = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(protocol), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-comeback-protocol:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
