import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Topic categories for forum posts
const forumTopics = [
  "workout routines", "nutrition tips", "supplement advice", "recovery methods",
  "motivation struggles", "progress updates", "equipment recommendations",
  "injury prevention", "sleep optimization", "stress management",
  "testosterone and aging", "joint health", "cardio vs weights",
  "meal prep ideas", "protein intake", "hydration tips"
];

async function generateAIContent(prompt: string): Promise<string> {
  try {
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are simulating a fitness community member who is a man over 40. Write naturally and authentically like a real person would in an online fitness forum. Keep responses concise (2-4 sentences for replies, 3-5 sentences for posts). Be helpful, supportive, and share personal experiences. Never mention you are AI or simulated.`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return '';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating AI content:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting community activity simulation...');

    // Get all simulated users
    const { data: simulatedProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .eq('is_simulated', true);

    if (profilesError || !simulatedProfiles?.length) {
      console.log('No simulated users found');
      return new Response(JSON.stringify({ message: 'No simulated users found. Run seed-simulated-users first.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${simulatedProfiles.length} simulated users`);

    const activities: string[] = [];

    // 1. Create 3-5 new forum posts
    const numNewPosts = Math.floor(Math.random() * 3) + 3;
    const postersSelection = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numNewPosts);

    // Get forum categories
    const { data: categories } = await supabase.from('forum_categories').select('id, name');
    
    for (const poster of postersSelection) {
      const topic = forumTopics[Math.floor(Math.random() * forumTopics.length)];
      const category = categories?.[Math.floor(Math.random() * (categories?.length || 1))];
      
      const postContent = await generateAIContent(
        `Write a forum post about ${topic} from the perspective of a ${40 + Math.floor(Math.random() * 20)} year old man who is into fitness. Ask a question or share an experience. Keep it authentic and conversational.`
      );

      if (postContent) {
        const title = postContent.split(/[.!?]/)[0].slice(0, 100);
        
        const { error: topicError } = await supabase.from('forum_topics').insert({
          user_id: poster.user_id,
          title: title || `Question about ${topic}`,
          content: postContent,
          category_id: category?.id || null,
        });

        if (!topicError) {
          activities.push(`${poster.display_name} created post: "${title}"`);
        }
      }
    }

    // 2. Reply to 5-8 existing forum posts (including real users' posts)
    const { data: recentTopics } = await supabase
      .from('forum_topics')
      .select('id, title, content, user_id')
      .order('created_at', { ascending: false })
      .limit(20);

    if (recentTopics?.length) {
      const numReplies = Math.floor(Math.random() * 4) + 5;
      const topicsToReply = recentTopics.sort(() => 0.5 - Math.random()).slice(0, numReplies);
      const repliers = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numReplies);

      for (let i = 0; i < topicsToReply.length; i++) {
        const topic = topicsToReply[i];
        const replier = repliers[i % repliers.length];
        
        // Don't reply to own posts
        if (topic.user_id === replier.user_id) continue;

        const replyContent = await generateAIContent(
          `Reply to this fitness forum post: "${topic.title}" - "${topic.content.slice(0, 200)}". Be helpful, share your own experience or advice as a man over 40 into fitness.`
        );

        if (replyContent) {
          const { error: postError } = await supabase.from('forum_posts').insert({
            user_id: replier.user_id,
            topic_id: topic.id,
            content: replyContent,
          });

          if (!postError) {
            activities.push(`${replier.display_name} replied to "${topic.title.slice(0, 30)}..."`);
          }
        }
      }
    }

    // 3. Complete daily check-ins for 10-15 users
    const numCheckins = Math.floor(Math.random() * 6) + 10;
    const checkInUsers = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numCheckins);
    const today = new Date().toISOString().split('T')[0];

    for (const user of checkInUsers) {
      // Check if already checked in today
      const { data: existingCheckin } = await supabase
        .from('mood_checkins')
        .select('id')
        .eq('user_id', user.user_id)
        .eq('check_in_date', today)
        .maybeSingle();

      if (!existingCheckin) {
        const { error: checkinError } = await supabase.from('mood_checkins').insert({
          user_id: user.user_id,
          mood_level: Math.floor(Math.random() * 3) + 3, // 3-5
          stress_level: Math.floor(Math.random() * 3) + 1, // 1-3
          energy_level: Math.floor(Math.random() * 3) + 3, // 3-5
          sleep_quality: Math.floor(Math.random() * 2) + 4, // 4-5
          check_in_date: today,
        });

        if (!checkinError) {
          // Update streak
          const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.user_id)
            .maybeSingle();

          if (streak) {
            await supabase.from('user_streaks').update({
              current_streak: streak.current_streak + 1,
              longest_streak: Math.max(streak.longest_streak, streak.current_streak + 1),
              total_checkins: streak.total_checkins + 1,
              total_xp: streak.total_xp + 10,
              last_checkin_date: today,
            }).eq('user_id', user.user_id);
          }

          activities.push(`${user.display_name} completed daily check-in`);
        }
      }
    }

    // 4. Progress some challenges
    const { data: userChallenges } = await supabase
      .from('user_challenges')
      .select('*, challenge:challenges(*)')
      .eq('is_completed', false);

    if (userChallenges?.length) {
      const simulatedUserIds = simulatedProfiles.map(p => p.user_id);
      const simulatedChallenges = userChallenges.filter(uc => simulatedUserIds.includes(uc.user_id));
      
      const numProgressions = Math.min(simulatedChallenges.length, Math.floor(Math.random() * 5) + 3);
      const challengesToProgress = simulatedChallenges.sort(() => 0.5 - Math.random()).slice(0, numProgressions);

      for (const uc of challengesToProgress) {
        const newProgress = uc.progress + 1;
        const isCompleted = newProgress >= (uc.challenge as any).target_count;

        await supabase.from('user_challenges').update({
          progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        }).eq('id', uc.id);

        const userName = simulatedProfiles.find(p => p.user_id === uc.user_id)?.display_name;
        if (isCompleted) {
          // Post to activity feed
          await supabase.from('activity_feed').insert({
            user_id: uc.user_id,
            activity_type: 'challenge_completed',
            challenge_id: uc.challenge_id,
            xp_earned: (uc.challenge as any).xp_reward,
          });
          activities.push(`${userName} completed challenge: ${(uc.challenge as any).title}`);
        } else {
          activities.push(`${userName} progressed on challenge: ${(uc.challenge as any).title}`);
        }
      }
    }

    // 5. Award occasional badges (1-2 per day randomly)
    const numBadgeAwards = Math.floor(Math.random() * 2) + 1;
    const { data: badges } = await supabase.from('badges').select('id, name, xp_value');
    
    if (badges?.length) {
      const usersForBadges = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numBadgeAwards);
      
      for (const user of usersForBadges) {
        // Get badges user doesn't have
        const { data: userBadges } = await supabase
          .from('user_badges')
          .select('badge_id')
          .eq('user_id', user.user_id);
        
        const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];
        const availableBadges = badges.filter(b => !earnedBadgeIds.includes(b.id));
        
        if (availableBadges.length) {
          const badge = availableBadges[Math.floor(Math.random() * availableBadges.length)];
          
          await supabase.from('user_badges').insert({
            user_id: user.user_id,
            badge_id: badge.id,
          });

          await supabase.from('activity_feed').insert({
            user_id: user.user_id,
            activity_type: 'badge_earned',
            badge_id: badge.id,
            xp_earned: badge.xp_value,
          });

          activities.push(`${user.display_name} earned badge: ${badge.name}`);
        }
      }
    }

    console.log('Activity simulation complete:', activities);

    return new Response(JSON.stringify({ 
      success: true, 
      activitiesGenerated: activities.length,
      activities 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error simulating community activity:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
