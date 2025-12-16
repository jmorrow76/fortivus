import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const demoEmail = 'appledemo@fortivus.app';
    const demoPassword = 'FortivusDemo2024!';
    const displayName = 'AppleDemo';

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === demoEmail);

    if (existingUser) {
      // Update password if user exists
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: demoPassword,
        email_confirm: true
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Demo account updated',
        credentials: { email: demoEmail, password: demoPassword }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { display_name: displayName }
    });

    if (createError) throw createError;

    // Grant elite subscription for full feature access
    await supabaseAdmin.from('subscription_grants').insert({
      user_email: demoEmail,
      grant_type: 'manual_grant',
      notes: 'Apple App Store Review Demo Account'
    });

    // Create onboarding data so dashboard is populated
    await supabaseAdmin.from('user_onboarding').insert({
      user_id: newUser.user.id,
      fitness_goal: 'general_health',
      experience_level: 'intermediate',
      age_range: '40-49',
      workout_frequency: '3-4',
      focus_areas: ['strength', 'mobility'],
      available_equipment: ['dumbbells', 'barbell', 'gym']
    });

    // Initialize streak data
    await supabaseAdmin.from('user_streaks').insert({
      user_id: newUser.user.id,
      current_streak: 5,
      longest_streak: 12,
      total_checkins: 25,
      total_xp: 1250
    });

    console.log('Demo account created successfully:', demoEmail);

    return new Response(JSON.stringify({
      success: true,
      message: 'Demo account created',
      credentials: { email: demoEmail, password: demoPassword }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    console.error('Error creating demo account:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
