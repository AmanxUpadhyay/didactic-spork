-- Replace own-only tasks SELECT policy with own-or-partner
-- Partners need to see each other's tasks for the partner habit feed

DROP POLICY IF EXISTS "tasks_select_own" ON tasks;

CREATE POLICY "tasks_select_own_or_partner" ON tasks
  FOR SELECT USING (user_id = auth.uid() OR is_partner(user_id));
