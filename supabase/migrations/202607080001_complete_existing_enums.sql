-- Compatibility migration for projects that already have the first profile/enums draft.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'gender_type') then
    create type public.gender_type as enum ('female', 'male', 'unknown');
  end if;

  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'request_status') then
    create type public.request_status as enum ('open', 'matched', 'cancelled', 'closed');
  end if;

  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'payment_status') then
    create type public.payment_status as enum ('pending', 'paid', 'refunded', 'failed');
  end if;

  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'message_type') then
    create type public.message_type as enum ('text', 'image', 'system');
  end if;
end;
$$;

alter type public.order_status add value if not exists 'pending';
alter type public.order_status add value if not exists 'processing';
alter type public.order_status add value if not exists 'dispute';

alter table public.profiles add column if not exists provider_enabled boolean not null default false;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
