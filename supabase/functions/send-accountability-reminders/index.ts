import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Fortivus <noreply@fortivus.com>",
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend error: ${error}`);
  }
  
  return res.json();
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting accountability reminder job...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all active partnerships that haven't been reminded in the last 6 days
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    const { data: partnerships, error: partnershipError } = await supabaseAdmin
      .from("accountability_partnerships")
      .select("*")
      .eq("status", "active")
      .or(`last_checkin_reminder.is.null,last_checkin_reminder.lt.${sixDaysAgo.toISOString()}`);

    if (partnershipError) {
      console.error("Error fetching partnerships:", partnershipError);
      throw partnershipError;
    }

    console.log(`Found ${partnerships?.length || 0} partnerships needing reminders`);

    let emailsSent = 0;

    for (const partnership of partnerships || []) {
      const userIds = [partnership.user1_id, partnership.user2_id];
      
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (usersError) {
        console.error("Error fetching users:", usersError);
        continue;
      }

      for (const userId of userIds) {
        const user = users?.find(u => u.id === userId);
        const partnerId = userId === partnership.user1_id ? partnership.user2_id : partnership.user1_id;
        const partnerProfile = profiles?.find(p => p.user_id === partnerId);
        const userProfile = profiles?.find(p => p.user_id === userId);

        if (!user?.email) {
          console.log(`No email for user ${userId}, skipping`);
          continue;
        }

        const partnerName = partnerProfile?.display_name || "your accountability partner";
        const userName = userProfile?.display_name || "Brother";

        try {
          await sendEmail(
            user.email,
            `Weekly Check-in Reminder: Pray for ${partnerName}`,
            `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #1a1a2e; font-size: 24px;">Hey ${userName}! 🙏</h1>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  This is your weekly reminder to check in with <strong>${partnerName}</strong>, your accountability partner.
                </p>
                
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #1a1a2e;">This Week's Prompts:</h3>
                  <ul style="color: #555; line-height: 1.8;">
                    <li>🙏 Have you prayed for ${partnerName} this week?</li>
                    <li>💪 How is your fitness journey going?</li>
                    <li>📖 Any scripture that's been encouraging you?</li>
                    <li>🤝 Any prayer requests to share?</li>
                  </ul>
                </div>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Take a moment to reach out, share an update, and lift each other up in prayer. 
                  Iron sharpens iron!
                </p>
                
                <a href="https://fortivus.com/accountability" 
                   style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
                  Check In Now
                </a>
                
                <p style="color: #888; font-size: 14px; margin-top: 32px;">
                  "As iron sharpens iron, so one person sharpens another." - Proverbs 27:17
                </p>
              </div>
            `
          );
          emailsSent++;
          console.log(`Reminder sent to ${user.email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      }

      // Update last reminder timestamp
      await supabaseAdmin
        .from("accountability_partnerships")
        .update({ last_checkin_reminder: new Date().toISOString() })
        .eq("id", partnership.id);
    }

    console.log(`Accountability reminders complete. Sent ${emailsSent} emails.`);

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-accountability-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
