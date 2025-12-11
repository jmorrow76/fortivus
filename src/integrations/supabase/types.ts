export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accountability_checkins: {
        Row: {
          created_at: string | null
          id: string
          partner_progress_note: string | null
          partnership_id: string
          personal_update: string | null
          prayed_for_partner: boolean | null
          prayer_request: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          partner_progress_note?: string | null
          partnership_id: string
          personal_update?: string | null
          prayed_for_partner?: boolean | null
          prayer_request?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          partner_progress_note?: string | null
          partnership_id?: string
          personal_update?: string | null
          prayed_for_partner?: boolean | null
          prayer_request?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accountability_checkins_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "accountability_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      accountability_partnerships: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          initiated_by: string
          last_checkin_reminder: string | null
          status: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          initiated_by: string
          last_checkin_reminder?: string | null
          status?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          initiated_by?: string
          last_checkin_reminder?: string | null
          status?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      accountability_requests: {
        Row: {
          bio: string | null
          created_at: string | null
          fitness_goals: string[] | null
          id: string
          is_active: boolean | null
          prayer_focus: string[] | null
          preferred_contact_frequency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          fitness_goals?: string[] | null
          id?: string
          is_active?: boolean | null
          prayer_focus?: string[] | null
          preferred_contact_frequency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          fitness_goals?: string[] | null
          id?: string
          is_active?: boolean | null
          prayer_focus?: string[] | null
          preferred_contact_frequency?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      achievement_comments: {
        Row: {
          badge_id: string | null
          comment: string
          created_at: string
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          badge_id?: string | null
          comment: string
          created_at?: string
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          badge_id?: string | null
          comment?: string
          created_at?: string
          id?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_comments_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_feed: {
        Row: {
          activity_type: string
          badge_id: string | null
          challenge_id: string | null
          created_at: string
          id: string
          streak_count: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          activity_type: string
          badge_id?: string | null
          challenge_id?: string | null
          created_at?: string
          id?: string
          streak_count?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          activity_type?: string
          badge_id?: string | null
          challenge_id?: string | null
          created_at?: string
          id?: string
          streak_count?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          read_time_minutes: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          read_time_minutes?: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          read_time_minutes?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: Database["public"]["Enums"]["badge_category"]
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_value: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["badge_category"]
          created_at?: string
          description: string
          icon?: string
          id?: string
          name: string
          requirement_type: string
          requirement_value?: number
          xp_value?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["badge_category"]
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_value?: number
        }
        Relationships: []
      }
      body_analysis_results: {
        Row: {
          areas_to_improve: string[] | null
          body_fat_category: string | null
          body_fat_percentage: number | null
          created_at: string
          estimated_timeframe: string | null
          id: string
          image_url: string | null
          muscle_assessment: string | null
          nutrition_recommendation: string | null
          recovery_recommendation: string | null
          strengths: string[] | null
          training_recommendation: string | null
          user_id: string
        }
        Insert: {
          areas_to_improve?: string[] | null
          body_fat_category?: string | null
          body_fat_percentage?: number | null
          created_at?: string
          estimated_timeframe?: string | null
          id?: string
          image_url?: string | null
          muscle_assessment?: string | null
          nutrition_recommendation?: string | null
          recovery_recommendation?: string | null
          strengths?: string[] | null
          training_recommendation?: string | null
          user_id: string
        }
        Update: {
          areas_to_improve?: string[] | null
          body_fat_category?: string | null
          body_fat_percentage?: number | null
          created_at?: string
          estimated_timeframe?: string | null
          id?: string
          image_url?: string | null
          muscle_assessment?: string | null
          nutrition_recommendation?: string | null
          recovery_recommendation?: string | null
          strengths?: string[] | null
          training_recommendation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          badge_id: string | null
          category: string
          created_at: string
          description: string
          duration_days: number
          id: string
          is_active: boolean
          reset_type: string | null
          target_count: number
          title: string
          xp_reward: number
        }
        Insert: {
          badge_id?: string | null
          category?: string
          created_at?: string
          description: string
          duration_days?: number
          id?: string
          is_active?: boolean
          reset_type?: string | null
          target_count?: number
          title: string
          xp_reward?: number
        }
        Update: {
          badge_id?: string | null
          category?: string
          created_at?: string
          description?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          reset_type?: string | null
          target_count?: number
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coaching_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "coaching_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_metrics: {
        Row: {
          ai_insights: string | null
          assessment_date: string
          caffeine_intake: number | null
          cognitive_load_score: number | null
          created_at: string
          decision_fatigue: number | null
          focus_rating: number | null
          id: string
          meetings_count: number | null
          mental_clarity: number | null
          optimal_workout_windows: Json | null
          productivity_recommendations: Json | null
          screen_time_hours: number | null
          stress_management_protocol: Json | null
          user_id: string
          work_hours: number | null
        }
        Insert: {
          ai_insights?: string | null
          assessment_date?: string
          caffeine_intake?: number | null
          cognitive_load_score?: number | null
          created_at?: string
          decision_fatigue?: number | null
          focus_rating?: number | null
          id?: string
          meetings_count?: number | null
          mental_clarity?: number | null
          optimal_workout_windows?: Json | null
          productivity_recommendations?: Json | null
          screen_time_hours?: number | null
          stress_management_protocol?: Json | null
          user_id: string
          work_hours?: number | null
        }
        Update: {
          ai_insights?: string | null
          assessment_date?: string
          caffeine_intake?: number | null
          cognitive_load_score?: number | null
          created_at?: string
          decision_fatigue?: number | null
          focus_rating?: number | null
          id?: string
          meetings_count?: number | null
          mental_clarity?: number | null
          optimal_workout_windows?: Json | null
          productivity_recommendations?: Json | null
          screen_time_hours?: number | null
          stress_management_protocol?: Json | null
          user_id?: string
          work_hours?: number | null
        }
        Relationships: []
      }
      comeback_protocols: {
        Row: {
          ai_guidance: string | null
          created_at: string
          current_fitness_level: number | null
          days_off: number
          goals: string | null
          id: string
          injury_details: string | null
          is_active: boolean | null
          nutrition_adjustments: Json | null
          previous_training_frequency: number | null
          progression_milestones: Json | null
          reason_for_break: string | null
          recovery_priorities: Json | null
          user_id: string
          warning_signs: string[] | null
          week_1_protocol: Json | null
          week_2_protocol: Json | null
          week_3_protocol: Json | null
          week_4_protocol: Json | null
        }
        Insert: {
          ai_guidance?: string | null
          created_at?: string
          current_fitness_level?: number | null
          days_off: number
          goals?: string | null
          id?: string
          injury_details?: string | null
          is_active?: boolean | null
          nutrition_adjustments?: Json | null
          previous_training_frequency?: number | null
          progression_milestones?: Json | null
          reason_for_break?: string | null
          recovery_priorities?: Json | null
          user_id: string
          warning_signs?: string[] | null
          week_1_protocol?: Json | null
          week_2_protocol?: Json | null
          week_3_protocol?: Json | null
          week_4_protocol?: Json | null
        }
        Update: {
          ai_guidance?: string | null
          created_at?: string
          current_fitness_level?: number | null
          days_off?: number
          goals?: string | null
          id?: string
          injury_details?: string | null
          is_active?: boolean | null
          nutrition_adjustments?: Json | null
          previous_training_frequency?: number | null
          progression_milestones?: Json | null
          reason_for_break?: string | null
          recovery_priorities?: Json | null
          user_id?: string
          warning_signs?: string[] | null
          week_1_protocol?: Json | null
          week_2_protocol?: Json | null
          week_3_protocol?: Json | null
          week_4_protocol?: Json | null
        }
        Relationships: []
      }
      dm_conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      dm_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "dm_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "dm_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: []
      }
      exercise_playlist_items: {
        Row: {
          created_at: string
          id: string
          playlist_id: string
          sort_order: number
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          playlist_id: string
          sort_order?: number
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          playlist_id?: string
          sort_order?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "exercise_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercise_sets: {
        Row: {
          completed_at: string | null
          created_at: string
          exercise_id: string
          id: string
          is_completed: boolean | null
          is_warmup: boolean | null
          notes: string | null
          reps: number | null
          session_id: string
          set_number: number
          weight: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exercise_id: string
          id?: string
          is_completed?: boolean | null
          is_warmup?: boolean | null
          notes?: string | null
          reps?: number | null
          session_id: string
          set_number: number
          weight?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exercise_id?: string
          id?: string
          is_completed?: boolean | null
          is_warmup?: boolean | null
          notes?: string | null
          reps?: number | null
          session_id?: string
          set_number?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string | null
          equipment: string | null
          id: string
          instructions: string | null
          is_custom: boolean | null
          muscle_group: string
          name: string
          secondary_muscles: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_custom?: boolean | null
          muscle_group: string
          name: string
          secondary_muscles?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_custom?: boolean | null
          muscle_group?: string
          name?: string
          secondary_muscles?: string[] | null
        }
        Relationships: []
      }
      foods: {
        Row: {
          brand: string | null
          calories: number
          carbs: number
          created_at: string
          created_by: string | null
          fat: number
          fiber: number | null
          id: string
          is_verified: boolean
          name: string
          protein: number
          serving_size: number
          serving_unit: string
        }
        Insert: {
          brand?: string | null
          calories: number
          carbs?: number
          created_at?: string
          created_by?: string | null
          fat?: number
          fiber?: number | null
          id?: string
          is_verified?: boolean
          name: string
          protein?: number
          serving_size?: number
          serving_unit?: string
        }
        Update: {
          brand?: string | null
          calories?: number
          carbs?: number
          created_at?: string
          created_by?: string | null
          fat?: number
          fiber?: number | null
          id?: string
          is_verified?: boolean
          name?: string
          protein?: number
          serving_size?: number
          serving_unit?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_moderated: boolean | null
          moderation_reason: string | null
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_moderated?: boolean | null
          moderation_reason?: string | null
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_moderated?: boolean | null
          moderation_reason?: string | null
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          category_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hormonal_profiles: {
        Row: {
          age: number | null
          ai_insights: string | null
          assessment_date: string
          created_at: string
          energy_afternoon: number | null
          energy_evening: number | null
          energy_morning: number | null
          id: string
          libido_level: number | null
          nutrition_recommendations: Json | null
          recovery_quality: number | null
          sleep_hours: number | null
          stress_level: number | null
          supplement_recommendations: Json | null
          training_intensity_recommendation: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          ai_insights?: string | null
          assessment_date?: string
          created_at?: string
          energy_afternoon?: number | null
          energy_evening?: number | null
          energy_morning?: number | null
          id?: string
          libido_level?: number | null
          nutrition_recommendations?: Json | null
          recovery_quality?: number | null
          sleep_hours?: number | null
          stress_level?: number | null
          supplement_recommendations?: Json | null
          training_intensity_recommendation?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          ai_insights?: string | null
          assessment_date?: string
          created_at?: string
          energy_afternoon?: number | null
          energy_evening?: number | null
          energy_morning?: number | null
          id?: string
          libido_level?: number | null
          nutrition_recommendations?: Json | null
          recovery_quality?: number | null
          sleep_hours?: number | null
          stress_level?: number | null
          supplement_recommendations?: Json | null
          training_intensity_recommendation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      joint_health_scores: {
        Row: {
          ai_analysis: string | null
          assessment_date: string
          created_at: string
          exercises_to_avoid: string[] | null
          id: string
          joint_name: string
          mobility_protocol: Json | null
          pain_level: number | null
          preventive_recommendations: Json | null
          range_of_motion: number | null
          recent_training_load: number | null
          risk_factors: Json | null
          risk_score: number | null
          stiffness_level: number | null
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          assessment_date?: string
          created_at?: string
          exercises_to_avoid?: string[] | null
          id?: string
          joint_name: string
          mobility_protocol?: Json | null
          pain_level?: number | null
          preventive_recommendations?: Json | null
          range_of_motion?: number | null
          recent_training_load?: number | null
          risk_factors?: Json | null
          risk_score?: number | null
          stiffness_level?: number | null
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          assessment_date?: string
          created_at?: string
          exercises_to_avoid?: string[] | null
          id?: string
          joint_name?: string
          mobility_protocol?: Json | null
          pain_level?: number | null
          preventive_recommendations?: Json | null
          range_of_motion?: number | null
          recent_training_load?: number | null
          risk_factors?: Json | null
          risk_score?: number | null
          stiffness_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          created_at: string
          custom_calories: number | null
          custom_carbs: number | null
          custom_fat: number | null
          custom_food_name: string | null
          custom_protein: number | null
          food_id: string | null
          id: string
          log_date: string
          meal_type: string
          servings: number
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_calories?: number | null
          custom_carbs?: number | null
          custom_fat?: number | null
          custom_food_name?: string | null
          custom_protein?: number | null
          food_id?: string | null
          id?: string
          log_date?: string
          meal_type?: string
          servings?: number
          user_id: string
        }
        Update: {
          created_at?: string
          custom_calories?: number | null
          custom_carbs?: number | null
          custom_fat?: number | null
          custom_food_name?: string | null
          custom_protein?: number | null
          food_id?: string | null
          id?: string
          log_date?: string
          meal_type?: string
          servings?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_checkins: {
        Row: {
          check_in_date: string
          created_at: string
          energy_level: number
          id: string
          mood_level: number
          notes: string | null
          sleep_quality: number | null
          stress_level: number
          user_id: string
          workout_recommendation: Json | null
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          energy_level: number
          id?: string
          mood_level: number
          notes?: string | null
          sleep_quality?: number | null
          stress_level: number
          user_id: string
          workout_recommendation?: Json | null
        }
        Update: {
          check_in_date?: string
          created_at?: string
          energy_level?: number
          id?: string
          mood_level?: number
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number
          user_id?: string
          workout_recommendation?: Json | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          content: string
          created_at: string
          id: string
          recipients_count: number | null
          sent_at: string | null
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipients_count?: number | null
          sent_at?: string | null
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipients_count?: number | null
          sent_at?: string | null
          subject?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          checkin_reminder: boolean
          created_at: string
          id: string
          push_subscription: Json | null
          reminder_time: string
          streak_alert: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_reminder?: boolean
          created_at?: string
          id?: string
          push_subscription?: Json | null
          reminder_time?: string
          streak_alert?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_reminder?: boolean
          created_at?: string
          id?: string
          push_subscription?: Json | null
          reminder_time?: string
          streak_alert?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_plans: {
        Row: {
          created_at: string
          current_stats: Json | null
          goals: string
          id: string
          plan_data: Json
          preferences: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_stats?: Json | null
          goals: string
          id?: string
          plan_data: Json
          preferences?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_stats?: Json | null
          goals?: string
          id?: string
          plan_data?: Json
          preferences?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          exercise_id: string
          id: string
          record_type: string
          reps_at_weight: number | null
          session_id: string | null
          user_id: string
          value: number
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          exercise_id: string
          id?: string
          record_type?: string
          reps_at_weight?: number | null
          session_id?: string | null
          user_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          created_at?: string
          exercise_id?: string
          id?: string
          record_type?: string
          reps_at_weight?: number | null
          session_id?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_journal_entries: {
        Row: {
          answered_at: string | null
          answered_notes: string | null
          created_at: string
          id: string
          is_answered: boolean
          partnership_id: string
          request_text: string
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          answered_notes?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean
          partnership_id: string
          request_text: string
          user_id: string
        }
        Update: {
          answered_at?: string | null
          answered_notes?: string | null
          created_at?: string
          id?: string
          is_answered?: boolean
          partnership_id?: string
          request_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_journal_entries_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "accountability_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned_at: string | null
          calorie_goal: number | null
          carbs_goal: number | null
          created_at: string
          display_name: string | null
          fat_goal: number | null
          id: string
          is_simulated: boolean | null
          landing_page_preference: string | null
          protein_goal: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          banned_at?: string | null
          calorie_goal?: number | null
          carbs_goal?: number | null
          created_at?: string
          display_name?: string | null
          fat_goal?: number | null
          id?: string
          is_simulated?: boolean | null
          landing_page_preference?: string | null
          protein_goal?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          banned_at?: string | null
          calorie_goal?: number | null
          carbs_goal?: number | null
          created_at?: string
          display_name?: string | null
          fat_goal?: number | null
          id?: string
          is_simulated?: boolean | null
          landing_page_preference?: string | null
          protein_goal?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          photo_date: string
          photo_url: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_date?: string
          photo_url: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          photo_date?: string
          photo_url?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_used: boolean
          redeemed_at: string | null
          redeemed_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Relationships: []
      }
      recommended_products: {
        Row: {
          amazon_url: string
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          price: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          amazon_url: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          price?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          amazon_url?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          price?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      running_goals: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_run_date: string | null
          longest_streak: number
          streak_type: string
          updated_at: string
          user_id: string
          weekly_distance_km: number
          weekly_runs: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_run_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id: string
          weekly_distance_km?: number
          weekly_runs?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_run_date?: string | null
          longest_streak?: number
          streak_type?: string
          updated_at?: string
          user_id?: string
          weekly_distance_km?: number
          weekly_runs?: number
        }
        Relationships: []
      }
      running_sessions: {
        Row: {
          avg_pace_seconds_per_km: number | null
          calories_burned: number | null
          completed_at: string | null
          created_at: string
          distance_meters: number | null
          duration_seconds: number | null
          id: string
          notes: string | null
          route_coordinates: Json | null
          started_at: string
          user_id: string
        }
        Insert: {
          avg_pace_seconds_per_km?: number | null
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          route_coordinates?: Json | null
          started_at?: string
          user_id: string
        }
        Update: {
          avg_pace_seconds_per_km?: number | null
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          route_coordinates?: Json | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_stories: {
        Row: {
          created_at: string
          id: string
          story_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      sleep_workout_adaptations: {
        Row: {
          adaptation_date: string
          adapted_workout_plan: Json | null
          ai_reasoning: string | null
          created_at: string
          exercise_swaps: Json | null
          hrv_reading: number | null
          id: string
          intensity_modifier: number | null
          original_workout_plan: Json | null
          readiness_score: number | null
          recovery_additions: Json | null
          resting_heart_rate: number | null
          sleep_disruptions: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          user_id: string
          volume_modifier: number | null
        }
        Insert: {
          adaptation_date?: string
          adapted_workout_plan?: Json | null
          ai_reasoning?: string | null
          created_at?: string
          exercise_swaps?: Json | null
          hrv_reading?: number | null
          id?: string
          intensity_modifier?: number | null
          original_workout_plan?: Json | null
          readiness_score?: number | null
          recovery_additions?: Json | null
          resting_heart_rate?: number | null
          sleep_disruptions?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          user_id: string
          volume_modifier?: number | null
        }
        Update: {
          adaptation_date?: string
          adapted_workout_plan?: Json | null
          ai_reasoning?: string | null
          created_at?: string
          exercise_swaps?: Json | null
          hrv_reading?: number | null
          id?: string
          intensity_modifier?: number | null
          original_workout_plan?: Json | null
          readiness_score?: number | null
          recovery_additions?: Json | null
          resting_heart_rate?: number | null
          sleep_disruptions?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          user_id?: string
          volume_modifier?: number | null
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string | null
          auto_post_badges: boolean
          auto_post_progress: boolean
          auto_post_workouts: boolean
          connected_at: string
          id: string
          platform: string
          platform_username: string | null
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          auto_post_badges?: boolean
          auto_post_progress?: boolean
          auto_post_workouts?: boolean
          connected_at?: string
          id?: string
          platform: string
          platform_username?: string | null
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          auto_post_badges?: boolean
          auto_post_progress?: boolean
          auto_post_workouts?: boolean
          connected_at?: string
          id?: string
          platform?: string
          platform_username?: string | null
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_grants: {
        Row: {
          expires_at: string | null
          grant_type: string
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          user_email: string
        }
        Insert: {
          expires_at?: string | null
          grant_type?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          user_email: string
        }
        Update: {
          expires_at?: string | null
          grant_type?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          user_email?: string
        }
        Relationships: []
      }
      template_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          rest_seconds: number | null
          sort_order: number
          target_reps: number | null
          target_sets: number | null
          target_weight: number | null
          template_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          rest_seconds?: number | null
          sort_order?: number
          target_reps?: number | null
          target_sets?: number | null
          target_weight?: number | null
          template_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          rest_seconds?: number | null
          sort_order?: number
          target_reps?: number | null
          target_sets?: number | null
          target_weight?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_featured: boolean
          is_weekly_spotlight: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean
          is_weekly_spotlight?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          is_weekly_spotlight?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          is_completed: boolean
          progress: number
          reset_week: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          progress?: number
          reset_week?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          progress?: number
          reset_week?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          age_range: string
          available_equipment: string[] | null
          completed_at: string
          created_at: string
          current_challenges: string[] | null
          dietary_preference: string | null
          experience_level: string
          fitness_goal: string
          focus_areas: string[] | null
          id: string
          injuries_limitations: string | null
          user_id: string
          workout_frequency: string
        }
        Insert: {
          age_range: string
          available_equipment?: string[] | null
          completed_at?: string
          created_at?: string
          current_challenges?: string[] | null
          dietary_preference?: string | null
          experience_level: string
          fitness_goal: string
          focus_areas?: string[] | null
          id?: string
          injuries_limitations?: string | null
          user_id: string
          workout_frequency: string
        }
        Update: {
          age_range?: string
          available_equipment?: string[] | null
          completed_at?: string
          created_at?: string
          current_challenges?: string[] | null
          dietary_preference?: string | null
          experience_level?: string
          fitness_goal?: string
          focus_areas?: string[] | null
          id?: string
          injuries_limitations?: string | null
          user_id?: string
          workout_frequency?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          id: string
          last_checkin_date: string | null
          longest_streak: number
          show_on_leaderboard: boolean
          total_checkins: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          show_on_leaderboard?: boolean
          total_checkins?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_checkin_date?: string | null
          longest_streak?: number
          show_on_leaderboard?: boolean
          total_checkins?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          user_id: string
          workout_type: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          user_id: string
          workout_type: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          user_id?: string
          workout_type?: string
          xp_earned?: number
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          name: string
          notes: string | null
          started_at: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
          started_at?: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
          started_at?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          avatar_url: string | null
          current_streak: number | null
          display_name: string | null
          longest_streak: number | null
          total_checkins: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: []
      }
      running_leaderboard_view: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          total_distance_meters: number | null
          total_runs: number | null
          user_id: string | null
          weekly_distance_meters: number | null
          weekly_duration_seconds: number | null
          weekly_runs: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_public_profile: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: { user_ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      badge_category: "streak" | "challenge" | "milestone" | "special"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      badge_category: ["streak", "challenge", "milestone", "special"],
    },
  },
} as const
