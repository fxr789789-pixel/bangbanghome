create extension if not exists pgcrypto;

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

create table if not exists public.platform_income (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null unique references public.orders(id) on delete cascade,
    source_type text not null check (source_type in ('service_fee','platform_fee','refund','commission','adjustment')),
    amount numeric(12,2) not null,
    currency text not null default 'CNY',
    status text not null default 'pending' check (status in ('pending','settled','reversed','cancelled')),
    settlement_at timestamptz,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_wallets_profile_id on public.wallets(profile_id);
create index if not exists idx_wallets_status on public.wallets(status);
create index if not exists idx_wallet_transactions_wallet on public.wallet_transactions(wallet_id, created_at);
create index if not exists idx_wallet_transactions_reference on public.wallet_transactions(reference_type, reference_id);
create index if not exists idx_platform_income_order_id on public.platform_income(order_id);
create index if not exists idx_platform_income_status on public.platform_income(status, settlement_at);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at_wallets
before update on public.wallets
for each row execute function public.set_updated_at();

create trigger set_updated_at_wallet_transactions
before update on public.wallet_transactions
for each row execute function public.set_updated_at();

create trigger set_updated_at_platform_income
before update on public.platform_income
for each row execute function public.set_updated_at();

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.platform_income enable row level security;

create policy if not exists "wallets_manage_own"
    on public.wallets for all
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

create policy if not exists "wallet_transactions_manage_own"
    on public.wallet_transactions for all
    using (
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

create policy if not exists "platform_income_manage_service_role"
    on public.platform_income for all
    using (auth.role() = 'service_role');
