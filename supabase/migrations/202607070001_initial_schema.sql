-- BangBang MVP initial Supabase schema.
-- Run in Supabase SQL Editor or as a migration after creating the project.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('user', 'provider', 'admin');
create type public.realname_status as enum ('pending', 'verified', 'rejected');
create type public.gender_type as enum ('female', 'male', 'unknown');
create type public.request_status as enum ('open', 'matched', 'cancelled', 'closed');
create type public.order_status as enum ('pending', 'accepted', 'processing', 'completed', 'cancelled', 'dispute');
create type public.payment_status as enum ('pending', 'paid', 'refunded', 'failed');
create type public.message_type as enum ('text', 'image', 'system');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  nickname text not null default '帮帮用户',
  avatar_url text,
  gender public.gender_type not null default 'unknown',
  city text,
  role public.user_role not null default 'user',
  realname_status public.realname_status not null default 'pending',
  provider_enabled boolean not null default false,
  is_accepting_orders boolean not null default false,
  credit_score integer not null default 100 check (credit_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  contact_name text not null,
  contact_phone text not null,
  city text not null,
  address_line text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.privacy_documents (
  id uuid primary key default gen_random_uuid(),
  document_key text not null,
  title text not null,
  version text not null,
  content text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_key, version)
);

create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid not null references public.privacy_documents(id) on delete restrict,
  version text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet,
  device_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, document_id, version)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  city text not null,
  price_amount numeric(10, 2) not null check (price_amount >= 0),
  price_unit text not null default '次',
  qualification_required boolean not null default false,
  qualification_verified boolean not null default false,
  images text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  images text[] not null default '{}',
  service_address text not null,
  city text not null,
  appointment_at timestamptz,
  budget_amount numeric(10, 2) not null check (budget_amount >= 0),
  preferred_gender public.gender_type,
  qualification_required boolean not null default false,
  status public.request_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  provider_id uuid references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending',
  amount numeric(10, 2) not null check (amount >= 0),
  platform_fee_rate numeric(5, 4) not null default 0.1000 check (platform_fee_rate >= 0 and platform_fee_rate <= 1),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payer_id uuid not null references public.profiles(id) on delete restrict,
  amount numeric(10, 2) not null check (amount >= 0),
  platform_fee_amount numeric(10, 2) not null default 0 check (platform_fee_amount >= 0),
  provider_income_amount numeric(10, 2) not null default 0 check (provider_income_amount >= 0),
  status public.payment_status not null default 'pending',
  provider text,
  provider_trade_no text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  referral_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invitee_id)
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  beneficiary_id uuid not null references public.profiles(id) on delete restrict,
  source_user_id uuid references public.profiles(id) on delete set null,
  amount numeric(10, 2) not null check (amount >= 0),
  rate numeric(5, 4) not null default 0.0100,
  settled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, reviewer_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  message_type public.message_type not null default 'text',
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_city_idx on public.profiles(city);
create index profiles_provider_status_idx on public.profiles(provider_enabled, is_accepting_orders);
create index addresses_user_id_idx on public.addresses(user_id);
create index services_provider_id_idx on public.services(provider_id);
create index services_city_category_idx on public.services(city, category);
create index requests_customer_id_idx on public.requests(customer_id);
create index requests_city_status_idx on public.requests(city, status);
create index orders_customer_id_idx on public.orders(customer_id);
create index orders_provider_id_idx on public.orders(provider_id);
create index orders_status_idx on public.orders(status);
create index payments_order_id_idx on public.payments(order_id);
create index referrals_inviter_id_idx on public.referrals(inviter_id);
create index commissions_beneficiary_id_idx on public.commissions(beneficiary_id);
create index reviews_reviewee_id_idx on public.reviews(reviewee_id);
create index messages_order_id_created_at_idx on public.messages(order_id, created_at);
create index user_consents_user_id_idx on public.user_consents(user_id);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();
create trigger set_privacy_documents_updated_at before update on public.privacy_documents for each row execute function public.set_updated_at();
create trigger set_user_consents_updated_at before update on public.user_consents for each row execute function public.set_updated_at();
create trigger set_services_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger set_requests_updated_at before update on public.requests for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger set_referrals_updated_at before update on public.referrals for each row execute function public.set_updated_at();
create trigger set_commissions_updated_at before update on public.commissions for each row execute function public.set_updated_at();
create trigger set_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create trigger set_messages_updated_at before update on public.messages for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.privacy_documents enable row level security;
alter table public.user_consents enable row level security;
alter table public.services enable row level security;
alter table public.requests enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.referrals enable row level security;
alter table public.commissions enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

create policy "Profiles are readable by authenticated users" on public.profiles
  for select to authenticated using (true);

create policy "Users manage own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users read own addresses" on public.addresses
  for select to authenticated using (auth.uid() = user_id);

create policy "Users manage own addresses" on public.addresses
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Active privacy documents are public" on public.privacy_documents
  for select to anon, authenticated using (active = true);

create policy "Users read own consents" on public.user_consents
  for select to authenticated using (auth.uid() = user_id);

create policy "Users insert own consents" on public.user_consents
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Active services are readable" on public.services
  for select to anon, authenticated using (active = true);

create policy "Providers manage own services" on public.services
  for all to authenticated using (auth.uid() = provider_id) with check (auth.uid() = provider_id);

create policy "Open requests are readable" on public.requests
  for select to authenticated using (status = 'open' or auth.uid() = customer_id);

create policy "Users manage own requests" on public.requests
  for all to authenticated using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

create policy "Order parties can read orders" on public.orders
  for select to authenticated using (auth.uid() = customer_id or auth.uid() = provider_id);

create policy "Customers create orders" on public.orders
  for insert to authenticated with check (auth.uid() = customer_id);

create policy "Order parties can update orders" on public.orders
  for update to authenticated using (auth.uid() = customer_id or auth.uid() = provider_id);

create policy "Users read own payments" on public.payments
  for select to authenticated using (auth.uid() = payer_id);

create policy "Users read related referrals" on public.referrals
  for select to authenticated using (auth.uid() = inviter_id or auth.uid() = invitee_id);

create policy "Users read own commissions" on public.commissions
  for select to authenticated using (auth.uid() = beneficiary_id);

create policy "Order parties read reviews" on public.reviews
  for select to authenticated using (auth.uid() = reviewer_id or auth.uid() = reviewee_id);

create policy "Users create own reviews" on public.reviews
  for insert to authenticated with check (auth.uid() = reviewer_id);

create policy "Order parties read messages" on public.messages
  for select to authenticated using (
    exists (
      select 1 from public.orders
      where orders.id = messages.order_id
      and (orders.customer_id = auth.uid() or orders.provider_id = auth.uid())
    )
  );

create policy "Order parties create messages" on public.messages
  for insert to authenticated with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.orders
      where orders.id = messages.order_id
      and (orders.customer_id = auth.uid() or orders.provider_id = auth.uid())
    )
  );

insert into public.privacy_documents (document_key, title, version, content)
values
  ('terms', '帮帮用户服务协议', '1.0', 'MVP 演示版服务协议内容占位。'),
  ('privacy', '帮帮隐私政策', '1.0', 'MVP 演示版隐私政策内容占位。')
on conflict (document_key, version) do nothing;

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('request-images', 'request-images', false),
  ('chat-images', 'chat-images', false),
  ('qualification-images', 'qualification-images', false)
on conflict (id) do nothing;

grant usage on schema public to anon, authenticated;

grant select on public.privacy_documents to anon;
grant select on public.services to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
