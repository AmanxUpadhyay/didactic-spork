-- Add relative performance index column to sprints
-- RPI = scoreA - scoreB (from user_a perspective)

ALTER TABLE sprints ADD COLUMN IF NOT EXISTS relative_performance_index real;
