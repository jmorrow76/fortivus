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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user ID from the JWT token
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { goals, currentStats, preferences } = await req.json();
    console.log("[GENERATE-PLAN] Request received:", { goals, currentStats, preferences, userId });

    // Fetch the user's latest body analysis results
    let bodyAnalysisContext = '';
    let fastingContext = '';
    let hormonalContext = '';
    let sleepContext = '';
    let executiveContext = '';
    let comebackContext = '';
    
    if (userId) {
      // Fetch all relevant data in parallel for efficiency
      const [
        bodyAnalysisResult,
        fastingResult,
        hormonalResult,
        sleepResult,
        executiveResult,
        comebackResult
      ] = await Promise.all([
        supabase.from("body_analysis_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("fasting_logs").select("*").eq("user_id", userId).is("ended_at", null).order("started_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("hormonal_profiles").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("sleep_workout_adaptations").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("cognitive_metrics").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("comeback_protocols").select("*").eq("user_id", userId).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle()
      ]);

      // Body Analysis Context
      if (bodyAnalysisResult.data) {
        const latestAnalysis = bodyAnalysisResult.data;
        console.log("[GENERATE-PLAN] Found body analysis data");
        bodyAnalysisContext = `
BODY COMPOSITION ANALYSIS (from AI body scan):
- Body Fat Percentage: ${latestAnalysis.body_fat_percentage}%
- Body Fat Category: ${latestAnalysis.body_fat_category}
- Muscle Assessment: ${latestAnalysis.muscle_assessment}
- Strengths: ${latestAnalysis.strengths?.join(', ') || 'Not assessed'}
- Areas to Improve: ${latestAnalysis.areas_to_improve?.join(', ') || 'Not assessed'}
- Nutrition Recommendation: ${latestAnalysis.nutrition_recommendation || 'Not provided'}
- Training Recommendation: ${latestAnalysis.training_recommendation || 'Not provided'}
- Recovery Recommendation: ${latestAnalysis.recovery_recommendation || 'Not provided'}

IMPORTANT: Use this body analysis data to inform calorie targets, macro ratios, and training focus.
`;
      }

      // Fasting Context
      if (fastingResult.data) {
        const activeFast = fastingResult.data;
        console.log("[GENERATE-PLAN] User is currently fasting:", activeFast.fasting_type);
        const fastingIntensityMap: Record<string, number> = {
          'sunrise_sunset': 0.6, 'daniel_fast': 0.8, 'water_fast': 0.4, 'partial_fast': 0.75, 'esther_fast': 0.2,
        };
        const intensityModifier = fastingIntensityMap[activeFast.fasting_type] || 0.6;
        fastingContext = `
ACTIVE FASTING STATUS:
- Fast Type: ${activeFast.fasting_type.replace('_', ' ')}
- Target Duration: ${activeFast.target_duration_hours} hours
- Prayer Intentions: ${activeFast.prayer_intentions || 'Not specified'}

FASTING ADJUSTMENTS: Reduce workout intensity to ${Math.round(intensityModifier * 100)}% of normal. Focus on mobility, light cardio, and recovery. Mark workouts as "Modified for Fasting".
`;
      }

      // Hormonal Profile Context
      if (hormonalResult.data) {
        const hormonal = hormonalResult.data;
        console.log("[GENERATE-PLAN] Found hormonal profile data");
        hormonalContext = `
HORMONAL OPTIMIZATION DATA:
- Energy Pattern: Morning ${hormonal.energy_morning}/10, Afternoon ${hormonal.energy_afternoon}/10, Evening ${hormonal.energy_evening}/10
- Sleep: ${hormonal.sleep_hours} hours | Stress Level: ${hormonal.stress_level}/10
- Recovery Quality: ${hormonal.recovery_quality}/10 | Libido: ${hormonal.libido_level}/10
- Recommended Training Intensity: ${hormonal.training_intensity_recommendation || 'Standard'}
- AI Insights: ${hormonal.ai_insights || 'None'}

HORMONAL ADJUSTMENTS: Schedule intense workouts during peak energy times. Prioritize sleep and stress management. Consider training intensity based on hormonal state.
`;
      }

      // Sleep Adaptation Context
      if (sleepResult.data) {
        const sleep = sleepResult.data;
        console.log("[GENERATE-PLAN] Found sleep adaptation data");
        sleepContext = `
SLEEP & RECOVERY DATA:
- Recent Sleep: ${sleep.sleep_hours} hours | Quality: ${sleep.sleep_quality}/10
- Readiness Score: ${sleep.readiness_score}/100
- Intensity Modifier: ${sleep.intensity_modifier}x | Volume Modifier: ${sleep.volume_modifier}x
- AI Reasoning: ${sleep.ai_reasoning || 'None'}

SLEEP ADJUSTMENTS: Apply intensity/volume modifiers to training. Prioritize recovery if readiness is low (<60).
`;
      }

      // Executive Performance Context
      if (executiveResult.data) {
        const exec = executiveResult.data;
        console.log("[GENERATE-PLAN] Found executive performance data");
        executiveContext = `
EXECUTIVE PERFORMANCE DATA:
- Cognitive Load: ${exec.cognitive_load_score}/100 | Focus: ${exec.focus_rating}/10
- Mental Clarity: ${exec.mental_clarity}/10 | Decision Fatigue: ${exec.decision_fatigue}/10
- Work Hours: ${exec.work_hours} | Meetings: ${exec.meetings_count}
- Optimal Workout Windows: ${JSON.stringify(exec.optimal_workout_windows) || 'Not specified'}
- AI Insights: ${exec.ai_insights || 'None'}

EXECUTIVE ADJUSTMENTS: Schedule workouts during optimal windows. Keep sessions efficient for busy schedule. Consider cognitive load when planning intensity.
`;
      }

      // Comeback Protocol Context
      if (comebackResult.data) {
        const comeback = comebackResult.data;
        console.log("[GENERATE-PLAN] User has active comeback protocol");
        comebackContext = `
ACTIVE COMEBACK PROTOCOL:
- Days Off Training: ${comeback.days_off}
- Reason for Break: ${comeback.reason_for_break || 'Not specified'}
- Current Fitness Level: ${comeback.current_fitness_level}/10
- Previous Training Frequency: ${comeback.previous_training_frequency} days/week
- Injury Details: ${comeback.injury_details || 'None'}
- AI Guidance: ${comeback.ai_guidance || 'None'}

COMEBACK ADJUSTMENTS: Follow progressive return protocol. Start conservatively and gradually increase intensity/volume. Prioritize injury prevention and recovery.
`;
      }
    }

    // Fetch recommended products from database
    const { data: products, error: productsError } = await supabase
      .from("recommended_products")
      .select("id, title, description, amazon_url, category, price, is_featured")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true });

    if (productsError) {
      console.error("[GENERATE-PLAN] Error fetching products:", productsError);
    }

    const productsByCategory = products?.reduce((acc: Record<string, any[]>, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {}) || {};

    console.log("[GENERATE-PLAN] Found products by category:", Object.keys(productsByCategory));

    // Build product context for AI
    const productContext = products?.length 
      ? `
AVAILABLE RECOMMENDED PRODUCTS TO REFERENCE:
${products.map(p => `- ${p.title} (Category: ${p.category}, Price: ${p.price || 'N/A'}) - ID: ${p.id}`).join('\n')}

When recommending supplements or equipment, try to match with these product IDs when relevant. Include the product_id in your supplement recommendations if there's a matching product.
`
      : '';

    const systemPrompt = `You are a faith-based fitness coach and nutritionist specializing in Christian men over 40. Generate a comprehensive, personalized fitness plan that helps men steward their bodies as temples of the Holy Spirit.

Your approach integrates:
- Evidence-based fitness science optimized for men over 40
- Biblical wisdom about physical stewardship and discipline
- Practical guidance that fits busy lives with family and ministry commitments

${bodyAnalysisContext}

${fastingContext}

${hormonalContext}

${sleepContext}

${executiveContext}

${comebackContext}

${productContext}

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
      "benefit": "why it helps for their goals",
      "product_id": "matching product ID from recommended products if available, or null"
    }
  ],
  "recommendedGear": [
    {
      "name": "equipment name",
      "reason": "why this helps their training",
      "product_id": "matching product ID from recommended products if available, or null"
    }
  ],
  "bodyAnalysisIntegration": {
    "usedBodyData": boolean,
    "keyInsights": ["insight based on body analysis 1", "insight 2"],
    "adjustmentsMade": ["adjustment made based on body composition"]
  },
  "timeline": "realistic timeframe to see results",
  "keyPriorities": ["priority 1", "priority 2", "priority 3"]
}

Be specific, practical, and tailor everything to Christian men over 40. Focus on:
- Joint-friendly exercises that build sustainable strength
- Nutrition that fuels energy for family and ministry
- Evidence-based supplements with product recommendations when available
- Training as an act of stewardship, not vanity
- Building habits that honor God with the body He gave them
- If body composition data is available, USE IT to make specific adjustments to calorie targets and training focus`;

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

Generate a complete, actionable plan optimized for their specific situation. When recommending supplements or gear, match with the available recommended products by including their product_id. ${bodyAnalysisContext ? 'IMPORTANT: Incorporate the body analysis data above to make this plan highly personalized to their current body composition.' : ''} Remember: this man wants to steward his body well to serve God, his family, and his community with strength and vitality.`;

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

    // Enrich supplements and gear with full product details
    if (products?.length) {
      const productMap = new Map(products.map(p => [p.id, p]));
      
      if (plan.supplements) {
        plan.supplements = plan.supplements.map((supp: any) => {
          if (supp.product_id) {
            const product = productMap.get(supp.product_id);
            if (product) {
              return {
                ...supp,
                product: {
                  id: product.id,
                  title: product.title,
                  amazon_url: product.amazon_url,
                  price: product.price,
                }
              };
            }
          }
          return supp;
        });
      }

      if (plan.recommendedGear) {
        plan.recommendedGear = plan.recommendedGear.map((gear: any) => {
          if (gear.product_id) {
            const product = productMap.get(gear.product_id);
            if (product) {
              return {
                ...gear,
                product: {
                  id: product.id,
                  title: product.title,
                  amazon_url: product.amazon_url,
                  price: product.price,
                }
              };
            }
          }
          return gear;
        });
      }
    }

    console.log("[GENERATE-PLAN] Plan generated successfully with product integrations and body analysis:", {
      usedBodyData: plan.bodyAnalysisIntegration?.usedBodyData || false,
    });

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
