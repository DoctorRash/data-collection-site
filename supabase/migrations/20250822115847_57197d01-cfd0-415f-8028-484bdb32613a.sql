-- Fix infinite recursion in system_admins RLS policies
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Only system admins can view system_admins" ON public.system_admins;
DROP POLICY IF EXISTS "Only system admins can add new admins" ON public.system_admins;

-- Create safer policies that don't cause recursion
-- For viewing: Use the secure function instead of joining with the same table
CREATE POLICY "System admins can view system_admins via function" 
ON public.system_admins 
FOR SELECT 
USING (public.is_admin_email((auth.jwt() ->> 'email')::text));

-- For inserting: Use the secure function instead of joining with the same table  
CREATE POLICY "System admins can add new admins via function" 
ON public.system_admins 
FOR INSERT 
WITH CHECK (public.is_admin_email((auth.jwt() ->> 'email')::text));