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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { goals, currentStats, preferences } = await req.json();
    console.log("[GENERATE-PLAN] Request received:", { goals, currentStats, preferences });

    const systemPrompt = `You are a faith-based fitness coach and nutritionist specializing in Christian men over 40. Generate a comprehensive, personalized fitness plan that helps men steward their bodies as temples of the Holy Spirit.

Your approach integrates:
- Evidence-based fitness science optimized for men over 40
- Biblical wisdom about physical stewardship and discipline
- Practical guidance that fits busy lives with family and ministry commitments

Return a JSON object with this exact structure:
{
  "diet": {
    "dailyCalories": number,
    "macros": {
      "protein": number (grams),
      "carbs": number (grams),
      "fats": number (grams)
    },
    "mealPlan": [
      {
        "meal": "Breakfast/Lunch/Dinner/Snack",
        "foods": ["food item 1", "food item 2"],
        "calories": number
      }
    ],
    "tips": ["tip 1", "tip 2", "tip 3"]
  },
  "workout": {
    "daysPerWeek": number,
    "focusAreas": ["area 1", "area 2"],
    "weeklySchedule": [
      {
        "day": "Monday/Tuesday/etc",
        "focus": "Muscle group or rest",
        "exercises": [
          {
            "name": "exercise name",
            "sets": number,
            "reps": "rep range or duration",
            "notes": "optional tips"
          }
        ]
      }
    ],
    "cardioRecommendation": "description of cardio approach"
  },
  "supplements": [
    {
      "name": "supplement name",
      "dosage": "recommended dosage",
      "timing": "when to take",
      "benefit": "why it helps for their goals"
    }
  ],
  "timeline": "realistic timeframe to see results",
  "keyPriorities": ["priority 1", "priority 2", "priority 3"]
}

Be specific, practical, and tailor everything to Christian men over 40. Focus on:
- Joint-friendly exercises that build sustainable strength
- Nutrition that fuels energy for family and ministry
- Evidence-based supplements
- Training as an act of stewardship, not vanity
- Building habits that honor God with the body He gave them`;

    const userPrompt = `Create a personalized fitness plan for a Christian man over 40 with the following details:

GOALS: ${goals}

CURRENT STATS:
- Age: ${currentStats?.age || 'Not specified'}
- Weight: ${currentStats?.weight || 'Not specified'}
- Height: ${currentStats?.height || 'Not specified'}
- Activity Level: ${currentStats?.activityLevel || 'Moderate'}
- Experience Level: ${currentStats?.experienceLevel || 'Intermediate'}

PREFERENCES:
- Diet preferences: ${preferences?.diet || 'No restrictions'}
- Workout location: ${preferences?.workoutLocation || 'Gym'}
- Time available: ${preferences?.timeAvailable || '45-60 minutes per session'}
- Equipment access: ${preferences?.equipment || 'Full gym access'}

Generate a complete, actionable plan optimized for their specific situation. Remember: this man wants to steward his body well to serve God, his family, and his community with strength and vitality.`;

    console.log("[GENERATE-PLAN] Calling Lovable AI...");

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("[GENERATE-PLAN] Rate limited");
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("[GENERATE-PLAN] Payment required");
        return new Response(JSON.stringify({ error: "AI service unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("[GENERATE-PLAN] AI error:", response.status, errorText);
      throw new Error("Failed to generate plan");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    console.log("[GENERATE-PLAN] Raw AI response received");

    // Extract JSON from response
    let plan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[GENERATE-PLAN] Parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    console.log("[GENERATE-PLAN] Plan generated successfully");

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate plan";
    console.error("[GENERATE-PLAN] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});