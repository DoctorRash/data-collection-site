-- Create a public function to check if email is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin_email(check_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.system_admins 
    WHERE email = check_email
  );
$$;