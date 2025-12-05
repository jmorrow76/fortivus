import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an elite fitness and wellness expert specializing in men's health for those over 40. You write authoritative, research-backed articles that are practical and actionable.

Your expertise covers:
- Strength training and muscle preservation for aging men
- Testosterone optimization through natural methods
- Joint health and injury prevention
- Cardiovascular health and longevity
- Nutrition strategies for metabolic health
- Sleep optimization and recovery
- Stress management and mental resilience
- Supplements that actually work (backed by research)

Writing style:
- Professional yet approachable tone
- Evidence-based with practical applications
- Motivating without being preachy
- Direct and action-oriented
- Include specific protocols and recommendations

Generate articles that men over 40 will find genuinely valuable for improving their health, performance, and quality of life.`;

const TOPICS = [
  "The Science of Building Muscle After 40: What Changes and How to Adapt",
  "Testosterone Optimization: Natural Strategies That Actually Work",
  "Joint Health Protocol: Keep Moving Pain-Free in Your 40s and Beyond",
  "The Over-40 Sleep Blueprint: Why Recovery Matters More Than Ever",
  "Metabolic Health: Reversing Insulin Resistance Through Training",
  "Strength Training for Longevity: The Minimum Effective Dose",
  "Heart Health for Active Men: Beyond Basic Cardio",
  "The Anti-Inflammatory Diet: Eating for Performance and Recovery",
  "Stress and Cortisol: Managing the Silent Gains Killer",
  "Supplement Stack Essentials: What's Worth Your Money",
  "Mobility Work That Actually Works: 15 Minutes to Better Movement",
  "The Psychology of Consistency: Building Unbreakable Habits",
  "Fasting Strategies for Men Over 40: Benefits and Protocols",
  "Training Through Life: Balancing Fitness with Work and Family",
  "Recovery Science: Maximizing Your Body's Repair Mechanisms",
  "Grip Strength and Longevity: The Surprising Connection",
  "Blood Work Essentials: What Every Man Should Monitor",
  "The Compound Movement Bible: Exercises That Build Real Strength",
  "Protein Requirements After 40: How Much You Really Need",
  "Mental Toughness: Building Resilience Through Physical Challenge"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Pick a random topic
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    
    console.log("[GENERATE-ARTICLE] Generating article on topic:", topic);

    const userPrompt = `Write a comprehensive, expert-level article on the following topic for men over 40:

"${topic}"

Structure your article with:
1. An engaging introduction that hooks the reader
2. Clear sections with subheadings
3. Specific, actionable advice and protocols
4. Scientific backing where relevant (cite general research, not specific papers)
5. A motivating conclusion with key takeaways

The article should be approximately 1500-2000 words. Make it genuinely valuable and shareable.

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "title": "Article title",
  "excerpt": "A compelling 2-3 sentence summary (max 200 characters)",
  "content": "The full article content in markdown format",
  "category": "One of: Training, Nutrition, Recovery, Mindset, Health",
  "read_time_minutes": estimated reading time as a number
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GENERATE-ARTICLE] AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    // Parse the JSON response
    let articleData;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      articleData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("[GENERATE-ARTICLE] Parse error:", parseError);
      throw new Error("Failed to parse article JSON");
    }

    // Generate a unique slug
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + 
      "-" + Date.now().toString(36);

    // Insert into database
    const { data: article, error: insertError } = await supabase
      .from("articles")
      .insert({
        title: articleData.title,
        slug: slug,
        excerpt: articleData.excerpt.substring(0, 200),
        content: articleData.content,
        category: articleData.category || "Training",
        read_time_minutes: articleData.read_time_minutes || 8,
        author: "Fortivus Editorial",
        is_published: true,
        is_featured: Math.random() > 0.7, // 30% chance of being featured
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[GENERATE-ARTICLE] Insert error:", insertError);
      throw new Error("Failed to save article");
    }

    console.log("[GENERATE-ARTICLE] Article created:", article.id, article.title);

    return new Response(JSON.stringify({ success: true, article }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[GENERATE-ARTICLE] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
