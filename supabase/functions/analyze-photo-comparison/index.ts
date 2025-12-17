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
    const { beforeImageUrl, afterImageUrl, beforeDate, afterDate, beforeWeight, afterWeight, daysBetween } = await req.json();

    if (!beforeImageUrl || !afterImageUrl) {
      return new Response(
        JSON.stringify({ error: 'Both before and after images are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const weightContext = beforeWeight && afterWeight 
      ? `The user's weight changed from ${beforeWeight} lbs to ${afterWeight} lbs (${afterWeight - beforeWeight > 0 ? '+' : ''}${(afterWeight - beforeWeight).toFixed(1)} lbs).`
      : '';

    const prompt = `You are an expert fitness coach and body composition analyst specializing in transformation progress for men over 40.

Analyze these two progress photos - the FIRST image is the "BEFORE" photo from ${beforeDate}, and the SECOND image is the "AFTER" photo from ${afterDate}. There are ${daysBetween} days between these photos. ${weightContext}

Provide a detailed, encouraging analysis of the visible changes. Focus on:

1. **Body Composition Changes**: Identify specific areas where you can see changes in muscle definition, fat distribution, or overall physique
2. **Muscle Development**: Note any visible improvements in muscle mass, definition, or tone in specific body areas
3. **Posture & Confidence**: Comment on any changes in posture or body language between photos
4. **Estimated Progress**: Provide an estimated body fat percentage change range if visible (be conservative and note this is an estimate)
5. **Areas of Improvement**: Highlight the most noticeable positive changes
6. **Continued Focus Areas**: Suggest 2-3 areas to continue focusing on based on the progress shown

Be encouraging and supportive while remaining honest. Remember this is for a Christian faith-based fitness platform, so keep the tone uplifting and focused on stewardship of the body.

Respond in JSON format:
{
  "overallAssessment": "2-3 sentence summary of the transformation",
  "bodyCompositionChanges": ["change 1", "change 2", ...],
  "muscleImprovements": ["improvement 1", "improvement 2", ...],
  "postureNotes": "observations about posture/confidence",
  "estimatedBodyFatChange": "e.g., 'Approximately 2-4% reduction' or 'Difficult to assess from photos'",
  "topImprovements": ["most notable change 1", "most notable change 2", "most notable change 3"],
  "focusAreas": ["suggestion 1", "suggestion 2"],
  "encouragement": "A brief, faith-inspired encouragement message"
}`;

    console.log('Analyzing photo comparison...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: beforeImageUrl } },
              { type: "image_url", image_url: { url: afterImageUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log('AI response received:', content.substring(0, 200));

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return a structured response with the raw content
      analysis = {
        overallAssessment: content,
        bodyCompositionChanges: [],
        muscleImprovements: [],
        postureNotes: "",
        estimatedBodyFatChange: "Unable to estimate",
        topImprovements: [],
        focusAreas: [],
        encouragement: "Keep pressing forward in your journey!"
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-photo-comparison:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
