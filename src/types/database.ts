export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      sprints: {
        Row: {
          appreciation_required: boolean
          created_at: string
          id: string
          score_a: number | null
          score_b: number | null
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
          score_a?: number | null
          score_b?: number | null
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
          score_a?: number | null
          score_b?: number | null
          status?: Database["public"]["Enums"]["sprint_status"]
          tier_points_earned?: number | null
          updated_at?: string
          week_start?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      streaks: {
        Row: {
          best_days: number
          broken_at: string | null
          couple_rescue_available: boolean
          created_at: string
          current_days: number
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
          id?: string
          last_completed_at?: string | null
          milestone_floor?: number
          streak_type?: Database["public"]["Enums"]["streak_type"]
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
    }
    Functions: {
      get_partner_id: { Args: Record<string, never>; Returns: string }
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
      date_category: "restaurant" | "activity" | "adventure" | "home" | "surprise"
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
