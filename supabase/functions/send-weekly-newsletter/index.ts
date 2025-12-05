import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the lead editor at Fortivus, an elite fitness platform for men over 40. Write engaging newsletter content that:
- Opens with a powerful, relatable hook
- Provides genuinely valuable insights
- Maintains a confident, authoritative tone
- Motivates without being preachy
- Includes practical tips they can use immediately

Keep the tone professional yet personal, like advice from a trusted mentor who's been there.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (subError) {
      console.error("[NEWSLETTER] Error fetching subscribers:", subError);
      throw new Error("Failed to fetch subscribers");
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("[NEWSLETTER] No active subscribers found");
      return new Response(JSON.stringify({ success: true, message: "No subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[NEWSLETTER] Found", subscribers.length, "active subscribers");

    // Get recent articles for the newsletter
    const { data: recentArticles } = await supabase
      .from("articles")
      .select("title, slug, excerpt, category")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3);

    // Generate newsletter content with AI
    const weekTopics = [
      "training intensity and recovery balance",
      "nutrition timing for muscle growth",
      "stress management and cortisol",
      "sleep optimization strategies",
      "mobility and injury prevention",
      "testosterone and hormonal health",
      "building sustainable habits",
      "mental toughness and consistency"
    ];
    const weekTopic = weekTopics[Math.floor(Math.random() * weekTopics.length)];

    const userPrompt = `Write a weekly newsletter for Fortivus members about "${weekTopic}".

Include:
1. A compelling subject line (max 60 chars)
2. A brief, punchy intro (2-3 sentences)
3. One key insight or tip of the week (practical and actionable)
4. A motivational closing thought

${recentArticles && recentArticles.length > 0 ? `
Reference these recent articles we published:
${recentArticles.map(a => `- ${a.title} (${a.category})`).join('\n')}
` : ''}

Return ONLY a JSON object (no markdown, no code blocks):
{
  "subject": "Subject line here",
  "intro": "Intro paragraph",
  "tip_title": "Tip of the week title",
  "tip_content": "The detailed tip content",
  "closing": "Motivational closing"
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[NEWSLETTER] AI API error:", aiResponse.status, errorText);
      throw new Error("Failed to generate newsletter content");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    let newsletterContent;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      newsletterContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("[NEWSLETTER] Parse error:", parseError);
      throw new Error("Failed to parse newsletter content");
    }

    // Build HTML email
    const articlesHtml = recentArticles && recentArticles.length > 0 
      ? `
        <div style="margin: 30px 0; padding: 20px; background: #f8f8f8; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #1a1a2e;">📚 This Week in the Knowledge Hub</h3>
          ${recentArticles.map(a => `
            <div style="margin-bottom: 10px;">
              <strong style="color: #1a1a2e;">${a.title}</strong>
              <span style="color: #666; font-size: 12px;"> • ${a.category}</span>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${a.excerpt}</p>
            </div>
          `).join('')}
        </div>
      ` : '';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: #c9a227; font-size: 28px; letter-spacing: 2px;">FORTIVUS</h1>
      <p style="margin: 10px 0 0 0; color: #888; font-size: 12px; letter-spacing: 1px;">STRENGTH HAS NO EXPIRATION</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0;">
        ${newsletterContent.intro}
      </p>
      
      <!-- Tip of the Week -->
      <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 8px;">
        <h2 style="margin: 0 0 15px 0; color: #c9a227; font-size: 18px;">💪 ${newsletterContent.tip_title}</h2>
        <p style="margin: 0; color: #e0e0e0; font-size: 15px; line-height: 1.7;">
          ${newsletterContent.tip_content}
        </p>
      </div>
      
      ${articlesHtml}
      
      <!-- Closing -->
      <p style="color: #333; font-size: 16px; line-height: 1.7; margin: 30px 0; font-style: italic;">
        ${newsletterContent.closing}
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://fortivus.app" style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #1a1a2e; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">VISIT FORTIVUS</a>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Stay strong,<br>
        <strong style="color: #1a1a2e;">The Fortivus Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">
        <a href="https://fortivus.app" style="color: #1a1a2e; text-decoration: none; font-weight: bold;">fortivus.app</a>
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        You're receiving this because you subscribed to The Fortivus Weekly.<br>
        <a href="https://fortivus.app/unsubscribe" style="color: #666;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    // Send to all subscribers
    const emails = subscribers.map(s => s.email);
    console.log("[NEWSLETTER] Sending to", emails.length, "subscribers");

    // Send emails in batches of 50
    const batchSize = 50;
    let sentCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const { error: sendError } = await resend.emails.send({
        from: "Fortivus <newsletter@resend.dev>",
        to: batch,
        subject: `🏋️ ${newsletterContent.subject}`,
        html: emailHtml,
      });

      if (sendError) {
        console.error("[NEWSLETTER] Send error for batch:", sendError);
      } else {
        sentCount += batch.length;
      }
    }

    // Record the newsletter
    const { error: recordError } = await supabase
      .from("newsletters")
      .insert({
        subject: newsletterContent.subject,
        content: emailHtml,
        recipients_count: sentCount,
        sent_at: new Date().toISOString(),
      });

    if (recordError) {
      console.error("[NEWSLETTER] Error recording newsletter:", recordError);
    }

    console.log("[NEWSLETTER] Successfully sent to", sentCount, "subscribers");

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_count: sentCount,
        subject: newsletterContent.subject 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("[NEWSLETTER] Error:", error);
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
