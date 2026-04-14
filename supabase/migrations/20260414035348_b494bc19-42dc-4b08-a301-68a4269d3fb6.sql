UPDATE public.tasks t
SET department = p.name
FROM public.projects p
WHERE t.project_id = p.id
  AND t.department IS NULL
  AND p.name IN ('Management', 'Administration', 'Finance', 'Marketing/Sales', 'Operations', 'R&D');