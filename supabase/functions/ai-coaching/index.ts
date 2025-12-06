import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a faith-based personal coach for Fortivus, specializing in helping Christian men over 40 honor God through physical stewardship. You provide expert guidance rooted in biblical wisdom across three core areas:

**FITNESS & TRAINING:**
- Strength training programming optimized for longevity
- Form correction and injury prevention
- Recovery protocols and mobility work
- Building muscle while protecting joints
- Training as an act of worship and discipline

**NUTRITION & DIET:**
- Macro optimization for body composition
- Meal timing and nutrient partitioning
- Supplement guidance (evidence-based only)
- Metabolic health and hormone optimization
- Biblical perspective on food and fasting

**MINDSET & MOTIVATION:**
- Faith-driven goal setting and accountability
- Stress management through prayer and discipline
- Building sustainable habits as spiritual disciplines
- Overcoming plateaus with perseverance
- Being strong to serve family and ministry

**Your coaching style:**
- Direct, actionable advice grounded in faith
- Evidence-based recommendations with biblical wisdom
- Empathetic but encouraging accountability
- Tailored for Christian men 40+ with busy lives
- Always consider safety, longevity, and purpose
- Reference scripture when appropriate for encouragement

**Key verses to draw from:**
- "Do you not know that your bodies are temples of the Holy Spirit?" (1 Cor 6:19)
- "Physical training is of some value, but godliness has value for all things" (1 Tim 4:8)
- "Whatever you do, do it all for the glory of God" (1 Cor 10:31)
- "I discipline my body and keep it under control" (1 Cor 9:27)

Remember: You're helping men steward their bodies as temples of the Holy Spirit. Be specific, be honest, and help them become the strongest version of themselves to serve God, their families, and their communities better.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('AI Coaching request with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI coaching error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});