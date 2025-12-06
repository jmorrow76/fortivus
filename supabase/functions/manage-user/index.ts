import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ManageUserRequest {
  targetUserId: string;
  action: 'delete' | 'ban' | 'unban';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the token by getting the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized");
    }

    console.log("Authenticated user:", user.email);

    // Check if requesting user is admin
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      console.error("User is not admin:", user.id);
      throw new Error("Admin access required");
    }

    const { targetUserId, action }: ManageUserRequest = await req.json();

    if (!targetUserId || !action) {
      throw new Error("Missing required fields: targetUserId, action");
    }

    // Prevent admin from deleting/banning themselves
    if (user.id === targetUserId) {
      throw new Error("Cannot perform this action on yourself");
    }

    console.log(`Admin ${user.email} is performing ${action} on user ${targetUserId}`);

    if (action === 'delete') {
      // Delete user from auth.users (this will cascade to profiles due to trigger)
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        throw new Error(`Failed to delete user: ${deleteError.message}`);
      }

      console.log(`Successfully deleted user ${targetUserId}`);
      
      return new Response(
        JSON.stringify({ success: true, message: "User deleted successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else if (action === 'ban') {
      // Update profile to set banned_at timestamp
      const { error: banError } = await adminClient
        .from("profiles")
        .update({ banned_at: new Date().toISOString() })
        .eq("user_id", targetUserId);

      if (banError) {
        console.error("Error banning user:", banError);
        throw new Error(`Failed to ban user: ${banError.message}`);
      }

      console.log(`Successfully banned user ${targetUserId}`);
      
      return new Response(
        JSON.stringify({ success: true, message: "User banned successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else if (action === 'unban') {
      // Clear banned_at timestamp
      const { error: unbanError } = await adminClient
        .from("profiles")
        .update({ banned_at: null })
        .eq("user_id", targetUserId);

      if (unbanError) {
        console.error("Error unbanning user:", unbanError);
        throw new Error(`Failed to unban user: ${unbanError.message}`);
      }

      console.log(`Successfully unbanned user ${targetUserId}`);
      
      return new Response(
        JSON.stringify({ success: true, message: "User unbanned successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    console.error("Error in manage-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
