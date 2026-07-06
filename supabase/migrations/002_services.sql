create extension if not exists pgcrypto;

create table if not exists public.service_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    parent_id uuid references public.service_categories(id) on delete set null,
    description text,
    icon_url text,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.provider_profiles (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null unique references public.profiles(id) on delete cascade,
    headline text,
    description text,
    service_radius_km numeric(8,2) default 10,
    city text,
    district text,
    average_rating numeric(2,1) default 0,
    completed_orders integer not null default 0,
    response_rate numeric(5,2) default 0,
    is_verified boolean not null default false,
    status text not null default 'pending' check (status in ('pending','approved','suspended','rejected')),
    verified_at timestamptz,
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.services (
    id uuid primary key default gen_random_uuid(),
    provider_profile_id uuid not null references public.provider_profiles(id) on delete cascade,
    category_id uuid references public.service_categories(id) on delete set null,
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

create table if not exists public.service_certificates (
    id uuid primary key default gen_random_uuid(),
    provider_profile_id uuid not null references public.provider_profiles(id) on delete cascade,
    certificate_type text not null,
    title text not null,
    issuer text,
    certificate_number text,
    issued_at timestamptz,
    expires_at timestamptz,
    document_url text,
    verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','expired')),
    verified_at timestamptz,
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_service_categories_parent_id on public.service_categories(parent_id);
create index if not exists idx_service_categories_active on public.service_categories(is_active, sort_order);
create index if not exists idx_provider_profiles_profile_id on public.provider_profiles(profile_id);
create index if not exists idx_provider_profiles_status on public.provider_profiles(status, is_verified);
create index if not exists idx_services_provider on public.services(provider_profile_id);
create index if not exists idx_services_category on public.services(category_id);
create index if not exists idx_services_status on public.services(status, is_featured);
create index if not exists idx_service_certificates_provider on public.service_certificates(provider_profile_id);
create index if not exists idx_service_certificates_status on public.service_certificates(verification_status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at_service_categories
before update on public.service_categories
for each row execute function public.set_updated_at();

create trigger set_updated_at_provider_profiles
before update on public.provider_profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_services
before update on public.services
for each row execute function public.set_updated_at();

create trigger set_updated_at_service_certificates
before update on public.service_certificates
for each row execute function public.set_updated_at();

alter table public.service_categories enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_certificates enable row level security;

create policy if not exists "service_categories_select_public"
    on public.service_categories for select
    using (deleted_at is null and is_active = true);

create policy if not exists "provider_profiles_select_public"
    on public.provider_profiles for select
    using (deleted_at is null and status = 'approved');

create policy if not exists "services_select_public"
    on public.services for select
    using (deleted_at is null and status = 'published');

create policy if not exists "provider_profiles_manage_own"
    on public.provider_profiles for all
    using (
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

create policy if not exists "services_manage_own"
    on public.services for all
    using (
        exists (
            select 1 from public.provider_profiles pp
            join public.profiles p on p.id = pp.profile_id
            where pp.id = provider_profile_id and p.auth_user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.provider_profiles pp
            join public.profiles p on p.id = pp.profile_id
            where pp.id = provider_profile_id and p.auth_user_id = auth.uid()
        )
    );

create policy if not exists "service_certificates_manage_own"
    on public.service_certificates for all
    using (
        exists (
            select 1 from public.provider_profiles pp
            join public.profiles p on p.id = pp.profile_id
            where pp.id = provider_profile_id and p.auth_user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from public.provider_profiles pp
            join public.profiles p on p.id = pp.profile_id
            where pp.id = provider_profile_id and p.auth_user_id = auth.uid()
        )
    );