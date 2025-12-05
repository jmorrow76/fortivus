import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReferralEmailRequest {
  friendName: string;
  friendEmail: string;
  referrerName: string;
  referralLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { friendName, friendEmail, referrerName, referralLink }: ReferralEmailRequest = await req.json();

    console.log("Sending referral email to:", friendEmail);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Fortivus <onboarding@resend.dev>",
        to: [friendEmail],
        subject: `${referrerName} thinks you'd love Fortivus`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { font-size: 28px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
              .content { background: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 30px; }
              .cta { text-align: center; }
              .cta a { display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
              .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Fortivus</h1>
                <p style="color: #666; margin-top: 5px;">Strength Has No Expiration</p>
              </div>
              
              <div class="content">
                <h2>Hey ${friendName}!</h2>
                <p>${referrerName} thinks you'd be a great fit for <strong>Fortivus</strong> – the AI-powered fitness platform built specifically for men over 40.</p>
                
                <p>Here's what you'll get:</p>
                <ul>
                  <li>🏋️ Personalized AI workout programming</li>
                  <li>🥗 Custom nutrition and meal planning</li>
                  <li>📊 Progress tracking and body analysis</li>
                  <li>🧠 Hormonal optimization guidance</li>
                  <li>💪 A community of like-minded men</li>
                </ul>
                
                <p>Join thousands of men who are proving that age is just a number.</p>
              </div>
              
              <div class="cta">
                <a href="${referralLink}">Join Fortivus Now</a>
              </div>
              
              <div class="footer">
                <p>This invitation was sent by ${referrerName} via Fortivus.</p>
                <p>© Fortivus. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    console.log("Referral email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-referral-email function:", error);
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
