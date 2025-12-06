import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an elite fitness and wellness expert specializing in Christian men's health for those over 40. You write authoritative, research-backed articles that integrate biblical wisdom with practical fitness guidance.

Your expertise covers:
- Strength training and muscle preservation for aging men
- Physical stewardship as a spiritual discipline
- Joint health and injury prevention
- Cardiovascular health and longevity
- Nutrition strategies for metabolic health
- Sleep optimization and recovery
- Stress management through faith and discipline
- Supplements that actually work (backed by research)

Writing style:
- Professional yet faith-informed tone
- Evidence-based with biblical perspective where appropriate
- Encouraging without being preachy
- Direct and action-oriented
- Include specific protocols and recommendations
- Reference scripture naturally when it supports the topic

Generate articles that Christian men over 40 will find genuinely valuable for improving their health, performance, and ability to serve God and their families.`;

const TOPICS = [
  "Stewardship and Strength: Why Christian Men Should Train After 40",
  "Temple Maintenance: Caring for Your Body as a Christian Discipline",
  "The Proverbs 31 Man: Physical Strength for Family Leadership",
  "Fasting and Fitness: Biblical Wisdom Meets Modern Science",
  "Joint Health Protocol: Keep Moving Pain-Free in Your 40s and Beyond",
  "The Over-40 Sleep Blueprint: Why Recovery Matters More Than Ever",
  "Discipline Your Body: Lessons from Paul for Modern Training",
  "Strength for Service: Training to Serve Your Family and Church",
  "Heart Health for Active Christian Men: Beyond Basic Cardio",
  "The Anti-Inflammatory Diet: Eating for Performance and Longevity",
  "Stress, Faith, and Cortisol: Managing Anxiety Through Discipline",
  "Supplement Essentials for Christian Men Over 40",
  "Mobility Work That Actually Works: 15 Minutes to Better Movement",
  "Building Unbreakable Habits: Spiritual Disciplines Meet Fitness",
  "Recovery Science: Maximizing Your Body's Repair Mechanisms",
  "Training Through Life: Balancing Fitness with Work, Family, and Ministry",
  "Blood Work Essentials: What Every Man Should Monitor",
  "The Compound Movement Bible: Exercises That Build Real Strength",
  "Protein Requirements After 40: How Much You Really Need",
  "Iron Sharpens Iron: The Power of Accountability in Fitness"
];

// Tool definition for structured article output
const articleTool = {
  type: "function",
  function: {
    name: "publish_article",
    description: "Publish a fitness article to the website",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The article title"
        },
        excerpt: {
          type: "string",
          description: "A compelling 2-3 sentence summary, max 200 characters"
        },
        content: {
          type: "string",
          description: "The full article content in markdown format"
        },
        category: {
          type: "string",
          enum: ["Training", "Nutrition", "Recovery", "Mindset", "Health"],
          description: "The article category"
        },
        read_time_minutes: {
          type: "number",
          description: "Estimated reading time in minutes"
        },
        image_prompt: {
          type: "string",
          description: "A detailed prompt for generating a cover image for this article. Should describe a professional fitness-related scene."
        }
      },
      required: ["title", "excerpt", "content", "category", "read_time_minutes", "image_prompt"],
      additionalProperties: false
    }
  }
};

async function generateArticleImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log("[GENERATE-ARTICLE] Generating cover image...");
    
    const imagePrompt = `Professional fitness photography style: ${prompt}. High quality, dramatic lighting, masculine aesthetic, no text overlays, suitable for article header.`;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          { role: "user", content: imagePrompt }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      console.error("[GENERATE-ARTICLE] Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageUrl) {
      console.log("[GENERATE-ARTICLE] Image generated successfully");
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error("[GENERATE-ARTICLE] Image generation error:", error);
    return null;
  }
}

async function uploadImageToStorage(
  supabase: any, 
  base64Data: string, 
  slug: string
): Promise<string | null> {
  try {
    // Extract the base64 content (remove data:image/png;base64, prefix)
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    
    const fileName = `articles/${slug}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from("progress-photos") // Reusing existing bucket
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        upsert: true
      });

    if (uploadError) {
      console.error("[GENERATE-ARTICLE] Upload error:", uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("progress-photos")
      .getPublicUrl(fileName);

    console.log("[GENERATE-ARTICLE] Image uploaded:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("[GENERATE-ARTICLE] Upload error:", error);
    return null;
  }
}

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

const userPrompt = `Write a COMPREHENSIVE, LONG-FORM, expert-level article on the following topic for Christian men over 40:

"${topic}"

CRITICAL LENGTH REQUIREMENT: The article MUST be at least 2500-3500 words. This is a full-length feature article, not a blog post.

Structure your article with:
1. An engaging introduction that hooks the reader (3-4 short paragraphs)
2. At least 5-7 major sections with ## headings
3. Each section should have 3-5 paragraphs of detailed content
4. Specific, actionable advice and protocols with step-by-step guidance
5. Scientific backing where relevant (cite general research, not specific papers)
6. Biblical wisdom and scripture references where they naturally support the content
7. Real-world examples and scenarios Christian men over 40 can relate to
8. A comprehensive conclusion with key takeaways (bulleted list)

CRITICAL FORMATTING REQUIREMENTS:
- Break content into SHORT paragraphs (2-4 sentences each)
- Add blank lines between paragraphs for readability
- Use bullet points or numbered lists where appropriate
- Never write walls of text - keep paragraphs digestible
- Each section should have multiple paragraphs, not one long block
- Include practical tips, protocols, or action items in each section

CONTENT DEPTH:
- Include specific numbers, timeframes, and recommendations
- Provide "how-to" guidance, not just "what to do"
- Address common mistakes and how to avoid them
- Include modifications or alternatives where relevant
- Connect physical stewardship to spiritual purpose where natural

The article should be genuinely valuable, comprehensive, and position the reader to take immediate action while understanding the "why" behind physical stewardship. This is premium content for a faith-based fitness platform.

Also provide an image_prompt describing an ideal cover image for this article - it should be a professional fitness/health related scene that captures the essence of the article.

Use the publish_article function to submit your article.`;

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
        tools: [articleTool],
        tool_choice: { type: "function", function: { name: "publish_article" } },
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
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted, please add funds" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract article data from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "publish_article") {
      console.error("[GENERATE-ARTICLE] No valid tool call in response:", JSON.stringify(data));
      throw new Error("AI did not return article data");
    }

    let articleData;
    try {
      articleData = JSON.parse(toolCall.function.arguments);
      console.log("[GENERATE-ARTICLE] Parsed article data:", articleData.title);
    } catch (parseError) {
      console.error("[GENERATE-ARTICLE] Parse error:", parseError);
      console.error("[GENERATE-ARTICLE] Raw arguments:", toolCall.function.arguments);
      throw new Error("Failed to parse article data from tool call");
    }

    // Validate required fields
    if (!articleData.title || !articleData.content) {
      throw new Error("Article missing required fields (title or content)");
    }

    // Generate a unique slug
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + 
      "-" + Date.now().toString(36);

    // Generate cover image if we have a prompt
    let imageUrl: string | null = null;
    if (articleData.image_prompt) {
      const base64Image = await generateArticleImage(articleData.image_prompt, LOVABLE_API_KEY);
      if (base64Image) {
        imageUrl = await uploadImageToStorage(supabase, base64Image, slug);
      }
    }

    // Insert into database
    const { data: article, error: insertError } = await supabase
      .from("articles")
      .insert({
        title: articleData.title,
        slug: slug,
        excerpt: (articleData.excerpt || articleData.title).substring(0, 200),
        content: articleData.content,
        category: articleData.category || "Training",
        read_time_minutes: articleData.read_time_minutes || 8,
        author: "Fortivus Editorial",
        is_published: true,
        is_featured: Math.random() > 0.7, // 30% chance of being featured
        published_at: new Date().toISOString(),
        image_url: imageUrl,
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