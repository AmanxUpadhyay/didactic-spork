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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_context_summaries: {
        Row: {
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["summary_period_type"]
          summary_data: Json | null
          summary_text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          period_type: Database["public"]["Enums"]["summary_period_type"]
          summary_data?: Json | null
          summary_text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          period_type?: Database["public"]["Enums"]["summary_period_type"]
          summary_data?: Json | null
          summary_text?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_responses: {
        Row: {
          created_at: string | null
          feedback_rating: number | null
          feedback_text: string | null
          function_type: Database["public"]["Enums"]["ai_function_type"]
          id: string
          model_used: string | null
          personality_mode: string | null
          response_text: string
          sprint_id: string | null
          structured_data: Json | null
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_rating?: number | null
          feedback_text?: string | null
          function_type: Database["public"]["Enums"]["ai_function_type"]
          id?: string
          model_used?: string | null
          personality_mode?: string | null
          response_text: string
          sprint_id?: string | null
          structured_data?: Json | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_rating?: number | null
          feedback_text?: string | null
          function_type?: Database["public"]["Enums"]["ai_function_type"]
          id?: string
          model_used?: string | null
          personality_mode?: string | null
          response_text?: string
          sprint_id?: string | null
          structured_data?: Json | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_responses_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      appreciation_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          recipient_id: string
          sprint_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          recipient_id: string
          sprint_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          recipient_id?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appreciation_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciation_notes_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appreciation_notes_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      date_history: {
        Row: {
          activity_type: string | null
          category: Database["public"]["Enums"]["date_category"]
          created_at: string
          cuisine_type: string | null
          date_at: string | null
          id: string
          notes: string | null
          punishment_id: string
          rating: number | null
          venue_name: string | null
        }
        Insert: {
          activity_type?: string | null
          category: Database["public"]["Enums"]["date_category"]
          created_at?: string
          cuisine_type?: string | null
          date_at?: string | null
          id?: string
          notes?: string | null
          punishment_id: string
          rating?: number | null
          venue_name?: string | null
        }
        Update: {
          activity_type?: string | null
          category?: Database["public"]["Enums"]["date_category"]
          created_at?: string
          cuisine_type?: string | null
          date_at?: string | null
          id?: string
          notes?: string | null
          punishment_id?: string
          rating?: number | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "date_history_punishment_id_fkey"
            columns: ["punishment_id"]
            isOneToOne: false
            referencedRelation: "punishments"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_completions: {
        Row: {
          completed_at: string | null
          completed_date: string
          created_at: string
          id: string
          notes: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_date: string
          created_at?: string
          id?: string
          notes?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          claimed_by: string | null
          code: string
          created_at: string
          creator_id: string
          expires_at: string
          id: string
        }
        Insert: {
          claimed_by?: string | null
          code: string
          created_at?: string
          creator_id: string
          expires_at?: string
          id?: string
        }
        Update: {
          claimed_by?: string | null
          code?: string
          created_at?: string
          creator_id?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          journal_text: string | null
          mood_depth: Database["public"]["Enums"]["mood_depth"]
          mood_score: number
          tags: string[] | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          journal_text?: string | null
          mood_depth?: Database["public"]["Enums"]["mood_depth"]
          mood_score: number
          tags?: string[] | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          journal_text?: string | null
          mood_depth?: Database["public"]["Enums"]["mood_depth"]
          mood_score?: number
          tags?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          created_at: string
          error_code: number | null
          error_message: string | null
          id: string
          queue_id: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          created_at?: string
          error_code?: number | null
          error_message?: string | null
          id?: string
          queue_id?: string | null
          status: string
          subscription_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: number | null
          error_message?: string | null
          id?: string
          queue_id?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "notification_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          categories_enabled: Json | null
          enabled: boolean | null
          max_daily_notifications: number | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categories_enabled?: Json | null
          enabled?: boolean | null
          max_daily_notifications?: number | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categories_enabled?: Json | null
          enabled?: boolean | null
          max_daily_notifications?: number | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          actions: Json | null
          body: string
          category: Database["public"]["Enums"]["notif_category"]
          created_at: string
          data: Json | null
          error_code: number | null
          error_message: string | null
          id: string
          max_retries: number
          retry_count: number
          scheduled_for: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notif_status"]
          tag: string | null
          template_id: string | null
          title: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          actions?: Json | null
          body: string
          category: Database["public"]["Enums"]["notif_category"]
          created_at?: string
          data?: Json | null
          error_code?: number | null
          error_message?: string | null
          id?: string
          max_retries?: number
          retry_count?: number
          scheduled_for: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notif_status"]
          tag?: string | null
          template_id?: string | null
          title: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          actions?: Json | null
          body?: string
          category?: Database["public"]["Enums"]["notif_category"]
          created_at?: string
          data?: Json | null
          error_code?: number | null
          error_message?: string | null
          id?: string
          max_retries?: number
          retry_count?: number
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notif_status"]
          tag?: string | null
          template_id?: string | null
          title?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          actions: Json | null
          body_template: string
          category: Database["public"]["Enums"]["notif_category"]
          created_at: string | null
          id: string
          tag: string
          title_template: string
          urgency: string | null
        }
        Insert: {
          actions?: Json | null
          body_template: string
          category: Database["public"]["Enums"]["notif_category"]
          created_at?: string | null
          id?: string
          tag: string
          title_template: string
          urgency?: string | null
        }
        Update: {
          actions?: Json | null
          body_template?: string
          category?: Database["public"]["Enums"]["notif_category"]
          created_at?: string | null
          id?: string
          tag?: string
          title_template?: string
          urgency?: string | null
        }
        Relationships: []
      }
      partner_pairs: {
        Row: {
          active: boolean
          id: string
          paired_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          active?: boolean
          id?: string
          paired_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          active?: boolean
          id?: string
          paired_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      punishments: {
        Row: {
          accepted: boolean | null
          budget_gbp: number | null
          created_at: string
          date_plan: Json
          id: string
          intensity: Database["public"]["Enums"]["punishment_intensity"]
          loser_id: string
          sprint_id: string
          updated_at: string
          vetoes_granted: number
          vetoes_used: number
        }
        Insert: {
          accepted?: boolean | null
          budget_gbp?: number | null
          created_at?: string
          date_plan?: Json
          id?: string
          intensity?: Database["public"]["Enums"]["punishment_intensity"]
          loser_id: string
          sprint_id: string
          updated_at?: string
          vetoes_granted?: number
          vetoes_used?: number
        }
        Update: {
          accepted?: boolean | null
          budget_gbp?: number | null
          created_at?: string
          date_plan?: Json
          id?: string
          intensity?: Database["public"]["Enums"]["punishment_intensity"]
          loser_id?: string
          sprint_id?: string
          updated_at?: string
          vetoes_granted?: number
          vetoes_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "punishments_loser_id_fkey"
            columns: ["loser_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punishments_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: true
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          active: boolean
          auth_key: string
          created_at: string
          deactivated_at: string | null
          endpoint: string
          id: string
          last_successful_push: string | null
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          auth_key: string
          created_at?: string
          deactivated_at?: string | null
          endpoint: string
          id?: string
          last_successful_push?: string | null
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          auth_key?: string
          created_at?: string
          deactivated_at?: string | null
          endpoint?: string
          id?: string
          last_successful_push?: string | null
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      relationship_health: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          intervention_taken: string | null
          resolved: boolean | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["intervention_severity"]
          signal_type: Database["public"]["Enums"]["health_signal_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          intervention_taken?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["intervention_severity"]
          signal_type: Database["public"]["Enums"]["health_signal_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          intervention_taken?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["intervention_severity"]
          signal_type?: Database["public"]["Enums"]["health_signal_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_health_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_xp: {
        Row: {
          id: string
          level: number
          milestones: Json
          total_xp: number
          updated_at: string
        }
        Insert: {
          id?: string
          level?: number
          milestones?: Json
          total_xp?: number
          updated_at?: string
        }
        Update: {
          id?: string
          level?: number
          milestones?: Json
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
      sprint_tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          difficulty_rating: Database["public"]["Enums"]["difficulty_level"]
          id: string
          points_earned: number | null
          sprint_id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          difficulty_rating?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          points_earned?: number | null
          sprint_id: string
          task_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          difficulty_rating?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          points_earned?: number | null
          sprint_id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          appreciation_required: boolean
          created_at: string
          id: string
          relative_performance_index: number | null
          score_a: number | null
          score_b: number | null
          score_breakdown_a: Json | null
          score_breakdown_b: Json | null
          status: Database["public"]["Enums"]["sprint_status"]
          tier_points_earned: number | null
          updated_at: string
          week_start: string
          winner_id: string | null
        }
        Insert: {
          appreciation_required?: boolean
          created_at?: string
          id?: string
          relative_performance_index?: number | null
          score_a?: number | null
          score_b?: number | null
          score_breakdown_a?: Json | null
          score_breakdown_b?: Json | null
          status?: Database["public"]["Enums"]["sprint_status"]
          tier_points_earned?: number | null
          updated_at?: string
          week_start: string
          winner_id?: string | null
        }
        Update: {
          appreciation_required?: boolean
          created_at?: string
          id?: string
          relative_performance_index?: number | null
          score_a?: number | null
          score_b?: number | null
          score_breakdown_a?: Json | null
          score_breakdown_b?: Json | null
          status?: Database["public"]["Enums"]["sprint_status"]
          tier_points_earned?: number | null
          updated_at?: string
          week_start?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          best_days: number
          broken_at: string | null
          couple_rescue_available: boolean
          created_at: string
          current_days: number
          freeze_available: number
          freeze_used_at: string[] | null
          id: string
          last_completed_at: string | null
          milestone_floor: number
          streak_type: Database["public"]["Enums"]["streak_type"]
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_days?: number
          broken_at?: string | null
          couple_rescue_available?: boolean
          created_at?: string
          current_days?: number
          freeze_available?: number
          freeze_used_at?: string[] | null
          id?: string
          last_completed_at?: string | null
          milestone_floor?: number
          streak_type?: Database["public"]["Enums"]["streak_type"]
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_days?: number
          broken_at?: string | null
          couple_rescue_available?: boolean
          created_at?: string
          current_days?: number
          freeze_available?: number
          freeze_used_at?: string[] | null
          id?: string
          last_completed_at?: string | null
          milestone_floor?: number
          streak_type?: Database["public"]["Enums"]["streak_type"]
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          active: boolean
          archived_at: string | null
          created_at: string
          custom_days: number[] | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          if_trigger: string | null
          recurrence: Database["public"]["Enums"]["recurrence_pattern"] | null
          task_type: Database["public"]["Enums"]["task_type"]
          then_action: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          created_at?: string
          custom_days?: number[] | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          if_trigger?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_pattern"] | null
          task_type?: Database["public"]["Enums"]["task_type"]
          then_action?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          created_at?: string
          custom_days?: number[] | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          if_trigger?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_pattern"] | null
          task_type?: Database["public"]["Enums"]["task_type"]
          then_action?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tier_progress: {
        Row: {
          current_tier: Database["public"]["Enums"]["tier_name"]
          current_tp: number
          prestige_level: number
          tier_history: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          current_tier?: Database["public"]["Enums"]["tier_name"]
          current_tp?: number
          prestige_level?: number
          tier_history?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          current_tier?: Database["public"]["Enums"]["tier_name"]
          current_tp?: number
          prestige_level?: number
          tier_history?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tier_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ai_profiles: {
        Row: {
          communication_preferences: Json | null
          id: string
          key_patterns: string | null
          personality_summary: string | null
          profile_data: Json
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          communication_preferences?: Json | null
          id?: string
          key_patterns?: string | null
          personality_summary?: string | null
          profile_data?: Json
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          communication_preferences?: Json | null
          id?: string
          key_patterns?: string | null
          personality_summary?: string | null
          profile_data?: Json
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          hard_nos: Json
          id: string
          mild_discomforts: Json
          name: string
          preferences: Json
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          hard_nos?: Json
          id: string
          mild_discomforts?: Json
          name: string
          preferences?: Json
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          hard_nos?: Json
          id?: string
          mild_discomforts?: Json
          name?: string
          preferences?: Json
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_user_mood_recent: {
        Row: {
          avg_mood_30d: number | null
          avg_mood_7d: number | null
          trend_7d: number | null
          user_id: string | null
          volatility_30d: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_live_scores: { Args: { p_sprint_id?: string }; Returns: Json }
      check_appreciation_gate: { Args: { p_sprint_id: string }; Returns: Json }
      claim_invite_code: { Args: { p_code: string }; Returns: Json }
      generate_invite_code: { Args: never; Returns: Json }
      get_partner_id: { Args: never; Returns: string }
      get_sprint_history: { Args: { p_limit?: number }; Returns: Json }
      update_streak_for_task: { Args: { p_task_id: string }; Returns: Json }
      update_tier_points: {
        Args: { p_score: number; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      ai_function_type:
        | "sprint_judge"
        | "date_plan"
        | "daily_notification"
        | "weekly_summary"
        | "monthly_review"
        | "mood_response"
        | "nudge"
        | "context_assembly"
        | "task_suggest"
        | "excuse_eval"
      date_category:
        | "restaurant"
        | "activity"
        | "adventure"
        | "home"
        | "surprise"
      difficulty_level: "easy" | "medium" | "hard" | "legendary"
      health_signal_type:
        | "mood_dip"
        | "streak_break"
        | "avoidance"
        | "conflict_pattern"
        | "disengagement"
      intervention_severity:
        | "gentle_nudge"
        | "check_in"
        | "cool_down"
        | "pause_suggestion"
      mood_depth: "quick" | "standard" | "deep"
      notif_category:
        | "morning_briefing"
        | "task_deadline"
        | "partner_activity"
        | "mood_checkin"
        | "sprint_results"
        | "streak_warning"
        | "sprint_start"
        | "nudge"
        | "celebration"
      notif_status:
        | "scheduled"
        | "pending"
        | "processing"
        | "delivered"
        | "failed"
        | "cancelled"
      punishment_intensity: "gentle" | "moderate" | "spicy" | "extreme"
      recurrence_pattern: "daily" | "weekdays" | "weekends" | "custom"
      sprint_status: "upcoming" | "active" | "scoring" | "completed"
      streak_type: "individual" | "couple"
      summary_period_type: "daily" | "weekly" | "monthly"
      task_type: "habit" | "one_time" | "challenge"
      tier_name: "seedling" | "sprout" | "bloom" | "mighty_oak" | "unshakeable"
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
      ai_function_type: [
        "sprint_judge",
        "date_plan",
        "daily_notification",
        "weekly_summary",
        "monthly_review",
        "mood_response",
        "nudge",
        "context_assembly",
        "task_suggest",
        "excuse_eval",
      ],
      date_category: [
        "restaurant",
        "activity",
        "adventure",
        "home",
        "surprise",
      ],
      difficulty_level: ["easy", "medium", "hard", "legendary"],
      health_signal_type: [
        "mood_dip",
        "streak_break",
        "avoidance",
        "conflict_pattern",
        "disengagement",
      ],
      intervention_severity: [
        "gentle_nudge",
        "check_in",
        "cool_down",
        "pause_suggestion",
      ],
      mood_depth: ["quick", "standard", "deep"],
      notif_category: [
        "morning_briefing",
        "task_deadline",
        "partner_activity",
        "mood_checkin",
        "sprint_results",
        "streak_warning",
        "sprint_start",
        "nudge",
        "celebration",
      ],
      notif_status: [
        "scheduled",
        "pending",
        "processing",
        "delivered",
        "failed",
        "cancelled",
      ],
      punishment_intensity: ["gentle", "moderate", "spicy", "extreme"],
      recurrence_pattern: ["daily", "weekdays", "weekends", "custom"],
      sprint_status: ["upcoming", "active", "scoring", "completed"],
      streak_type: ["individual", "couple"],
      summary_period_type: ["daily", "weekly", "monthly"],
      task_type: ["habit", "one_time", "challenge"],
      tier_name: ["seedling", "sprout", "bloom", "mighty_oak", "unshakeable"],
    },
  },
} as const
