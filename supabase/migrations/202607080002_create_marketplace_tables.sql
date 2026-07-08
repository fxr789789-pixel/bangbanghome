-- Complete BangBang marketplace tables on top of the existing project draft.

create table if not exists public.addresses (
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

create table if not exists public.privacy_documents (
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

create table if not exists public.user_consents (
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

create table if not exists public.services (
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

create table if not exists public.requests (
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

create table if not exists public.orders (
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

create table if not exists public.payments (
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

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  referral_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invitee_id)
);

create table if not exists public.commissions (
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

create table if not exists public.reviews (
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

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  message_type public.message_type not null default 'text',
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_city_idx on public.profiles(city);
create index if not exists profiles_provider_status_idx on public.profiles(provider_enabled, is_accepting_orders);
create index if not exists addresses_user_id_idx on public.addresses(user_id);
create index if not exists services_provider_id_idx on public.services(provider_id);
create index if not exists services_city_category_idx on public.services(city, category);
create index if not exists requests_customer_id_idx on public.requests(customer_id);
create index if not exists requests_city_status_idx on public.requests(city, status);
create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_provider_id_idx on public.orders(provider_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists payments_order_id_idx on public.payments(order_id);
create index if not exists referrals_inviter_id_idx on public.referrals(inviter_id);
create index if not exists commissions_beneficiary_id_idx on public.commissions(beneficiary_id);
create index if not exists reviews_reviewee_id_idx on public.reviews(reviewee_id);
create index if not exists messages_order_id_created_at_idx on public.messages(order_id, created_at);
create index if not exists user_consents_user_id_idx on public.user_consents(user_id);

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

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_addresses_updated_at') then
    create trigger set_addresses_updated_at before update on public.addresses for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_privacy_documents_updated_at') then
    create trigger set_privacy_documents_updated_at before update on public.privacy_documents for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_user_consents_updated_at') then
    create trigger set_user_consents_updated_at before update on public.user_consents for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_services_updated_at') then
    create trigger set_services_updated_at before update on public.services for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_requests_updated_at') then
    create trigger set_requests_updated_at before update on public.requests for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_orders_updated_at') then
    create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_payments_updated_at') then
    create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_referrals_updated_at') then
    create trigger set_referrals_updated_at before update on public.referrals for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_commissions_updated_at') then
    create trigger set_commissions_updated_at before update on public.commissions for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_reviews_updated_at') then
    create trigger set_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'set_messages_updated_at') then
    create trigger set_messages_updated_at before update on public.messages for each row execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'privacy_documents' and policyname = 'Active privacy documents are public') then
    create policy "Active privacy documents are public" on public.privacy_documents
      for select to anon, authenticated using (active = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_consents' and policyname = 'Users read own consents') then
    create policy "Users read own consents" on public.user_consents
      for select to authenticated using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_consents' and policyname = 'Users insert own consents') then
    create policy "Users insert own consents" on public.user_consents
      for insert to authenticated with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'addresses' and policyname = 'Users read own addresses') then
    create policy "Users read own addresses" on public.addresses
      for select to authenticated using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'addresses' and policyname = 'Users manage own addresses') then
    create policy "Users manage own addresses" on public.addresses
      for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'Active services are readable') then
    create policy "Active services are readable" on public.services
      for select to anon, authenticated using (active = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'Providers manage own services') then
    create policy "Providers manage own services" on public.services
      for all to authenticated using (auth.uid() = provider_id) with check (auth.uid() = provider_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'requests' and policyname = 'Open requests are readable') then
    create policy "Open requests are readable" on public.requests
      for select to authenticated using (status = 'open' or auth.uid() = customer_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'requests' and policyname = 'Users manage own requests') then
    create policy "Users manage own requests" on public.requests
      for all to authenticated using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'Order parties can read orders') then
    create policy "Order parties can read orders" on public.orders
      for select to authenticated using (auth.uid() = customer_id or auth.uid() = provider_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'Customers create orders') then
    create policy "Customers create orders" on public.orders
      for insert to authenticated with check (auth.uid() = customer_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'Order parties can update orders') then
    create policy "Order parties can update orders" on public.orders
      for update to authenticated using (auth.uid() = customer_id or auth.uid() = provider_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'Users read own payments') then
    create policy "Users read own payments" on public.payments
      for select to authenticated using (auth.uid() = payer_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'referrals' and policyname = 'Users read related referrals') then
    create policy "Users read related referrals" on public.referrals
      for select to authenticated using (auth.uid() = inviter_id or auth.uid() = invitee_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'commissions' and policyname = 'Users read own commissions') then
    create policy "Users read own commissions" on public.commissions
      for select to authenticated using (auth.uid() = beneficiary_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'Order parties read reviews') then
    create policy "Order parties read reviews" on public.reviews
      for select to authenticated using (auth.uid() = reviewer_id or auth.uid() = reviewee_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'Users create own reviews') then
    create policy "Users create own reviews" on public.reviews
      for insert to authenticated with check (auth.uid() = reviewer_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'Order parties read messages') then
    create policy "Order parties read messages" on public.messages
      for select to authenticated using (
        exists (
          select 1 from public.orders
          where orders.id = messages.order_id
          and (orders.customer_id = auth.uid() or orders.provider_id = auth.uid())
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'Order parties create messages') then
    create policy "Order parties create messages" on public.messages
      for insert to authenticated with check (
        auth.uid() = sender_id
        and exists (
          select 1 from public.orders
          where orders.id = messages.order_id
          and (orders.customer_id = auth.uid() or orders.provider_id = auth.uid())
        )
      );
  end if;
end;
$$;

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
