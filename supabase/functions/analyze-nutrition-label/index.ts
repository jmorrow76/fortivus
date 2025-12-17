import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a nutrition label and barcode analyzer. Your task is to extract nutritional information from food packaging labels, nutrition facts panels, or barcodes.

Analyze the image and extract the following information:
- Product name
- Brand (if visible)
- Serving size and unit
- Calories per serving
- Protein (grams)
- Carbohydrates (grams)
- Fat (grams)
- Fiber (grams, if available)

IMPORTANT:
- If this is a nutrition facts label, extract the exact values shown
- If this is a barcode, try to identify the product if possible
- Use standard serving sizes if not clearly visible
- Be conservative with estimates if values are unclear

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Product Name",
  "brand": "Brand Name or null",
  "serving_size": 100,
  "serving_unit": "g",
  "calories": 200,
  "protein": 10,
  "carbs": 25,
  "fat": 8,
  "fiber": 3,
  "confidence": "high|medium|low",
  "notes": "Any relevant notes about the extraction"
}

If you cannot read the label or barcode clearly, return:
{
  "error": "Could not read nutrition information from this image. Please try taking a clearer photo of the nutrition label."
}`;

    console.log('Sending request to Lovable AI for nutrition label analysis');

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
                text: 'Please analyze this nutrition label or barcode and extract the nutritional information.'
              },
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service is busy. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze nutrition label' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let nutritionData;
    try {
      // Remove markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      nutritionData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Could not interpret the nutrition label. Please try a clearer photo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!nutritionData.error) {
      nutritionData.calories = Math.round(Number(nutritionData.calories) || 0);
      nutritionData.protein = Math.round(Number(nutritionData.protein) || 0);
      nutritionData.carbs = Math.round(Number(nutritionData.carbs) || 0);
      nutritionData.fat = Math.round(Number(nutritionData.fat) || 0);
      nutritionData.fiber = nutritionData.fiber ? Math.round(Number(nutritionData.fiber)) : undefined;
      nutritionData.serving_size = Number(nutritionData.serving_size) || 100;
      nutritionData.serving_unit = nutritionData.serving_unit || 'g';
    }

    console.log('Returning nutrition data:', nutritionData);

    return new Response(
      JSON.stringify(nutritionData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-nutrition-label:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
