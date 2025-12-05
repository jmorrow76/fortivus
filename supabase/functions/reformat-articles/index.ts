import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[REFORMAT-ARTICLES] Starting article reformatting...');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch all published articles
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, content')
      .eq('is_published', true);

    if (fetchError) {
      console.error('[REFORMAT-ARTICLES] Error fetching articles:', fetchError);
      throw fetchError;
    }

    console.log(`[REFORMAT-ARTICLES] Found ${articles?.length || 0} articles to reformat`);

    const results = [];

    for (const article of articles || []) {
      console.log(`[REFORMAT-ARTICLES] Reformatting: ${article.title}`);

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
              content: `You are an expert content formatter. Your task is to improve the readability of articles by:
1. Breaking long paragraphs (more than 3-4 sentences) into shorter, digestible chunks
2. Adding blank lines between paragraphs for visual breathing room
3. Preserving ALL existing markdown formatting (headers ##, ###, bullet points, bold text, etc.)
4. NOT changing any of the actual content or meaning
5. NOT adding new content or removing existing content
6. Ensuring each paragraph is 2-4 sentences maximum

Return ONLY the reformatted article content. Do not add any introduction or explanation.`
            },
            {
              role: 'user',
              content: `Please reformat this article for better readability by breaking up long paragraphs:\n\n${article.content}`
            }
          ],
          max_tokens: 8000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[REFORMAT-ARTICLES] API error for ${article.title}:`, errorText);
        results.push({ id: article.id, title: article.title, status: 'error', error: errorText });
        continue;
      }

      const data = await response.json();
      const reformattedContent = data.choices[0].message.content;

      // Update the article in the database
      const { error: updateError } = await supabase
        .from('articles')
        .update({ content: reformattedContent, updated_at: new Date().toISOString() })
        .eq('id', article.id);

      if (updateError) {
        console.error(`[REFORMAT-ARTICLES] Update error for ${article.title}:`, updateError);
        results.push({ id: article.id, title: article.title, status: 'error', error: updateError.message });
      } else {
        console.log(`[REFORMAT-ARTICLES] Successfully reformatted: ${article.title}`);
        results.push({ id: article.id, title: article.title, status: 'success' });
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Article reformatting complete',
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[REFORMAT-ARTICLES] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
