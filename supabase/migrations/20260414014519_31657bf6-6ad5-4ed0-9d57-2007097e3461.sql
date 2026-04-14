
-- Update tasks SELECT policy
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
CREATE POLICY "Authenticated users can view all tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (true);

-- Update task_changelog SELECT policy
DROP POLICY IF EXISTS "Users can view changelog for their tasks" ON public.task_changelog;
CREATE POLICY "Authenticated users can view all changelogs"
ON public.task_changelog
FOR SELECT
TO authenticated
USING (true);
