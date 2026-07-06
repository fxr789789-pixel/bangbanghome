-- ==========================================
-- BangBang Database
-- Migration: 002_profiles.sql
-- ==========================================

create table if not exists public.profiles (

    -- 与 Supabase Auth 用户绑定
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    -- 基础资料
    phone text unique,
    nickname text not null default '新用户',
    avatar_url text,

    gender public.gender
        default 'unknown',

    birth_date date,

    bio text,

    city text,

    -- 推广
    referral_code text unique not null,

    referrer_id uuid
        references public.profiles(id)
        on delete set null,

    -- 权限
    role public.user_role
        default 'user',

    -- 实名认证
    realname_status public.realname_status
        default 'pending',

    verified_at timestamptz,

    -- 服务人员
    provider_verified boolean default false,

    is_accepting_orders boolean default true,

    -- 权限授权
    location_permission boolean default false,

    microphone_permission boolean default false,

    -- 信用分
    credit_score integer
        default 100,

    -- 状态
    status text
        default 'active',

    -- 登录信息
    last_login_at timestamptz,

    last_active_at timestamptz,

    -- 国际化
    language text
        default 'zh-CN',

    timezone text
        default 'Asia/Shanghai',

    -- 测试账号
    is_test_account boolean
        default false,

    -- 软删除
    deleted_at timestamptz,

    created_at timestamptz
        default now(),

    updated_at timestamptz
        default now()

);

------------------------------------------------
-- 索引
------------------------------------------------

create index if not exists idx_profiles_phone
on public.profiles(phone);

create index if not exists idx_profiles_referral_code
on public.profiles(referral_code);

create index if not exists idx_profiles_referrer_id
on public.profiles(referrer_id);

create index if not exists idx_profiles_role
on public.profiles(role);

create index if not exists idx_profiles_status
on public.profiles(status);

create index if not exists idx_profiles_provider_verified
on public.profiles(provider_verified);

create index if not exists idx_profiles_accepting
on public.profiles(is_accepting_orders);

create index if not exists idx_profiles_city
on public.profiles(city);

------------------------------------------------
-- 更新时间触发器
------------------------------------------------

drop trigger if exists trg_profiles_updated_at
on public.profiles;

create trigger trg_profiles_updated_at

before update
on public.profiles

for each row

execute function public.update_updated_at_column();