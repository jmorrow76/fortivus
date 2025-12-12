import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    let planContext = '';
    let fastingContext = '';
    let hormonalContext = '';
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user?.id) {
        // Fetch related data in parallel
        const [planResult, fastingResult, hormonalResult] = await Promise.all([
          supabase.from("personal_plans").select("plan_data, goals").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("fasting_logs").select("*").eq("user_id", user.id).is("ended_at", null).limit(1).maybeSingle(),
          supabase.from("hormonal_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
        ]);

        if (planResult.data) {
          console.log("[ANALYZE-SLEEP] Found user's AI plan");
          const todayWorkout = plannedWorkout || planResult.data.plan_data?.workout?.weeklySchedule?.[0];
          planContext = `
CURRENT AI FITNESS PLAN:
Goals: ${planResult.data.goals}
Today's Planned Workout: ${JSON.stringify(todayWorkout, null, 2)}

Adapt the workout from this plan based on sleep data.`;
        }

        if (fastingResult.data) {
          fastingContext = `
ACTIVE FAST: ${fastingResult.data.fasting_type.replace('_', ' ')} - Already requires reduced intensity. Compound this with sleep-based adjustments.`;
        }

        if (hormonalResult.data) {
          hormonalContext = `
HORMONAL PROFILE: Energy pattern Morning ${hormonalResult.data.energy_morning}/10, Recovery ${hormonalResult.data.recovery_quality}/10. Consider hormonal state when adapting workout.`;
        }
      }
    }

    const prompt = `You are an expert in sleep science and exercise physiology for men over 40. Analyze sleep data and adapt the planned workout accordingly.

Sleep Data:
- Hours Slept: ${sleepHours}
- Sleep Quality: ${sleepQuality}/10
- Sleep Disruptions: ${sleepDisruptions} times
- HRV Reading: ${hrvReading || 'Not available'}
- Resting Heart Rate: ${restingHeartRate || 'Not available'} bpm
- Age: ${age || '40+'}
${planContext}
${fastingContext}
${hormonalContext}

Planned Workout:
${JSON.stringify(plannedWorkout, null, 2)}

Based on sleep quality and recovery indicators:
1. Calculate a readiness score (0-100)
2. Determine intensity and volume modifiers
3. Suggest exercise swaps if needed (replace high-intensity with recovery-focused)
4. Add recovery additions if necessary
5. Provide clear reasoning

If user has an active fast or hormonal concerns, factor those into your adaptation.

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
