import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REDEEM-PROMO-CODE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get promo code from request
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      throw new Error("Promo code is required");
    }

    const trimmedCode = code.trim().toUpperCase();
    logStep("Checking promo code", { code: trimmedCode });

    // Check if user already has elite access
    const { data: existingGrant } = await supabaseClient
      .from("subscription_grants")
      .select("id")
      .eq("user_email", user.email)
      .maybeSingle();

    if (existingGrant) {
      throw new Error("You already have elite membership");
    }

    // Find the promo code
    const { data: promoCode, error: findError } = await supabaseClient
      .from("promo_codes")
      .select("*")
      .eq("code", trimmedCode)
      .maybeSingle();

    if (findError) {
      logStep("Error finding promo code", { error: findError.message });
      throw new Error("Error validating promo code");
    }

    if (!promoCode) {
      throw new Error("Invalid promo code");
    }

    if (promoCode.is_used) {
      throw new Error("This promo code has already been used");
    }

    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      throw new Error("This promo code has expired");
    }

    logStep("Valid promo code found", { promoCodeId: promoCode.id });

    // Mark the promo code as used
    const { error: updateError } = await supabaseClient
      .from("promo_codes")
      .update({
        is_used: true,
        redeemed_at: new Date().toISOString(),
        redeemed_by: user.id,
      })
      .eq("id", promoCode.id)
      .eq("is_used", false); // Double check it's still unused

    if (updateError) {
      logStep("Error updating promo code", { error: updateError.message });
      throw new Error("Failed to redeem promo code");
    }

    // Grant lifetime elite membership
    const { error: grantError } = await supabaseClient
      .from("subscription_grants")
      .insert({
        user_email: user.email,
        grant_type: "lifetime",
        granted_by: promoCode.created_by,
        notes: `Redeemed promo code: ${trimmedCode}`,
      });

    if (grantError) {
      logStep("Error creating subscription grant", { error: grantError.message });
      // Rollback the promo code usage
      await supabaseClient
        .from("promo_codes")
        .update({
          is_used: false,
          redeemed_at: null,
          redeemed_by: null,
        })
        .eq("id", promoCode.id);
      throw new Error("Failed to activate membership");
    }

    logStep("Membership granted successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Congratulations! Your lifetime Elite membership has been activated." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
