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
    const { joints, age, recentTrainingLoad, trainingHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const jointsData = joints.map((j: any) => 
      `- ${j.name}: Pain ${j.painLevel}/10, Stiffness ${j.stiffnessLevel}/10, ROM ${j.rangeOfMotion}%`
    ).join('\n');

    const prompt = `You are an expert in sports medicine and injury prevention for men over 40. Analyze the following joint health data and provide predictive injury risk assessment.

User Profile:
- Age: ${age}
- Recent Training Load: ${recentTrainingLoad}/10
- Training History: ${trainingHistory || 'Not specified'}

Joint Assessments:
${jointsData}

Provide a comprehensive analysis for EACH joint including:
1. Risk score (0-100) based on pain, stiffness, and range of motion
2. Key risk factors
3. Preventive recommendations
4. Exercises to avoid or modify
5. Mobility protocol recommendations

Respond in this exact JSON format:
{
  "overall_risk_level": "Low/Moderate/High/Critical",
  "joint_analyses": [
    {
      "joint_name": "string",
      "risk_score": number,
      "risk_factors": ["factor1", "factor2"],
      "preventive_recommendations": ["rec1", "rec2"],
      "exercises_to_avoid": ["exercise1"],
      "mobility_protocol": [{"exercise": "name", "sets": number, "reps": "string", "frequency": "daily/weekly"}]
    }
  ],
  "general_recommendations": ["overall recommendation 1", "recommendation 2"],
  "warning_signs": ["sign to watch for 1", "sign 2"],
  "ai_analysis": "comprehensive paragraph about their joint health status and long-term outlook"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert in sports medicine, injury prevention, and joint health for aging athletes. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-joint-health:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
