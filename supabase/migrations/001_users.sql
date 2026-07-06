create extension if not exists pgcrypto;

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

create table if not exists public.identities (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null unique references public.profiles(id) on delete cascade,
    identity_type text not null check (identity_type in ('national_id','passport','driver_license','business_license')),
    document_number text,
    document_front_url text,
    document_back_url text,
    selfie_url text,
    verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','expired')),
    verified_at timestamptz,
    rejected_reason text,
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

create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_profiles_role_status on public.profiles(role, status);
create index if not exists idx_profiles_city on public.profiles(city);
create index if not exists idx_identities_profile_id on public.identities(profile_id);
create index if not exists idx_identities_status on public.identities(verification_status);
create index if not exists idx_addresses_profile_id on public.addresses(profile_id);
create index if not exists idx_addresses_default on public.addresses(is_default);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_identities
before update on public.identities
for each row execute function public.set_updated_at();

create trigger set_updated_at_addresses
before update on public.addresses
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.identities enable row level security;
alter table public.addresses enable row level security;

create policy if not exists "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = auth_user_id);

create policy if not exists "profiles_insert_own"
    on public.profiles for insert
    with check (auth.uid() = auth_user_id);

create policy if not exists "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = auth_user_id)
    with check (auth.uid() = auth_user_id);

create policy if not exists "identities_select_own"
    on public.identities for select
    using (
        exists (
            select 1 from public.profiles p
            where p.id = profile_id and p.auth_user_id = auth.uid()
        )
    );

create policy if not exists "identities_manage_own"
    on public.identities for all
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

create policy if not exists "addresses_manage_own"
    on public.addresses for all
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