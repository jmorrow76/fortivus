import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      console.log("[UNSUBSCRIBE] Invalid email provided");
      return new Response(
        JSON.stringify({ error: "Valid email address is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("[UNSUBSCRIBE] Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("[UNSUBSCRIBE] Processing unsubscribe for:", normalizedEmail);

    // Check if subscriber exists
    const { data: subscriber, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fetchError) {
      console.error("[UNSUBSCRIBE] Error fetching subscriber:", fetchError);
      throw new Error("Failed to process request");
    }

    if (!subscriber) {
      console.log("[UNSUBSCRIBE] Email not found:", normalizedEmail);
      // Return success anyway to prevent email enumeration
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If this email was subscribed, it has been unsubscribed." 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!subscriber.is_active) {
      console.log("[UNSUBSCRIBE] Already unsubscribed:", normalizedEmail);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "This email is already unsubscribed." 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update subscriber to inactive
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("[UNSUBSCRIBE] Error updating subscriber:", updateError);
      throw new Error("Failed to unsubscribe");
    }

    console.log("[UNSUBSCRIBE] Successfully unsubscribed:", normalizedEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "You have been successfully unsubscribed from our newsletter." 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("[UNSUBSCRIBE] Error:", error);
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
