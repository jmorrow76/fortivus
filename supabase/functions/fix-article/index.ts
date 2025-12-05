import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('[FIX-ARTICLE] Regenerating Sleep Blueprint article...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert health and fitness writer specializing in content for men over 40. Write in a direct, authoritative tone that respects the reader's intelligence and experience. Focus on evidence-based information while keeping it practical and actionable.`
          },
          {
            role: 'user',
            content: `Write a comprehensive article titled "The Over-40 Sleep Blueprint: Why Recovery Matters More Than Ever"

Cover:
1. Why sleep becomes more critical after 40 (hormones, recovery, cognition)
2. The science of sleep quality vs quantity
3. Specific protocols for optimizing sleep (temperature, light, timing)
4. How sleep impacts testosterone, muscle recovery, and fat loss
5. Actionable tips for improving sleep quality tonight

CRITICAL FORMATTING REQUIREMENTS:
- Start with # for the main title
- Use ## for section headings
- Break content into SHORT paragraphs (2-4 sentences each)
- Add blank lines between paragraphs for readability
- Use bullet points or numbered lists where appropriate
- Never write walls of text - keep paragraphs digestible
- Make the article approximately 1500-2000 words

Make it genuinely valuable and actionable for men over 40.`
          }
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FIX-ARTICLE] API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('[FIX-ARTICLE] Generated content length:', content.length);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { error: updateError } = await supabase
      .from('articles')
      .update({ 
        content: content, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', '61df272c-5296-49e0-9452-b3b35634a4d9');

    if (updateError) {
      console.error('[FIX-ARTICLE] Update error:', updateError);
      throw updateError;
    }

    console.log('[FIX-ARTICLE] Successfully updated article');

    return new Response(JSON.stringify({ 
      success: true, 
      contentLength: content.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[FIX-ARTICLE] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
