import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: SupportEmailRequest = await req.json();

    console.log("Sending support email from:", email);

    // Send email to support
    const supportEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Fortivus Support <onboarding@resend.dev>",
        to: ["support@fortivus.com"], // Update this with your actual support email
        subject: `Support Request: ${subject}`,
        html: `
          <h2>New Support Request</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
        reply_to: email,
      }),
    });

    if (!supportEmailResponse.ok) {
      const errorData = await supportEmailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    console.log("Support email sent successfully");

    // Send confirmation to user
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Fortivus <onboarding@resend.dev>",
        to: [email],
        subject: "We received your support request",
        html: `
          <h2>Thank you for contacting us, ${name}!</h2>
          <p>We have received your support request and will get back to you as soon as possible.</p>
          <p><strong>Your message:</strong></p>
          <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #666;">
            ${message.replace(/\n/g, '<br>')}
          </blockquote>
          <p>Best regards,<br>The Fortivus Team</p>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
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
