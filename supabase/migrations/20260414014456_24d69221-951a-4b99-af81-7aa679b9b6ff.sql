
-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;

-- Allow all authenticated users to view all projects
CREATE POLICY "Authenticated users can view all projects"
ON public.projects
FOR SELECT
TO authenticated
USING (true);
