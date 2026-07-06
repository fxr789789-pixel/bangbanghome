create extension if not exists pgcrypto;

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    customer_profile_id uuid not null references public.profiles(id) on delete restrict,
    provider_profile_id uuid references public.profiles(id) on delete restrict,
    service_id uuid references public.services(id) on delete set null,
    category_id uuid references public.service_categories(id) on delete set null,
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

create table if not exists public.order_logs (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    actor_profile_id uuid references public.profiles(id) on delete set null,
    action text not null,
    details jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_orders_customer on public.orders(customer_profile_id);
create index if not exists idx_orders_provider on public.orders(provider_profile_id);
create index if not exists idx_orders_status_scheduled on public.orders(status, scheduled_at);
create index if not exists idx_orders_category on public.orders(category_id);
create index if not exists idx_order_images_order_id on public.order_images(order_id);
create index if not exists idx_order_logs_order_id on public.order_logs(order_id, created_at);
create index if not exists idx_order_logs_actor on public.order_logs(actor_profile_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at_orders
before update on public.orders
for each row execute function public.set_updated_at();

create trigger set_updated_at_order_images
before update on public.order_images
for each row execute function public.set_updated_at();

create trigger set_updated_at_order_logs
before update on public.order_logs
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_images enable row level security;
alter table public.order_logs enable row level security;

create policy if not exists "orders_manage_participant"
    on public.orders for all
    using (
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

create policy if not exists "order_images_manage_participant"
    on public.order_images for all
    using (
        exists (
            select 1 from public.orders o
            join public.profiles c on c.id = o.customer_profile_id
            where o.id = order_id and c.auth_user_id = auth.uid()
        )
        or exists (
            select 1 from public.orders o
            join public.profiles p on p.id = o.provider_profile_id
            where o.id = order_id and p.auth_user_id = auth.uid()
        )
    );

create policy if not exists "order_logs_manage_participant"
    on public.order_logs for all
    using (
        exists (
            select 1 from public.orders o
            join public.profiles c on c.id = o.customer_profile_id
            where o.id = order_id and c.auth_user_id = auth.uid()
        )
        or exists (
            select 1 from public.orders o
            join public.profiles p on p.id = o.provider_profile_id
            where o.id = order_id and p.auth_user_id = auth.uid()
        )
    );