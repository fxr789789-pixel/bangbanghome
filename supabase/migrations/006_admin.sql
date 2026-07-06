create extension if not exists pgcrypto;

create table if not exists public.platform_settings (
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

create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_profile_id uuid references public.profiles(id) on delete set null,
    action text not null,
    entity_type text,
    entity_id uuid,
    details jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    body text not null,
    announcement_type text not null default 'info' check (announcement_type in ('info','warning','maintenance','promo')),
    audience text not null default 'all' check (audience in ('all','customers','providers','partners','admins')),
    is_published boolean not null default false,
    published_at timestamptz,
    expires_at timestamptz,
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_platform_settings_category on public.platform_settings(category, is_active);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_profile_id, created_at);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_announcements_published on public.announcements(is_published, published_at, expires_at);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at_platform_settings
before update on public.platform_settings
for each row execute function public.set_updated_at();

create trigger set_updated_at_audit_logs
before update on public.audit_logs
for each row execute function public.set_updated_at();

create trigger set_updated_at_announcements
before update on public.announcements
for each row execute function public.set_updated_at();

alter table public.platform_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.announcements enable row level security;

create policy if not exists "platform_settings_read_authenticated"
    on public.platform_settings for select
    using (auth.role() = 'authenticated');

create policy if not exists "platform_settings_manage_service_role"
    on public.platform_settings for all
    using (auth.role() = 'service_role');

create policy if not exists "audit_logs_manage_service_role"
    on public.audit_logs for all
    using (auth.role() = 'service_role');

create policy if not exists "announcements_read_public"
    on public.announcements for select
    using (deleted_at is null and is_published = true);

create policy if not exists "announcements_manage_service_role"
    on public.announcements for all
    using (auth.role() = 'service_role');