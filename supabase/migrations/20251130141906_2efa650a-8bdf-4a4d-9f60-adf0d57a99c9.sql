-- Fix investment policy to allow admins to invest as well
DROP POLICY IF EXISTS "Users can create investments" ON public.investments;

CREATE POLICY "Users can create investments"
ON public.investments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());