-- Add sort_order to tasks for drag-to-reorder
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Initialize sort_order based on created_at order per user
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) - 1 AS rn
  FROM tasks
)
UPDATE tasks SET sort_order = ranked.rn
FROM ranked
WHERE tasks.id = ranked.id;

-- Update the existing query order to use sort_order
CREATE INDEX IF NOT EXISTS idx_tasks_user_sort ON tasks(user_id, sort_order);
