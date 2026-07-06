-- BangBang Supabase PostgreSQL schema v1.0
-- Production-ready foundation for marketplace, wallets, partners, orders, messaging, and AI operations.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  phone text unique,
  email text unique,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer','provider','partner','admin')),
  status text not null default 'active' check (status in ('pending','active','suspended','deleted')),
  city text,
  district text,
  bio text,
  is_verified boolean not null default false,
  last_login_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  full_address text not null,
  city text not null,
  district text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_default boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  description text,
  icon_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text,
  price_min numeric(12,2) not null default 0,
  price_max numeric(12,2) not null default 0,
  currency text not null default 'CNY',
  service_area text,
  availability text,
  status text not null default 'draft' check (status in ('draft','published','paused','archived')),
  is_featured boolean not null default false,
  view_count integer not null default 0,
  order_count integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_profile_id uuid not null references public.profiles(id) on delete restrict,
  provider_profile_id uuid references public.profiles(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  title text not null,
  description text,
  scheduled_at timestamptz,
  status text not null default 'pending' check (status in ('pending','accepted','in_progress','completed','cancelled','disputed','refunded')),
  price_amount numeric(12,2) not null default 0,
  service_fee_amount numeric(12,2) not null default 0,
  platform_fee_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'CNY',
  cancellation_reason text,
  completed_at timestamptz,
  cancelled_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_images (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  currency text not null default 'CNY',
  balance numeric(12,2) not null default 0,
  available_balance numeric(12,2) not null default 0,
  pending_balance numeric(12,2) not null default 0,
  status text not null default 'active' check (status in ('active','frozen','closed')),
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('deposit','withdrawal','payment','refund','commission','adjustment')),
  direction text not null check (direction in ('inbound','outbound')),
  amount numeric(12,2) not null,
  balance_after numeric(12,2) not null,
  reference_type text,
  reference_id uuid,
  description text,
  status text not null default 'succeeded' check (status in ('pending','succeeded','failed','reversed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  cert_type text not null,
  title text not null,
  issuer text,
  certificate_number text,
  issued_at timestamptz,
  expires_at timestamptz,
  document_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  is_verified boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  parent_partner_id uuid references public.partners(id) on delete set null,
  partner_code text not null unique,
  partner_level text not null default 'basic' check (partner_level in ('basic','agent','city_agent')),
  status text not null default 'active' check (status in ('active','inactive','suspended','closed')),
  commission_rate numeric(5,4) not null default 0.0100,
  agent_rate numeric(5,4) not null default 0.0100,
  total_referred_users integer not null default 0,
  total_commission_amount numeric(12,2) not null default 0,
  total_withdrawn_amount numeric(12,2) not null default 0,
  available_balance numeric(12,2) not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_profile_id uuid not null references public.profiles(id) on delete cascade,
  invited_profile_id uuid not null unique references public.profiles(id) on delete cascade,
  referral_code text not null,
  referral_source text not null default 'invite' check (referral_source in ('invite','qrcode','link','campaign')),
  status text not null default 'pending' check (status in ('pending','converted','expired','revoked')),
  first_order_id uuid references public.orders(id) on delete set null,
  first_order_at timestamptz,
  reward_status text not null default 'pending' check (reward_status in ('pending','granted','reversed')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete restrict,
  referral_id uuid references public.referrals(id) on delete set null,
  commission_type text not null default 'direct' check (commission_type in ('direct','agent')),
  base_amount numeric(12,2) not null default 0,
  commission_rate numeric(5,4) not null default 0.0100,
  commission_amount numeric(12,2) not null default 0,
  currency text not null default 'CNY',
  status text not null default 'pending' check (status in ('pending','settled','reversed','cancelled')),
  settlement_at timestamptz,
  reversed_at timestamptz,
  note text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  payer_profile_id uuid not null references public.profiles(id) on delete restrict,
  payment_method text not null check (payment_method in ('wallet','alipay','wechat','bank_card','cash')),
  payment_provider text,
  amount numeric(12,2) not null,
  currency text not null default 'CNY',
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','partially_refunded','cancelled')),
  transaction_id text unique,
  paid_at timestamptz,
  refunded_at timestamptz,
  refund_amount numeric(12,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_profile_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending','published','hidden','removed')),
  is_anonymous boolean not null default false,
  helpful_count integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  receiver_profile_id uuid not null references public.profiles(id) on delete cascade,
  message_type text not null default 'text' check (message_type in ('text','image','file','system')),
  content text,
  attachment_url text,
  status text not null default 'sent' check (status in ('sent','delivered','read','failed')),
  is_read boolean not null default false,
  read_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  notification_type text not null check (notification_type in ('order_update','payment','commission','partner','system','review')),
  title text not null,
  body text,
  is_read boolean not null default false,
  read_at timestamptz,
  status text not null default 'pending' check (status in ('pending','sent','delivered','failed')),
  action_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_configs (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  description text,
  category text not null default 'general',
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role_status on public.profiles(role, status);
create index if not exists idx_profiles_city on public.profiles(city);
create index if not exists idx_profiles_deleted_at on public.profiles(deleted_at);
create index if not exists idx_addresses_profile_id on public.addresses(profile_id);
create index if not exists idx_addresses_default on public.addresses(is_default);
create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_categories_active on public.categories(is_active, sort_order);
create index if not exists idx_services_provider on public.services(provider_profile_id);
create index if not exists idx_services_category on public.services(category_id);
create index if not exists idx_services_status on public.services(status, is_featured);
create index if not exists idx_orders_customer on public.orders(customer_profile_id);
create index if not exists idx_orders_provider on public.orders(provider_profile_id);
create index if not exists idx_orders_status_scheduled on public.orders(status, scheduled_at);
create index if not exists idx_orders_category on public.orders(category_id);
create index if not exists idx_order_images_order_id on public.order_images(order_id);
create index if not exists idx_wallets_status on public.wallets(status);
create index if not exists idx_wallet_transactions_wallet on public.wallet_transactions(wallet_id, created_at);
create index if not exists idx_wallet_transactions_reference on public.wallet_transactions(reference_type, reference_id);
create index if not exists idx_provider_certifications_profile on public.provider_certifications(profile_id);
create index if not exists idx_provider_certifications_status on public.provider_certifications(status);
create index if not exists idx_partners_status on public.partners(status, partner_level);
create index if not exists idx_partners_parent on public.partners(parent_partner_id);
create index if not exists idx_referrals_inviter on public.referrals(inviter_profile_id);
create index if not exists idx_referrals_status on public.referrals(status);
create index if not exists idx_commissions_partner_status on public.commissions(partner_id, status);
create index if not exists idx_commissions_settlement on public.commissions(settlement_at);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_reviews_target on public.reviews(target_profile_id, rating);
create index if not exists idx_reviews_status on public.reviews(status);
create index if not exists idx_messages_order_created on public.messages(order_id, created_at);
create index if not exists idx_messages_participants on public.messages(sender_profile_id, receiver_profile_id);
create index if not exists idx_messages_unread on public.messages(is_read);
create index if not exists idx_notifications_recipient on public.notifications(recipient_profile_id, is_read, created_at);
create index if not exists idx_notifications_status on public.notifications(status);
create index if not exists idx_system_configs_category on public.system_configs(category, is_active);

create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_addresses
before update on public.addresses
for each row execute function public.set_updated_at();

create trigger set_updated_at_categories
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_updated_at_services
before update on public.services
for each row execute function public.set_updated_at();

create trigger set_updated_at_orders
before update on public.orders
for each row execute function public.set_updated_at();

create trigger set_updated_at_order_images
before update on public.order_images
for each row execute function public.set_updated_at();

create trigger set_updated_at_wallets
before update on public.wallets
for each row execute function public.set_updated_at();

create trigger set_updated_at_wallet_transactions
before update on public.wallet_transactions
for each row execute function public.set_updated_at();

create trigger set_updated_at_provider_certifications
before update on public.provider_certifications
for each row execute function public.set_updated_at();

create trigger set_updated_at_partners
before update on public.partners
for each row execute function public.set_updated_at();

create trigger set_updated_at_referrals
before update on public.referrals
for each row execute function public.set_updated_at();

create trigger set_updated_at_commissions
before update on public.commissions
for each row execute function public.set_updated_at();

create trigger set_updated_at_payments
before update on public.payments
for each row execute function public.set_updated_at();

create trigger set_updated_at_reviews
before update on public.reviews
for each row execute function public.set_updated_at();

create trigger set_updated_at_messages
before update on public.messages
for each row execute function public.set_updated_at();

create trigger set_updated_at_notifications
before update on public.notifications
for each row execute function public.set_updated_at();

create trigger set_updated_at_system_configs
before update on public.system_configs
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.order_images enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.provider_certifications enable row level security;
alter table public.partners enable row level security;
alter table public.referrals enable row level security;
alter table public.commissions enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.system_configs enable row level security;

create policy if not exists "profiles_select_own" on public.profiles
for select using (auth.uid() = auth_user_id);

create policy if not exists "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = auth_user_id);

create policy if not exists "profiles_update_own" on public.profiles
for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy if not exists "addresses_manage_own" on public.addresses
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "services_select_public" on public.services
for select using (deleted_at is null and status = 'published');

create policy if not exists "services_manage_own" on public.services
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = provider_profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = provider_profile_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "orders_manage_participant" on public.orders
for all using (
  exists (
    select 1 from public.profiles c
    where c.id = customer_profile_id and c.auth_user_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles p
    where p.id = provider_profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles c
    where c.id = customer_profile_id and c.auth_user_id = auth.uid()
  )
);

create policy if not exists "wallets_manage_own" on public.wallets
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "wallet_transactions_manage_own" on public.wallet_transactions
for all using (
  exists (
    select 1
    from public.wallets w
    join public.profiles p on p.id = w.profile_id
    where w.id = wallet_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.wallets w
    join public.profiles p on p.id = w.profile_id
    where w.id = wallet_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "partners_manage_own" on public.partners
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "payments_manage_own" on public.payments
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = payer_profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = payer_profile_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "reviews_manage_own" on public.reviews
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = reviewer_profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = reviewer_profile_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "messages_manage_participant" on public.messages
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = sender_profile_id and p.auth_user_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles p
    where p.id = receiver_profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = sender_profile_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "notifications_manage_own" on public.notifications
for all using (
  exists (
    select 1 from public.profiles p
    where p.id = recipient_profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = recipient_profile_id and p.auth_user_id = auth.uid()
  )
);

create policy if not exists "system_configs_read_authenticated" on public.system_configs
for select using (auth.role() = 'authenticated');

create policy if not exists "system_configs_manage_service_role" on public.system_configs
for all using (auth.role() = 'service_role');
