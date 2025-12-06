import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WORKOUT-RECOMMENDATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { moodLevel, stressLevel, energyLevel, sleepQuality, notes } = await req.json();
    
    logStep("Received check-in data", { moodLevel, stressLevel, energyLevel, sleepQuality });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Christian fitness coach specializing in training men over 40. Based on daily mood, stress, energy, and sleep data, you provide personalized workout recommendations that adapt to how they feel, along with scripture-based encouragement.

Your recommendations should:
- Be realistic and safe for men over 40
- Adjust intensity based on energy and sleep quality
- Include recovery options when stress is high
- Focus on functional fitness and longevity
- Include a relevant Bible verse that connects physical discipline to spiritual growth
- Be encouraging and supportive from a faith perspective

Respond with a JSON object:
{
  "workoutType": "strength" | "cardio" | "flexibility" | "recovery" | "active_recovery",
  "intensity": "low" | "moderate" | "high",
  "duration": number (minutes),
  "title": "Short workout title",
  "description": "2-3 sentence description of the workout",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": number or null,
      "reps": "rep range or duration",
      "notes": "optional form tips"
    }
  ],
  "warmup": "Brief warmup description",
  "cooldown": "Brief cooldown description",
  "motivationalNote": "Personalized encouragement based on their state",
  "devotional": {
    "verse": "The scripture reference (e.g., 1 Corinthians 9:27)",
    "text": "The full verse text",
    "reflection": "A 2-3 sentence reflection connecting this scripture to today's workout and their current state"
  }
}`;

    const userPrompt = `Today's check-in for a man over 40:
- Mood: ${moodLevel}/5 (${getMoodLabel(moodLevel)})
- Stress: ${stressLevel}/5 (${getStressLabel(stressLevel)})
- Energy: ${energyLevel}/5 (${getEnergyLabel(energyLevel)})
- Sleep Quality: ${sleepQuality ? `${sleepQuality}/5` : 'Not reported'}
${notes ? `- Additional notes: ${notes}` : ''}

Based on this data, generate a personalized workout recommendation for today. Consider their current state and provide an appropriate workout that will help them feel better while respecting their energy levels.`;

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        logStep("Rate limited");
        return new Response(JSON.stringify({ 
          error: "Rate limited. Please try again later.",
          recommendation: getDefaultRecommendation(energyLevel, stressLevel)
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    logStep("AI response received");

    // Parse the JSON response
    let recommendation;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      logStep("Parse error, using default", { error: parseError });
      recommendation = getDefaultRecommendation(energyLevel, stressLevel);
    }

    logStep("Recommendation generated", { workoutType: recommendation.workoutType });

    return new Response(JSON.stringify({ recommendation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      recommendation: getDefaultRecommendation(3, 3)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

function getMoodLabel(level: number): string {
  const labels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];
  return labels[level - 1] || 'Unknown';
}

function getStressLabel(level: number): string {
  const labels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
  return labels[level - 1] || 'Unknown';
}

function getEnergyLabel(level: number): string {
  const labels = ['Exhausted', 'Tired', 'Moderate', 'Energized', 'Very Energized'];
  return labels[level - 1] || 'Unknown';
}

function getDefaultRecommendation(energy: number, stress: number) {
  if (energy <= 2 || stress >= 4) {
    return {
      workoutType: "recovery",
      intensity: "low",
      duration: 20,
      title: "Gentle Recovery Session",
      description: "A light session focused on mobility and relaxation to help you recover and reduce stress.",
      exercises: [
        { name: "Deep Breathing", sets: null, reps: "3 minutes", notes: "Inhale 4 counts, hold 4, exhale 6" },
        { name: "Cat-Cow Stretches", sets: 2, reps: "10 each", notes: "Move slowly with breath" },
        { name: "Hip Circles", sets: 2, reps: "10 each direction", notes: "Keep core engaged" },
        { name: "Gentle Walking", sets: null, reps: "10 minutes", notes: "Easy pace, focus on breathing" }
      ],
      warmup: "2 minutes of gentle movement",
      cooldown: "5 minutes of static stretching",
      motivationalNote: "Rest is productive. Taking care of your body today sets you up for success tomorrow.",
      devotional: {
        verse: "Matthew 11:28",
        text: "Come to me, all you who are weary and burdened, and I will give you rest.",
        reflection: "God honors rest and recovery. Today is about restoration—both physical and spiritual. Let this gentle session be a time of communion with your Creator."
      }
    };
  }
  
  return {
    workoutType: "strength",
    intensity: "moderate",
    duration: 35,
    title: "Functional Strength Circuit",
    description: "A balanced full-body workout focused on functional movements that support everyday life.",
    exercises: [
      { name: "Goblet Squats", sets: 3, reps: "12", notes: "Keep chest up, knees tracking over toes" },
      { name: "Push-Ups", sets: 3, reps: "10-15", notes: "Modify on knees if needed" },
      { name: "Dumbbell Rows", sets: 3, reps: "10 each arm", notes: "Squeeze shoulder blade at top" },
      { name: "Lunges", sets: 3, reps: "10 each leg", notes: "Control the descent" },
      { name: "Plank Hold", sets: 3, reps: "30 seconds", notes: "Keep hips level" }
    ],
    warmup: "5 minutes of light cardio and dynamic stretching",
    cooldown: "5 minutes of stretching focusing on worked muscles",
    motivationalNote: "Every rep is an investment in your future self. Keep building that strength!",
    devotional: {
      verse: "1 Corinthians 9:27",
      text: "I discipline my body and keep it under control, lest after preaching to others I myself should be disqualified.",
      reflection: "Physical discipline mirrors spiritual discipline. As you train your body today, remember you are honoring God by stewarding the temple He gave you."
    }
  };
}
