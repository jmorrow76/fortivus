import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-IOS-PURCHASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { productId, transactionId, expiresAt } = await req.json();
    logStep("Received purchase data", { productId, transactionId, expiresAt });

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Check if this transaction already exists
    const { data: existingGrant } = await supabaseClient
      .from('subscription_grants')
      .select('id')
      .eq('user_email', user.email.toLowerCase())
      .eq('grant_type', 'ios_purchase')
      .eq('notes', transactionId || productId)
      .maybeSingle();

    if (existingGrant) {
      logStep("Transaction already recorded", { grantId: existingGrant.id });
      return new Response(JSON.stringify({ success: true, existing: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Calculate expiration based on product type
    let expirationDate = expiresAt ? new Date(expiresAt) : null;
    if (!expirationDate) {
      // Default to 1 month for monthly, 1 year for yearly
      const now = new Date();
      if (productId.includes('yearly') || productId.includes('annual')) {
        expirationDate = new Date(now.setFullYear(now.getFullYear() + 1));
      } else {
        expirationDate = new Date(now.setMonth(now.getMonth() + 1));
      }
    }

    // Insert new grant
    const { data: newGrant, error: insertError } = await supabaseClient
      .from('subscription_grants')
      .insert({
        user_email: user.email.toLowerCase(),
        grant_type: 'ios_purchase',
        notes: transactionId || productId,
        expires_at: expirationDate.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to record purchase: ${insertError.message}`);
    }

    logStep("Purchase recorded successfully", { grantId: newGrant.id });

    return new Response(JSON.stringify({ 
      success: true, 
      grant_id: newGrant.id,
      expires_at: expirationDate.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
