-- Fix the form_submissions RLS policy that's causing permission denied errors
-- Drop the existing policy that tries to access auth.users
DROP POLICY IF EXISTS "System admins can view all submissions" ON public.form_submissions;

-- Create a new policy using our secure function instead
CREATE POLICY "System admins can view all submissions via function" 
ON public.form_submissions 
FOR SELECT 
USING (public.is_admin_email((auth.jwt() ->> 'email')::text));