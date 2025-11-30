-- Create enum for user roles
create type public.app_role as enum ('admin', 'user');

-- Create enum for risk levels
create type public.risk_level as enum ('low', 'moderate', 'high', 'very_high');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now() not null,
  unique (user_id, role)
);

-- Create function to check user role
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create currencies table
create table public.currencies (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  symbol text not null,
  created_at timestamp with time zone default now() not null
);

-- Create financial_instruments table
create table public.financial_instruments (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  type text not null,
  created_at timestamp with time zone default now() not null
);

-- Create funds table
create table public.funds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  investment_strategy text not null,
  risk_level risk_level not null,
  target_market text not null,
  share_price decimal(15, 2) not null default 100.00,
  is_active boolean default true not null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create fund_currencies junction table
create table public.fund_currencies (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid references public.funds(id) on delete cascade not null,
  currency_id uuid references public.currencies(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique (fund_id, currency_id)
);

-- Create fund_instruments junction table
create table public.fund_instruments (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid references public.funds(id) on delete cascade not null,
  instrument_id uuid references public.financial_instruments(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique (fund_id, instrument_id)
);

-- Create investments table
create table public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  fund_id uuid references public.funds(id) on delete cascade not null,
  shares_quantity decimal(15, 4) not null,
  purchase_price decimal(15, 2) not null,
  total_amount decimal(15, 2) not null,
  purchase_date timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.currencies enable row level security;
alter table public.financial_instruments enable row level security;
alter table public.funds enable row level security;
alter table public.fund_currencies enable row level security;
alter table public.fund_instruments enable row level security;
alter table public.investments enable row level security;

-- RLS Policies for profiles
create policy "Users can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- RLS Policies for user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for currencies (read-only for all authenticated users)
create policy "Anyone can view currencies"
  on public.currencies for select
  to authenticated
  using (true);

-- RLS Policies for financial_instruments (read-only for all authenticated users)
create policy "Anyone can view instruments"
  on public.financial_instruments for select
  to authenticated
  using (true);

-- RLS Policies for funds
create policy "Anyone can view active funds"
  on public.funds for select
  to authenticated
  using (is_active = true or public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert funds"
  on public.funds for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update funds"
  on public.funds for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete funds"
  on public.funds for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for fund_currencies
create policy "Anyone can view fund currencies"
  on public.fund_currencies for select
  to authenticated
  using (true);

create policy "Admins can manage fund currencies"
  on public.fund_currencies for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for fund_instruments
create policy "Anyone can view fund instruments"
  on public.fund_instruments for select
  to authenticated
  using (true);

create policy "Admins can manage fund instruments"
  on public.fund_instruments for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for investments
create policy "Users can view own investments"
  on public.investments for select
  to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Users can create investments"
  on public.investments for insert
  to authenticated
  with check (user_id = auth.uid() and not public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_funds_updated_at
  before update on public.funds
  for each row
  execute function public.handle_updated_at();

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Insert default currencies
insert into public.currencies (code, name, symbol) values
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('JPY', 'Japanese Yen', '¥'),
  ('CHF', 'Swiss Franc', 'CHF'),
  ('CAD', 'Canadian Dollar', 'C$'),
  ('AUD', 'Australian Dollar', 'A$');

-- Insert default financial instruments
insert into public.financial_instruments (code, name, type) values
  ('STOCK', 'Stocks', 'Equity'),
  ('BOND', 'Bonds', 'Fixed Income'),
  ('ETF', 'Exchange-Traded Funds', 'Fund'),
  ('REIT', 'Real Estate Investment Trusts', 'Real Estate'),
  ('COMMODITY', 'Commodities', 'Commodity'),
  ('FOREX', 'Foreign Exchange', 'Currency'),
  ('CRYPTO', 'Cryptocurrencies', 'Digital Asset'),
  ('DERIVATIVE', 'Derivatives', 'Derivative'),
  ('MUTUAL_FUND', 'Mutual Funds', 'Fund');
