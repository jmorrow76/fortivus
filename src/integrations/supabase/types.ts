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
      profiles: {
        Row: {
          avatar_url: string | null
          calorie_goal: number | null
          carbs_goal: number | null
          created_at: string
          display_name: string | null
          fat_goal: number | null
          id: string
          is_simulated: boolean | null
          protein_goal: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          calorie_goal?: number | null
          carbs_goal?: number | null
          created_at?: string
          display_name?: string | null
          fat_goal?: number | null
          id?: string
          is_simulated?: boolean | null
          protein_goal?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          calorie_goal?: number | null
          carbs_goal?: number | null
          created_at?: string
          display_name?: string | null
          fat_goal?: number | null
          id?: string
          is_simulated?: boolean | null
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
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          user_email: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          user_email: string
        }
        Update: {
          expires_at?: string | null
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
    }
    Functions: {
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
