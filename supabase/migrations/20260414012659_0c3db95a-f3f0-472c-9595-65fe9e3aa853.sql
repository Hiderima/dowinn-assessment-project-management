
ALTER TABLE public.profiles 
ADD COLUMN employee_number text UNIQUE,
ADD COLUMN department text,
ADD COLUMN position text;
