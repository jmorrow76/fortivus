import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extended list of realistic male names for men over 40
const firstNames = [
  "Michael", "Robert", "David", "James", "William", "Richard", "Joseph", "Thomas", "Christopher", "Daniel",
  "Matthew", "Anthony", "Mark", "Steven", "Paul", "Andrew", "Kenneth", "Joshua", "Kevin", "Brian",
  "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas",
  "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Gregory",
  "Alexander", "Frank", "Patrick", "Raymond", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Jose",
  "Henry", "Douglas", "Adam", "Nathan", "Zachary", "Peter", "Kyle", "Walter", "Ethan", "Jeremy",
  "Harold", "Keith", "Christian", "Roger", "Noah", "Gerald", "Carl", "Terry", "Sean", "Austin",
  "Arthur", "Lawrence", "Jesse", "Dylan", "Bryan", "Joe", "Jordan", "Billy", "Bruce", "Albert"
];

const lastNames = [
  "Thompson", "Chen", "Martinez", "Wilson", "Johnson", "Davis", "Anderson", "Taylor", "Brown", "Garcia",
  "Miller", "Moore", "Jackson", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Hall",
  "Allen", "Young", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill",
  "Ramirez", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Torres", "Parker",
  "Collins", "Edwards", "Stewart", "Flores", "Morris", "Murphy", "Rogers", "Reed", "Cook", "Morgan",
  "Peterson", "Cooper", "Bailey", "Richardson", "Cox", "Howard", "Ward", "Brooks", "Sanders", "Price",
  "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long",
  "Patterson", "Hughes", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin"
];

const focuses = [
  "strength training", "weight loss", "marathon training", "mobility and recovery", "powerlifting",
  "general fitness", "bodybuilding", "heart health", "CrossFit", "functional fitness",
  "kettlebell training", "swimming", "golf fitness", "cycling",
  "HIIT training", "joint health", "Olympic lifting", "calisthenics", "hiking and outdoor fitness",
  "back health", "muscle building", "obstacle course racing",
  "longevity fitness", "sports performance", "walking and low impact", "rowing",
  "triathlon training", "home gym workouts", "stretching routines", "balance training", "grip strength",
  "core training", "running", "tennis fitness", "posture correction", "senior athletics",
  "stewardship of the body", "faith-driven fitness", "temple care"
];

const personalities = [
  "encouraging and faith-filled", "wise and prayerful", "disciplined and devoted",
  "patient and encouraging", "humble and helpful", "steady and faithful",
  "gentle but strong", "servant-hearted and supportive", "joyful and motivating",
  "experienced and mentoring", "prayerful and thoughtful", "calm and Spirit-led",
  "resilient and hopeful", "strategic and trusting God", "endurance-minded and persevering",
  "energetic and praising", "accountable and brotherly", "grace-filled and patient"
];

function generateRandomUser(existingNames: Set<string>): { name: string; age: number; focus: string; personality: string } {
  let name: string;
  let attempts = 0;
  
  // Generate a unique name
  do {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    name = `${firstName} ${lastName}`;
    attempts++;
  } while (existingNames.has(name) && attempts < 100);
  
  existingNames.add(name);
  
  return {
    name,
    age: Math.floor(Math.random() * 20) + 40, // Age 40-60
    focus: focuses[Math.floor(Math.random() * focuses.length)],
    personality: personalities[Math.floor(Math.random() * personalities.length)]
  };
}

