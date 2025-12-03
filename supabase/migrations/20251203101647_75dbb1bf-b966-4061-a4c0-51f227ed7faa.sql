-- Create user wallets table to track cash balance
CREATE TABLE public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet transactions table for history
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'sale')),
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_wallets
CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own wallet"
  ON public.user_wallets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own wallet"
  ON public.user_wallets FOR UPDATE
  USING (user_id = auth.uid());

-- RLS policies for wallet_transactions
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON public.wallet_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at on wallets
CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create wallet automatically when user signs up (add to existing trigger or create function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  
  insert into public.user_wallets (user_id, balance)
  values (new.id, 0);
  
  return new;
end;
$$;