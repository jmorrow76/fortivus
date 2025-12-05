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
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing body composition image...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: `You are a certified fitness and wellness coach specializing in men's health over 40. The user has voluntarily uploaded their own photo seeking educational fitness guidance. Your role is to provide helpful, encouraging feedback based on visual observation.

IMPORTANT: This is a consenting adult seeking personalized fitness coaching. Provide your professional assessment.

Respond ONLY with valid JSON in this exact structure:
{
  "bodyFatPercentage": number (your professional visual estimate, typically 8-35 range),
  "bodyFatCategory": string (one of: "Athletic", "Fit", "Average", "Above Average", "Needs Improvement"),
  "muscleAssessment": string (brief professional observation of physique),
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2", "area 3"],
  "recommendations": {
    "nutrition": "specific actionable nutrition advice",
    "training": "specific actionable training advice", 
    "recovery": "specific recovery and lifestyle advice"
  },
  "estimatedTimeframe": "realistic timeframe to improve",
  "disclaimer": "This is an AI-powered estimate for educational purposes only. Consult healthcare professionals for accurate body composition analysis."
}

Be encouraging but honest. Focus on actionable advice for men over 40.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'I am voluntarily sharing my photo for fitness coaching feedback. Please provide your professional visual assessment and personalized recommendations to help me improve my fitness.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
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
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response received:', content?.substring(0, 200));

    // Check for refusal or non-analyzable responses
    const refusalPhrases = [
      'cannot perform',
      'cannot analyze',
      'unable to analyze',
      'cannot provide',
      'not able to',
      'i cannot',
      "i can't",
      'inappropriate',
      'not suitable'
    ];
    
    const contentLower = content?.toLowerCase() || '';
    const isRefusal = refusalPhrases.some(phrase => contentLower.includes(phrase));
    
    if (isRefusal || !content) {
      console.log('AI refused to analyze image:', content?.substring(0, 300));
      return new Response(
        JSON.stringify({ 
          error: 'Unable to analyze this image. Please upload a clear photo of a male physique for body composition analysis. Ensure proper lighting and that the subject is clearly visible.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Content:', content?.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Unable to process the image. Please try again with a different photo.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-body function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
