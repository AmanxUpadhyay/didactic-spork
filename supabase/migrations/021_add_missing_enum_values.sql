-- Migration 021: Add missing enum values for Phase 5/6/7 function types
-- This migration ONLY adds enum values.
-- DDL/DML that USES the new values must be in migration 022 or later
-- (PostgreSQL restriction: new enum values cannot be used in same transaction).

-- ============================================================
-- ai_function_type: add Phase 5 cron types
-- ============================================================
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'streak_warning';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'schedule_daily';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'deadline_escalation';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'point_bank_decay';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'fresh_start_calc';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'mystery_box_roll';

-- ============================================================
-- ai_function_type: add Phase 6 health monitor types
-- ============================================================
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'health_check';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'health_check_response';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'activate_grace';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'switch_sprint_mode';
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'positive_injection';

-- ============================================================
-- ai_function_type: add Phase 7 gap-fill types
-- ============================================================
ALTER TYPE ai_function_type ADD VALUE IF NOT EXISTS 'friday_teaser';

-- ============================================================
-- notif_category: add missing categories used in Edge Functions
-- ============================================================
ALTER TYPE notif_category ADD VALUE IF NOT EXISTS 'health_check';
ALTER TYPE notif_category ADD VALUE IF NOT EXISTS 'friday_teaser';
