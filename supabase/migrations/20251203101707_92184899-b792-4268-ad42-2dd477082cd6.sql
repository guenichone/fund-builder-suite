-- Add UPDATE and DELETE policies for investments (needed for selling shares)
CREATE POLICY "Users can update own investments"
  ON public.investments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own investments"
  ON public.investments FOR DELETE
  USING (user_id = auth.uid());