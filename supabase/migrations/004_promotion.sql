create extension if not exists pgcrypto;

create table if not exists public.promotion_users (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null unique references public.profiles(id) on delete cascade,
    referral_code text not null unique,
    invite_link text,
    qr_code_url text,
    total_invites integer not null default 0,
    total_reward_amount numeric(12,2) not null default 0,
    status text not null default 'active' check (status in ('active','inactive','suspended')),
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.promotion_agents (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null unique references public.profiles(id) on delete cascade,
    parent_agent_id uuid references public.promotion_agents(id) on delete set null,
    agent_level text not null default 'basic' check (agent_level in ('basic','city')),
    city text,
    commission_rate numeric(5,4) not null default 0.0100,
    total_team_users integer not null default 0,
    total_team_orders integer not null default 0,
    total_earned_amount numeric(12,2) not null default 0,
    available_balance numeric(12,2) not null default 0,
    status text not null default 'active' check (status in ('active','inactive','suspended')),
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.promotion_rewards (
    id uuid primary key default gen_random_uuid(),
    promotion_user_id uuid not null references public.promotion_users(id) on delete cascade,
    agent_id uuid references public.promotion_agents(id) on delete set null,
    reward_type text not null check (reward_type in ('invite','order','agent_bonus','manual')),
    reward_amount numeric(12,2) not null default 0,
    currency text not null default 'CNY',
    source_order_id uuid references public.orders(id) on delete set null,
    status text not null default 'pending' check (status in ('pending','credited','reversed','cancelled')),
    description text,
    credited_at timestamptz,
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.withdraw_records (
    id uuid primary key default gen_random_uuid(),
    promotion_user_id uuid references public.promotion_users(id) on delete set null,
    agent_id uuid references public.promotion_agents(id) on delete set null,
    withdrawal_type text not null check (withdrawal_type in ('promotion','agent')),
    amount numeric(12,2) not null,
    currency text not null default 'CNY',
    status text not null default 'pending' check (status in ('pending','approved','rejected','completed','failed')),
    bank_account text,
    payment_reference text,
    processed_at timestamptz,
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_promotion_users_profile_id on public.promotion_users(profile_id);
create index if not exists idx_promotion_users_status on public.promotion_users(status);
create index if not exists idx_promotion_agents_profile_id on public.promotion_agents(profile_id);
create index if not exists idx_promotion_agents_parent on public.promotion_agents(parent_agent_id);
create index if not exists idx_promotion_agents_status on public.promotion_agents(status, agent_level);
create index if not exists idx_promotion_rewards_user on public.promotion_rewards(promotion_user_id, status);
create index if not exists idx_promotion_rewards_agent on public.promotion_rewards(agent_id, status);
create index if not exists idx_promotion_rewards_order on public.promotion_rewards(source_order_id);
create index if not exists idx_withdraw_records_user on public.withdraw_records(promotion_user_id, status);
create index if not exists idx_withdraw_records_agent on public.withdraw_records(agent_id, status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at_promotion_users
before update on public.promotion_users
for each row execute function public.set_updated_at();

create trigger set_updated_at_promotion_agents
before update on public.promotion_agents
for each row execute function public.set_updated_at();

create trigger set_updated_at_promotion_rewards
before update on public.promotion_rewards
for each row execute function public.set_updated_at();

create trigger set_updated_at_withdraw_records
before update on public.withdraw_records
for each row execute function public.set_updated_at();

alter table public.promotion_users enable row level security;
alter table public.promotion_agents enable row level security;
alter table public.promotion_rewards enable row level security;
alter table public.withdraw_records enable row level security;

create policy if not exists "promotion_users_manage_own"
    on public.promotion_users for all
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

create policy if not exists "promotion_agents_manage_own"
    on public.promotion_agents for all
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

create policy if not exists "promotion_rewards_manage_own"
    on public.promotion_rewards for all
    using (
        exists (
            select 1 from public.promotion_users pu
            join public.profiles p on p.id = pu.profile_id
            where pu.id = promotion_user_id and p.auth_user_id = auth.uid()
        )
        or exists (
            select 1 from public.promotion_agents pa
            join public.profiles p on p.id = pa.profile_id
            where pa.id = agent_id and p.auth_user_id = auth.uid()
        )
    );

create policy if not exists "withdraw_records_manage_own"
    on public.withdraw_records for all
    using (
        exists (
            select 1 from public.promotion_users pu
            join public.profiles p on p.id = pu.profile_id
            where pu.id = promotion_user_id and p.auth_user_id = auth.uid()
        )
        or exists (
            select 1 from public.promotion_agents pa
            join public.profiles p on p.id = pa.profile_id
            where pa.id = agent_id and p.auth_user_id = auth.uid()
        )
    );