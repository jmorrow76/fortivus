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
    const { daysOff, reasonForBreak, injuryDetails, currentFitnessLevel, previousTrainingFrequency, goals, age } = await req.json();
    
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
    let hormonalContext = '';
    let bodyAnalysisContext = '';
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user?.id) {
        // Fetch related data in parallel
        const [planResult, hormonalResult, bodyResult] = await Promise.all([
          supabase.from("personal_plans").select("plan_data, goals").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("hormonal_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("body_analysis_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
        ]);

        if (planResult.data) {
          console.log("[GENERATE-COMEBACK] Found user's previous AI plan");
          planContext = `
PREVIOUS AI FITNESS PLAN (before break):
Goals: ${planResult.data.goals}
Previous Training: ${planResult.data.plan_data?.workout?.daysPerWeek || 'Not specified'} days/week
Focus Areas: ${planResult.data.plan_data?.workout?.focusAreas?.join(', ') || 'Not specified'}

Build comeback protocol to progressively return to this training level.`;
        }

        if (hormonalResult.data) {
          hormonalContext = `
HORMONAL PROFILE: Recovery Quality ${hormonalResult.data.recovery_quality}/10, Stress Level ${hormonalResult.data.stress_level}/10. Consider hormonal state in recovery progression.`;
        }

        if (bodyResult.data) {
          bodyAnalysisContext = `
BODY ANALYSIS: Body Fat ${bodyResult.data.body_fat_percentage}%, Areas to Improve: ${bodyResult.data.areas_to_improve?.join(', ') || 'None specified'}. Factor body composition into comeback focus.`;
        }
      }
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
${planContext}
${hormonalContext}
${bodyAnalysisContext}

Create a progressive 4-week return protocol that:
1. Starts conservatively to prevent re-injury
2. Gradually increases volume and intensity
3. Includes recovery-focused elements
4. Addresses any injury concerns
5. Sets realistic expectations for someone over 40
6. If there's a previous plan, progresses toward those training levels

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
