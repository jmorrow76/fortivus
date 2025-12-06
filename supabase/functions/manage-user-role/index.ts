import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RoleUpdateRequest {
  targetUserId: string;
  role: 'admin' | 'moderator' | 'user';
  action: 'add' | 'remove';
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the requesting user is authenticated and is admin
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if requesting user is admin
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const { targetUserId, role, action }: RoleUpdateRequest = await req.json();

    if (!targetUserId || !role || !action) {
      throw new Error("Missing required fields: targetUserId, role, action");
    }

    // Prevent admin from removing their own admin role
    if (user.id === targetUserId && role === 'admin' && action === 'remove') {
      throw new Error("Cannot remove your own admin role");
    }

    console.log(`Admin ${user.email} is ${action}ing ${role} role for user ${targetUserId}`);

    if (action === 'add') {
      // Check if role already exists
      const { data: existingRole } = await adminClient
        .from("user_roles")
        .select("id")
        .eq("user_id", targetUserId)
        .eq("role", role)
        .maybeSingle();

      if (existingRole) {
        return new Response(
          JSON.stringify({ message: "User already has this role" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error: insertError } = await adminClient
        .from("user_roles")
        .insert({ user_id: targetUserId, role });

      if (insertError) {
        console.error("Error adding role:", insertError);
        throw new Error(`Failed to add role: ${insertError.message}`);
      }

      console.log(`Successfully added ${role} role to user ${targetUserId}`);
    } else if (action === 'remove') {
      const { error: deleteError } = await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", role);

      if (deleteError) {
        console.error("Error removing role:", deleteError);
        throw new Error(`Failed to remove role: ${deleteError.message}`);
      }

      console.log(`Successfully removed ${role} role from user ${targetUserId}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Role ${action === 'add' ? 'added' : 'removed'} successfully` }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in manage-user-role function:", error);
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
