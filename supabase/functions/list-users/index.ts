import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  membership_type: 'free' | 'elite_monthly' | 'elite_yearly' | 'lifetime' | 'manual_grant';
  membership_expires: string | null;
  is_simulated: boolean;
  total_xp: number;
  current_streak: number;
  total_checkins: number;
  roles: ('admin' | 'moderator' | 'user')[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    console.log("[LIST-USERS] Auth header present:", !!authHeader);
    
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client for auth operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract the token and verify it
    const token = authHeader.replace("Bearer ", "");
    
    // Verify the token using the admin client
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
    
    console.log("[LIST-USERS] User lookup result:", { userId: user?.id, email: user?.email, error: authError?.message });
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    console.log("[LIST-USERS] Role check:", { roleData, roleError: roleError?.message });

    if (!roleData) {
      throw new Error("Admin access required");
    }

    console.log("Fetching all users for admin:", user.email);

    // Fetch all auth users
    const { data: authUsers, error: usersError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });

    if (usersError) {
      console.error("Error fetching auth users:", usersError);
      throw usersError;
    }

    // Fetch profiles
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("user_id, display_name, avatar_url, is_simulated");

    // Fetch user streaks
    const { data: streaks } = await adminClient
      .from("user_streaks")
      .select("user_id, total_xp, current_streak, total_checkins");

    // Fetch subscription grants
    const { data: grants } = await adminClient
      .from("subscription_grants")
      .select("user_email, expires_at");

    // Fetch user roles
    const { data: userRoles } = await adminClient
      .from("user_roles")
      .select("user_id, role");

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    const streakMap = new Map(streaks?.map(s => [s.user_id, s]) || []);
    const grantMap = new Map(grants?.map(g => [g.user_email.toLowerCase(), g]) || []);
    
    // Group roles by user_id
    const rolesMap = new Map<string, ('admin' | 'moderator' | 'user')[]>();
    userRoles?.forEach(ur => {
      const existing = rolesMap.get(ur.user_id) || [];
      existing.push(ur.role as 'admin' | 'moderator' | 'user');
      rolesMap.set(ur.user_id, existing);
    });

    const users: UserData[] = authUsers.users.map(authUser => {
      const profile = profileMap.get(authUser.id);
      const streak = streakMap.get(authUser.id);
      const grant = grantMap.get(authUser.email?.toLowerCase() || "");
      const userRolesList = rolesMap.get(authUser.id) || [];

      let membershipType: UserData['membership_type'] = 'free';
      let membershipExpires: string | null = null;

      if (grant) {
        membershipType = 'manual_grant';
        membershipExpires = grant.expires_at;
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at || null,
        display_name: profile?.display_name || authUser.user_metadata?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        membership_type: membershipType,
        membership_expires: membershipExpires,
        is_simulated: profile?.is_simulated || false,
        total_xp: streak?.total_xp || 0,
        current_streak: streak?.current_streak || 0,
        total_checkins: streak?.total_checkins || 0,
        roles: userRolesList,
      };
    });

    // Sort by created_at descending (newest first)
    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`Returning ${users.length} users`);

    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in list-users function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