serve(async (req) => {
  console.log('[SEED-USERS] Function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for count parameter
    let count = 50; // Default
    try {
      const body = await req.json();
      if (body.count && typeof body.count === 'number' && body.count > 0) {
        count = Math.min(body.count, 100); // Max 100 at a time
      }
    } catch {
      // No body or invalid JSON, use default
    }

    console.log(`[SEED-USERS] Requested count: ${count}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[SEED-USERS] Missing environment variables');
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[SEED-USERS] Starting to seed simulated users...');

    // Get existing simulated user names to avoid duplicates
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('is_simulated', true);

    const existingNames = new Set<string>(
      existingProfiles?.map(p => p.display_name).filter(Boolean) || []
    );

    console.log(`[SEED-USERS] Existing simulated users: ${existingNames.size}`);

    const createdUsers = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
      const user = generateRandomUser(existingNames);
      
      try {
        // Generate a unique UUID based on user name + timestamp to ensure uniqueness
        const encoder = new TextEncoder();
        const data = encoder.encode(user.name + '_simulated_fortivus_' + Date.now() + '_' + i);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = new Uint8Array(hashBuffer);
        
        // Create a UUID-like string from the hash
        const id = [
          Array.from(hashArray.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(''),
          Array.from(hashArray.slice(4, 6)).map(b => b.toString(16).padStart(2, '0')).join(''),
          '4' + Array.from(hashArray.slice(6, 8)).map(b => b.toString(16).padStart(2, '0')).join('').slice(1),
          ((hashArray[8] & 0x3f) | 0x80).toString(16).padStart(2, '0') + Array.from(hashArray.slice(9, 10)).map(b => b.toString(16).padStart(2, '0')).join(''),
          Array.from(hashArray.slice(10, 16)).map(b => b.toString(16).padStart(2, '0')).join('')
        ].join('-');

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: id,
            user_id: id,
            display_name: user.name,
            is_simulated: true,
          });

        if (profileError) {
          console.error(`[SEED-USERS] Error creating profile for ${user.name}:`, profileError.message);
          errors.push({ user: user.name, error: profileError.message, step: 'profile' });
          continue;
        }

        console.log(`[SEED-USERS] Created profile for ${user.name}`);

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
          console.error(`[SEED-USERS] Error creating streak for ${user.name}:`, streakError.message);
          errors.push({ user: user.name, error: streakError.message, step: 'streak' });
        }

        // Award some random badges
        const { data: badges } = await supabase.from('badges').select('id');
        if (badges && badges.length > 0) {
          const numBadges = Math.floor(Math.random() * 5) + 1;
          const selectedBadges = badges.sort(() => 0.5 - Math.random()).slice(0, numBadges);
          
          for (const badge of selectedBadges) {
            const { error: badgeError } = await supabase.from('user_badges').insert({
              user_id: id,
              badge_id: badge.id,
            });
            if (badgeError) {
              console.log(`[SEED-USERS] Badge insert error (may be duplicate):`, badgeError.message);
            }
          }
        }

        // Join some random challenges
        const { data: challenges } = await supabase.from('challenges').select('id, target_count').eq('is_active', true);
        if (challenges && challenges.length > 0) {
          const numChallenges = Math.floor(Math.random() * 3) + 1;
          const selectedChallenges = challenges.sort(() => 0.5 - Math.random()).slice(0, numChallenges);
          
          for (const challenge of selectedChallenges) {
            const progress = Math.floor(Math.random() * challenge.target_count);
            const { error: challengeError } = await supabase.from('user_challenges').insert({
              user_id: id,
              challenge_id: challenge.id,
              progress: progress,
              is_completed: progress >= challenge.target_count,
            });
            if (challengeError) {
              console.log(`[SEED-USERS] Challenge insert error (may be duplicate):`, challengeError.message);
            }
          }
        }

        createdUsers.push({ id, name: user.name, focus: user.focus });
        console.log(`[SEED-USERS] Successfully created simulated user: ${user.name}`);
      } catch (userError: any) {
        console.error(`[SEED-USERS] Unexpected error for ${user.name}:`, userError.message);
        errors.push({ user: user.name, error: userError.message, step: 'unknown' });
      }
    }

    console.log(`[SEED-USERS] Completed. Created: ${createdUsers.length}, Errors: ${errors.length}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Created ${createdUsers.length} simulated users`,
      users: createdUsers,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[SEED-USERS] Fatal error:', error.message, error.stack);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error',
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});