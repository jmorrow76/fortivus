import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Topic categories for forum posts (Christian fitness focused)
const forumTopics = [
  "workout routines as stewardship", "nutrition tips for temple care", "supplement advice", "recovery and rest",
  "staying motivated through faith", "progress updates and gratitude", "equipment recommendations",
  "injury prevention and patience", "sleep as God's gift", "managing stress through prayer",
  "men's health after 40", "joint health", "balancing cardio and strength",
  "meal prep ideas", "protein intake", "hydration tips",
  "praying before workouts", "accountability with brothers", "discipline as spiritual fruit",
  "honoring God with our bodies", "scripture for motivation", "fitness as worship"
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
            content: `You are simulating a Christian man over 40 who is part of a faith-based fitness community. Write naturally and authentically like a real believer would in an online fitness forum. Keep responses concise (2-4 sentences for replies, 3-5 sentences for posts). Be helpful, encouraging, and occasionally reference faith, scripture, prayer, or gratitude to God. Share personal experiences about stewarding your body as a temple. Be brotherly and supportive. Never use profanity. Never mention you are AI or simulated.`
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
        `Write a forum post about ${topic} from the perspective of a ${40 + Math.floor(Math.random() * 20)} year old Christian man who views fitness as stewardship of God's temple. Ask a question or share an experience. You can mention prayer, faith, or scripture naturally if relevant. Keep it authentic and conversational.`
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
          `Reply to this fitness forum post: "${topic.title}" - "${topic.content.slice(0, 200)}". Be helpful, share your own experience or advice as a Christian man over 40 into fitness. Be encouraging and brotherly. You can mention prayer, faith, or scripture naturally if relevant.`
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

    // 6. Create 1-2 new testimonies occasionally
    const shouldCreateTestimony = Math.random() > 0.5; // 50% chance
    if (shouldCreateTestimony) {
      const numTestimonies = Math.floor(Math.random() * 2) + 1;
      const testimonyCreators = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numTestimonies);

      const testimonyThemes = [
        "overcoming chronic pain through faith and fitness",
        "losing weight and finding spiritual discipline",
        "recovering from injury with God's help",
        "becoming a better father through fitness",
        "managing stress through prayer and exercise",
        "accountability partner helping me grow",
        "breaking bad habits through discipline",
        "finding community and brotherhood",
        "getting off blood pressure medication",
        "sleeping better after years of insomnia",
        "marriage restoration through self-care",
        "overcoming depression with faith and fitness"
      ];

      for (const creator of testimonyCreators) {
        const theme = testimonyThemes[Math.floor(Math.random() * testimonyThemes.length)];
        
        const testimonyContent = await generateAIContent(
          `Write a heartfelt testimony (4-6 paragraphs) from a Christian man over 40 about ${theme}. Share specific details about your struggle, how you found this community, and how God worked through fitness and brotherhood to transform your life. Be genuine, grateful, and give glory to God. Include how long the journey took and specific results. This is for a faith-based fitness community.`
        );

        if (testimonyContent) {
          const titleContent = await generateAIContent(
            `Create a short, compelling title (max 10 words) for this testimony about ${theme}. Make it inspiring and faith-focused. Just respond with the title, no quotes.`
          );

          const title = titleContent?.slice(0, 100) || `How God Used Fitness to Transform My Life`;

          const { error: testimonyError } = await supabase.from('testimonies').insert({
            user_id: creator.user_id,
            title: title,
            content: testimonyContent,
            is_featured: false,
            is_weekly_spotlight: false,
          });

          if (!testimonyError) {
            activities.push(`${creator.display_name} shared testimony: "${title}"`);
          }
        }
      }
    }

    // 7. Like testimonies (3-8 likes)
    const { data: testimonies } = await supabase
      .from('testimonies')
      .select('id, user_id')
      .order('created_at', { ascending: false })
      .limit(20);

    if (testimonies?.length) {
      const numLikes = Math.floor(Math.random() * 6) + 3;
      const likers = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numLikes);

      for (const liker of likers) {
        // Pick a random testimony that's not their own
        const eligibleTestimonies = testimonies.filter(t => t.user_id !== liker.user_id);
        if (eligibleTestimonies.length === 0) continue;

        const testimony = eligibleTestimonies[Math.floor(Math.random() * eligibleTestimonies.length)];

        // Check if already liked
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', liker.user_id)
          .eq('target_type', 'testimony')
          .eq('target_id', testimony.id)
          .maybeSingle();

        if (!existingLike) {
          const { error: likeError } = await supabase.from('likes').insert({
            user_id: liker.user_id,
            target_type: 'testimony',
            target_id: testimony.id,
          });

          if (!likeError) {
            activities.push(`${liker.display_name} encouraged a testimony`);
          }
        }
      }
    }

    // 8. Like forum topics (5-10 likes)
    const { data: forumTopicsToLike } = await supabase
      .from('forum_topics')
      .select('id, user_id, title')
      .order('created_at', { ascending: false })
      .limit(30);

    if (forumTopicsToLike?.length) {
      const numTopicLikes = Math.floor(Math.random() * 6) + 5;
      const topicLikers = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numTopicLikes);

      for (const liker of topicLikers) {
        const eligibleTopics = forumTopicsToLike.filter(t => t.user_id !== liker.user_id);
        if (eligibleTopics.length === 0) continue;

        const topic = eligibleTopics[Math.floor(Math.random() * eligibleTopics.length)];

        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', liker.user_id)
          .eq('target_type', 'forum_topic')
          .eq('target_id', topic.id)
          .maybeSingle();

        if (!existingLike) {
          const { error: likeError } = await supabase.from('likes').insert({
            user_id: liker.user_id,
            target_type: 'forum_topic',
            target_id: topic.id,
          });

          if (!likeError) {
            activities.push(`${liker.display_name} liked topic: "${topic.title.slice(0, 30)}..."`);
          }
        }
      }
    }

    // 9. Like forum posts/replies (5-10 likes)
    const { data: forumPostsToLike } = await supabase
      .from('forum_posts')
      .select('id, user_id')
      .eq('is_moderated', false)
      .order('created_at', { ascending: false })
      .limit(30);

    if (forumPostsToLike?.length) {
      const numPostLikes = Math.floor(Math.random() * 6) + 5;
      const postLikers = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numPostLikes);

      for (const liker of postLikers) {
        const eligiblePosts = forumPostsToLike.filter(p => p.user_id !== liker.user_id);
        if (eligiblePosts.length === 0) continue;

        const post = eligiblePosts[Math.floor(Math.random() * eligiblePosts.length)];

        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', liker.user_id)
          .eq('target_type', 'forum_post')
          .eq('target_id', post.id)
          .maybeSingle();

        if (!existingLike) {
          const { error: likeError } = await supabase.from('likes').insert({
            user_id: liker.user_id,
            target_type: 'forum_post',
            target_id: post.id,
          });

          if (!likeError) {
            activities.push(`${liker.display_name} liked a forum reply`);
          }
        }
      }
    }

    // 10. Like activity feed items (5-10 likes)
    const { data: activitiesToLike } = await supabase
      .from('activity_feed')
      .select('id, user_id, activity_type')
      .order('created_at', { ascending: false })
      .limit(30);

    if (activitiesToLike?.length) {
      const numActivityLikes = Math.floor(Math.random() * 6) + 5;
      const activityLikers = simulatedProfiles.sort(() => 0.5 - Math.random()).slice(0, numActivityLikes);

      for (const liker of activityLikers) {
        const eligibleActivities = activitiesToLike.filter(a => a.user_id !== liker.user_id);
        if (eligibleActivities.length === 0) continue;

        const activity = eligibleActivities[Math.floor(Math.random() * eligibleActivities.length)];

        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', liker.user_id)
          .eq('target_type', 'activity')
          .eq('target_id', activity.id)
          .maybeSingle();

        if (!existingLike) {
          const { error: likeError } = await supabase.from('likes').insert({
            user_id: liker.user_id,
            target_type: 'activity',
            target_id: activity.id,
          });

          if (!likeError) {
            activities.push(`${liker.display_name} liked a ${activity.activity_type.replace('_', ' ')}`);
          }
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
