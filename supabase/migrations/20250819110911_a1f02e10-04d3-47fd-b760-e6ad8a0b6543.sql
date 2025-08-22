
-- Create a system_admins table for permanent admin users
CREATE TABLE public.system_admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Insert the first admin (replace with your email)
INSERT INTO public.system_admins (email, created_by) 
VALUES ('admin@example.com', NULL);

-- Enable RLS
ALTER TABLE public.system_admins ENABLE ROW LEVEL SECURITY;

-- Only system admins can view the system_admins table
CREATE POLICY "Only system admins can view system_admins" 
  ON public.system_admins 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.system_admins sa 
      JOIN auth.users u ON u.email = sa.email 
      WHERE u.id = auth.uid()
    )
  );

-- Only system admins can insert new system admins
CREATE POLICY "Only system admins can add new admins" 
  ON public.system_admins 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.system_admins sa 
      JOIN auth.users u ON u.email = sa.email 
      WHERE u.id = auth.uid()
    )
  );

-- Update the form_submissions table to allow anonymous submissions
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.form_submissions;
CREATE POLICY "Anyone can insert submissions" 
  ON public.form_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Update admin access policy for form_submissions
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.form_submissions;
CREATE POLICY "System admins can view all submissions" 
  ON public.form_submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.system_admins sa 
      JOIN auth.users u ON u.email = sa.email 
      WHERE u.id = auth.uid()
    )
  );
