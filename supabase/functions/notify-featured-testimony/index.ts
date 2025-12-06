import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeaturedNotificationRequest {
  testimonyId: string;
  testimonyTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { testimonyId, testimonyTitle }: FeaturedNotificationRequest = await req.json();

    console.log("Fetching testimony author for:", testimonyId);

    // Get the testimony author's email
    const { data: testimony, error: testimonyError } = await supabaseClient
      .from("testimonies")
      .select("user_id")
      .eq("id", testimonyId)
      .single();

    if (testimonyError || !testimony) {
      console.error("Error fetching testimony:", testimonyError);
      throw new Error("Testimony not found");
    }

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(
      testimony.user_id
    );

    if (userError || !userData?.user?.email) {
      console.error("Error fetching user:", userError);
      throw new Error("User email not found");
    }

    const userEmail = userData.user.email;

    // Get display name from profiles
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("display_name")
      .eq("user_id", testimony.user_id)
      .single();

    const displayName = profile?.display_name || "Brother";

    console.log("Sending featured notification to:", userEmail);

    const emailResponse = await resend.emails.send({
      from: "Fortivus <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Your Testimony Has Been Featured! 🌟",
      html: `
        <div style="font-family: 'Source Sans 3', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-family: 'Cormorant Garamond', Georgia, serif;">
            Praise God, ${displayName}!
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Your testimony <strong>"${testimonyTitle}"</strong> has been featured by our team!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Your story of God's faithfulness is now highlighted at the top of our Testimonies page, 
            where it can encourage and inspire our community of Christian brothers.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for sharing how God has worked in your life. Your testimony is a powerful 
            witness to His goodness and grace.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-style: italic; color: #555; margin: 0;">
              "They triumphed over him by the blood of the Lamb and by the word of their testimony."
              <br><strong>— Revelation 12:11</strong>
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            God bless you,<br>
            The Fortivus Team
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-featured-testimony:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
