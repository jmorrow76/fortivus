import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 50 realistic male names for men over 40
const simulatedUsers = [
  { name: "Michael Thompson", age: 47, focus: "strength training", personality: "analytical and methodical" },
  { name: "Robert Chen", age: 52, focus: "weight loss", personality: "encouraging and supportive" },
  { name: "David Martinez", age: 44, focus: "marathon training", personality: "competitive and driven" },
  { name: "James Wilson", age: 58, focus: "mobility and recovery", personality: "wise and patient" },
  { name: "William Johnson", age: 45, focus: "powerlifting", personality: "intense and focused" },
  { name: "Richard Davis", age: 51, focus: "general fitness", personality: "balanced and helpful" },
  { name: "Joseph Anderson", age: 48, focus: "bodybuilding", personality: "disciplined and detailed" },
  { name: "Thomas Taylor", age: 55, focus: "heart health", personality: "cautious and health-conscious" },
  { name: "Christopher Brown", age: 42, focus: "CrossFit", personality: "energetic and enthusiastic" },
  { name: "Daniel Garcia", age: 49, focus: "functional fitness", personality: "practical and no-nonsense" },
  { name: "Matthew Miller", age: 46, focus: "kettlebell training", personality: "technical and precise" },
  { name: "Anthony Moore", age: 53, focus: "swimming", personality: "calm and measured" },
  { name: "Mark Jackson", age: 41, focus: "MMA fitness", personality: "tough and resilient" },
  { name: "Steven White", age: 57, focus: "golf fitness", personality: "strategic and patient" },
  { name: "Paul Harris", age: 50, focus: "cycling", personality: "endurance-minded and steady" },
  { name: "Andrew Clark", age: 44, focus: "HIIT training", personality: "high-energy and motivating" },
  { name: "Kenneth Lewis", age: 59, focus: "joint health", personality: "experienced and advisory" },
  { name: "Joshua Robinson", age: 43, focus: "Olympic lifting", personality: "technical and coaching" },
  { name: "Kevin Walker", age: 48, focus: "calisthenics", personality: "minimalist and efficient" },
  { name: "Brian Hall", age: 54, focus: "hiking and outdoor fitness", personality: "adventurous and nature-loving" },
  { name: "George Allen", age: 47, focus: "boxing fitness", personality: "disciplined and sharp" },
  { name: "Edward Young", age: 52, focus: "yoga for athletes", personality: "mindful and balanced" },
  { name: "Ronald King", age: 56, focus: "back health", personality: "careful and methodical" },
  { name: "Timothy Wright", age: 45, focus: "muscle building", personality: "determined and goal-oriented" },
  { name: "Jason Scott", age: 41, focus: "obstacle course racing", personality: "adventurous and competitive" },
  { name: "Jeffrey Green", age: 49, focus: "longevity fitness", personality: "research-oriented and thorough" },
  { name: "Ryan Baker", age: 43, focus: "sports performance", personality: "athletic and coaching" },
  { name: "Jacob Adams", age: 50, focus: "stress management", personality: "holistic and wellness-focused" },
  { name: "Gary Nelson", age: 58, focus: "walking and low impact", personality: "steady and consistent" },
  { name: "Nicholas Hill", age: 46, focus: "rowing", personality: "team-oriented and supportive" },
  { name: "Eric Ramirez", age: 44, focus: "triathlon training", personality: "multi-disciplined and organized" },
  { name: "Jonathan Campbell", age: 51, focus: "home gym workouts", personality: "resourceful and practical" },
  { name: "Stephen Mitchell", age: 55, focus: "stretching routines", personality: "patient and thorough" },
  { name: "Larry Roberts", age: 60, focus: "balance training", personality: "wise and preventative" },
  { name: "Justin Carter", age: 42, focus: "grip strength", personality: "detail-oriented and dedicated" },
  { name: "Scott Phillips", age: 48, focus: "core training", personality: "foundational and systematic" },
  { name: "Brandon Evans", age: 45, focus: "running", personality: "consistent and goal-driven" },
  { name: "Benjamin Turner", age: 53, focus: "tennis fitness", personality: "competitive and social" },
  { name: "Samuel Torres", age: 47, focus: "posture correction", personality: "corrective and educational" },
  { name: "Gregory Parker", age: 54, focus: "senior athletics", personality: "inspiring and age-positive" },
  { name: "Alexander Collins", age: 41, focus: "speed training", personality: "explosive and dynamic" },
  { name: "Frank Edwards", age: 57, focus: "blood pressure management", personality: "health-focused and careful" },
  { name: "Patrick Stewart", age: 49, focus: "resistance bands", personality: "adaptable and traveling" },
  { name: "Raymond Flores", age: 46, focus: "jump rope cardio", personality: "fun and light-hearted" },
  { name: "Jack Morris", age: 52, focus: "deadlifting", personality: "strong and methodical" },
  { name: "Dennis Murphy", age: 59, focus: "water aerobics", personality: "gentle and encouraging" },
  { name: "Jerry Rogers", age: 44, focus: "circuit training", personality: "efficient and time-conscious" },
  { name: "Tyler Reed", age: 43, focus: "pull-up progression", personality: "milestone-focused and tracking" },
  { name: "Aaron Cook", age: 50, focus: "intermittent fasting fitness", personality: "experimental and data-driven" },
  { name: "Jose Morgan", age: 48, focus: "shoulder rehab", personality: "recovery-focused and supportive" },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting to seed simulated users...');

    const createdUsers = [];

    for (const user of simulatedUsers) {
      // Generate a unique UUID for this simulated user
      const id = crypto.randomUUID();
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          user_id: id,
          display_name: user.name,
          is_simulated: true,
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.name}:`, profileError);
        continue;
      }

      // Create initial streak with random values
      const currentStreak = Math.floor(Math.random() * 30) + 1;
      const totalCheckins = Math.floor(Math.random() * 100) + currentStreak;
      const totalXp = totalCheckins * 10 + Math.floor(Math.random() * 500);

      const { error: streakError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: id,
          current_streak: currentStreak,
          longest_streak: Math.max(currentStreak, Math.floor(Math.random() * 45) + currentStreak),
          total_checkins: totalCheckins,
          total_xp: totalXp,
          show_on_leaderboard: true,
          last_checkin_date: new Date().toISOString().split('T')[0],
        });

      if (streakError) {
        console.error(`Error creating streak for ${user.name}:`, streakError);
      }

      // Award some random badges
      const { data: badges } = await supabase.from('badges').select('id');
      if (badges && badges.length > 0) {
        const numBadges = Math.floor(Math.random() * 5) + 1;
        const selectedBadges = badges.sort(() => 0.5 - Math.random()).slice(0, numBadges);
        
        for (const badge of selectedBadges) {
          await supabase.from('user_badges').insert({
            user_id: id,
            badge_id: badge.id,
          });
        }
      }

      // Join some random challenges
      const { data: challenges } = await supabase.from('challenges').select('id, target_count').eq('is_active', true);
      if (challenges && challenges.length > 0) {
        const numChallenges = Math.floor(Math.random() * 3) + 1;
        const selectedChallenges = challenges.sort(() => 0.5 - Math.random()).slice(0, numChallenges);
        
        for (const challenge of selectedChallenges) {
          const progress = Math.floor(Math.random() * challenge.target_count);
          await supabase.from('user_challenges').insert({
            user_id: id,
            challenge_id: challenge.id,
            progress: progress,
            is_completed: progress >= challenge.target_count,
          });
        }
      }

      createdUsers.push({ id, name: user.name, focus: user.focus });
      console.log(`Created simulated user: ${user.name}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Created ${createdUsers.length} simulated users`,
      users: createdUsers 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error seeding simulated users:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
