import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-M${now.getMonth() + 1}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const currentMonth = getMonthKey();

    console.log(`Running monthly challenge reset for month: ${currentMonth}`);

    // Get all monthly challenges
    const { data: monthlyChallenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, title')
      .eq('reset_type', 'monthly')
      .eq('is_active', true);

    if (challengesError) {
      console.error('Error fetching monthly challenges:', challengesError);
      throw challengesError;
    }

    console.log(`Found ${monthlyChallenges?.length || 0} monthly challenges`);

    if (!monthlyChallenges || monthlyChallenges.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No monthly challenges to reset', month: currentMonth }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const challengeIds = monthlyChallenges.map(c => c.id);

    // Reset progress for user_challenges that are from previous months
    const { data: resetData, error: resetError } = await supabase
      .from('user_challenges')
      .update({
        progress: 0,
        is_completed: false,
        completed_at: null,
        reset_week: currentMonth,
      })
      .in('challenge_id', challengeIds)
      .or(`reset_week.is.null,reset_week.neq.${currentMonth}`)
      .select();

    if (resetError) {
      console.error('Error resetting challenges:', resetError);
      throw resetError;
    }

    console.log(`Reset ${resetData?.length || 0} user challenge entries`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        month: currentMonth,
        challengesReset: monthlyChallenges.length,
        userEntriesReset: resetData?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in reset-monthly-challenges:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});