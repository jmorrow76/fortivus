import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const weekNumber = Math.ceil(
    ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7
  );
  return `${year}-W${weekNumber}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const currentWeek = getWeekKey();

    console.log(`Running weekly challenge reset for week: ${currentWeek}`);

    // Get all weekly challenges
    const { data: weeklyChallenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, title')
      .eq('reset_type', 'weekly')
      .eq('is_active', true);

    if (challengesError) {
      console.error('Error fetching weekly challenges:', challengesError);
      throw challengesError;
    }

    console.log(`Found ${weeklyChallenges?.length || 0} weekly challenges`);

    if (!weeklyChallenges || weeklyChallenges.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No weekly challenges to reset', week: currentWeek }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const challengeIds = weeklyChallenges.map(c => c.id);

    // Reset progress for user_challenges that are from previous weeks
    const { data: resetData, error: resetError } = await supabase
      .from('user_challenges')
      .update({
        progress: 0,
        is_completed: false,
        completed_at: null,
        reset_week: currentWeek,
      })
      .in('challenge_id', challengeIds)
      .or(`reset_week.is.null,reset_week.neq.${currentWeek}`)
      .select();

    if (resetError) {
      console.error('Error resetting challenges:', resetError);
      throw resetError;
    }

    console.log(`Reset ${resetData?.length || 0} user challenge entries`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        week: currentWeek,
        challengesReset: weeklyChallenges.length,
        userEntriesReset: resetData?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in reset-weekly-challenges:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});