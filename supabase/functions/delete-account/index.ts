import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    console.log(`[DELETE-ACCOUNT] Starting account deletion for user: ${userId}`);

    // Delete user data from all tables (in order to respect foreign key constraints)
    const tablesToClean = [
      'prayer_journal_entries',
      'accountability_checkins',
      'accountability_partnerships',
      'accountability_requests',
      'achievement_comments',
      'activity_feed',
      'body_analysis_results',
      'coaching_messages',
      'coaching_conversations',
      'cognitive_metrics',
      'comeback_protocols',
      'dm_messages',
      'dm_participants',
      'exercise_favorites',
      'exercise_playlist_items',
      'exercise_playlists',
      'exercise_sets',
      'fasting_logs',
      'fasting_goals',
      'forum_posts',
      'forum_topics',
      'hormonal_profiles',
      'joint_health_scores',
      'likes',
      'meal_logs',
      'mood_checkins',
      'notification_preferences',
      'notifications',
      'personal_plans',
      'personal_records',
      'progress_photos',
      'profiles',
      'running_sessions',
      'running_goals',
      'saved_stories',
      'sleep_workout_adaptations',
      'social_connections',
      'subscription_grants',
      'testimonies',
      'user_badges',
      'user_challenges',
      'user_follows',
      'user_onboarding',
      'user_roles',
      'user_streaks',
      'workout_sessions',
      'workout_templates',
    ];

    for (const table of tablesToClean) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', userId);
        
        if (error) {
          console.log(`[DELETE-ACCOUNT] Note: Could not delete from ${table}: ${error.message}`);
        } else {
          console.log(`[DELETE-ACCOUNT] Cleaned ${table}`);
        }
      } catch (e) {
        console.log(`[DELETE-ACCOUNT] Skipping ${table}: ${e}`);
      }
    }

    // Delete storage files
    try {
      // Delete avatars
      const { data: avatarFiles } = await supabaseAdmin.storage
        .from('avatars')
        .list(userId);
      
      if (avatarFiles && avatarFiles.length > 0) {
        const filePaths = avatarFiles.map(f => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from('avatars').remove(filePaths);
        console.log(`[DELETE-ACCOUNT] Deleted ${avatarFiles.length} avatar files`);
      }

      // Delete progress photos
      const { data: progressFiles } = await supabaseAdmin.storage
        .from('progress-photos')
        .list(userId);
      
      if (progressFiles && progressFiles.length > 0) {
        const filePaths = progressFiles.map(f => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from('progress-photos').remove(filePaths);
        console.log(`[DELETE-ACCOUNT] Deleted ${progressFiles.length} progress photos`);
      }
    } catch (e) {
      console.log(`[DELETE-ACCOUNT] Storage cleanup note: ${e}`);
    }

    // Finally, delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      throw new Error(`Failed to delete auth user: ${deleteError.message}`);
    }

    console.log(`[DELETE-ACCOUNT] Successfully deleted user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[DELETE-ACCOUNT] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
