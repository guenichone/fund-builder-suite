-- Allow users to delete their own roles so they can remove admin/user roles
CREATE POLICY "Users can delete their own roles"
ON public.user_roles
FOR DELETE
USING (user_id = auth.uid());