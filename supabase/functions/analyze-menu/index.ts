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
    const { imageBase64, goals, dailyProgress, macroGoals } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Menu image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate remaining macros for the day
    const remainingCalories = (macroGoals?.calories || 2000) - (dailyProgress?.calories || 0);
    const remainingProtein = (macroGoals?.protein || 150) - (dailyProgress?.protein || 0);
    const remainingCarbs = (macroGoals?.carbs || 200) - (dailyProgress?.carbs || 0);
    const remainingFat = (macroGoals?.fat || 65) - (dailyProgress?.fat || 0);

    const systemPrompt = `You are a nutrition expert helping a Christian man over 40 make healthy restaurant choices aligned with his fitness goals.

The user's fitness goal: ${goals?.fitnessGoal || 'general health'}
Experience level: ${goals?.experienceLevel || 'intermediate'}
Dietary preference: ${goals?.dietaryPreference || 'no restrictions'}

REMAINING MACROS FOR TODAY:
- Calories: ${remainingCalories} kcal remaining
- Protein: ${remainingProtein}g remaining
- Carbs: ${remainingCarbs}g remaining
- Fat: ${remainingFat}g remaining

Based on the menu image provided, recommend the TOP 3 menu items that:
1. Best fit within their remaining daily macros
2. Align with their fitness goal (${goals?.fitnessGoal || 'general health'})
3. Support muscle building and recovery for men over 40
4. Consider any dietary preferences

For each recommendation, provide:
- Item name (exactly as shown on menu)
- Estimated calories
- Estimated protein (g)
- Estimated carbs (g)
- Estimated fat (g)
- Brief reason why this is a good choice (1-2 sentences)

Also provide a brief "What to avoid" section listing 1-2 menu items that would not align with their goals and why.

Format your response as JSON with this structure:
{
  "recommendations": [
    {
      "name": "Item Name",
      "calories": 500,
      "protein": 35,
      "carbs": 40,
      "fat": 20,
      "reason": "High protein choice that fits your remaining macros..."
    }
  ],
  "avoid": [
    {
      "name": "Item to Avoid",
      "reason": "Very high in calories and low in protein..."
    }
  ],
  "tip": "A brief personalized tip for this meal"
}`;

    console.log('Analyzing menu with user context:', {
      goal: goals?.fitnessGoal,
      remainingCalories,
      remainingProtein
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this restaurant menu and recommend the best options based on my goals and remaining macros for today.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze menu' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = { rawResponse: content };
      }
    } catch (parseError) {
      console.log('Could not parse JSON, returning raw content');
      analysis = { rawResponse: content };
    }

    console.log('Menu analysis complete');

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing menu:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze menu';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
