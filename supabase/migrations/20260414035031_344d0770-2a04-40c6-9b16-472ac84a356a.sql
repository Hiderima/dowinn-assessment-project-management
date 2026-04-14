ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS department text;

UPDATE public.tasks t
SET department = p.department
FROM public.profiles p
WHERE t.department IS NULL
  AND p.department IS NOT NULL
  AND (
    (t.assignee IS NOT NULL AND p.employee_number IS NOT NULL AND substring(t.assignee from '\\(([^)]+)\\)$') = p.employee_number)
    OR
    (t.assignee IS NOT NULL AND lower(trim(regexp_replace(t.assignee, '\\s*\\(.*\\)$', ''))) = lower(trim(p.display_name)))
  );