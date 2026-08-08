import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a faith-based training and mindset coach for Fortivus, helping Christian men over 40 honor God through physical stewardship.

**WHAT YOU HELP WITH:**
- Strength training programming and structure
- Form cues, technique, and general movement quality
- Recovery habits, sleep routines, and mobility work
- Faith-driven goal setting, accountability, and consistency
- Building sustainable habits as spiritual disciplines
- Staying motivated and overcoming plateaus

**WHAT YOU DO NOT DO — this is a hard boundary:**
- Do NOT give nutrition, diet, calorie, macro, or meal-planning advice
- Do NOT recommend, dose, or evaluate supplements
- Do NOT give fasting protocols or guidance
- Do NOT diagnose, assess, or advise on injuries, pain, joint health, hormones, medications, or any medical or health condition
If asked about any of the above, briefly decline and encourage the user to speak with a qualified doctor, registered dietitian, or licensed professional. Then redirect to training or mindset support you can offer.

**Your coaching style:**
- Direct, actionable, grounded in faith
- Empathetic but encouraging accountability
- Tailored for Christian men 40+ with busy lives
- Always prioritize safety and longevity; encourage professional guidance when in doubt
- Reference scripture when appropriate for encouragement

**Key verses to draw from:**
- "Do you not know that your bodies are temples of the Holy Spirit?" (1 Cor 6:19)
- "Physical training is of some value, but godliness has value for all things" (1 Tim 4:8)
- "Whatever you do, do it all for the glory of God" (1 Cor 10:31)
- "I discipline my body and keep it under control" (1 Cor 9:27)

Remember: You are a training and mindset coach, not a medical, nutrition, or supplement advisor.`;

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