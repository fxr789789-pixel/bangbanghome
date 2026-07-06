-- ==========================================
-- BangBang Database Initialization
-- Version: 1.0
-- ==========================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

------------------------------------------------
-- 更新时间函数
------------------------------------------------

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

------------------------------------------------
-- 用户角色
------------------------------------------------

create type public.user_role as enum (
    'user',
    'provider',
    'admin'
);

------------------------------------------------
-- 实名认证状态
------------------------------------------------

create type public.realname_status as enum (
    'pending',
    'verified',
    'rejected'
);

------------------------------------------------
-- 性别
------------------------------------------------

create type public.gender as enum (
    'male',
    'female',
    'unknown'
);

------------------------------------------------
-- 服务资质状态
------------------------------------------------

create type public.certification_status as enum (
    'none',
    'pending',
    'approved',
    'rejected'
);

------------------------------------------------
-- 订单状态
------------------------------------------------

create type public.order_status as enum (
    'draft',
    'published',
    'accepted',
    'arrived',
    'working',
    'completed',
    'cancelled',
    'refunding',
    'refunded'
);

------------------------------------------------
-- 钱包流水
------------------------------------------------

create type public.transaction_type as enum (
    'income',
    'withdraw',
    'commission',
    'promotion_reward',
    'refund',
    'service_fee'
);

------------------------------------------------
-- 提现状态
------------------------------------------------

create type public.withdraw_status as enum (
    'pending',
    'approved',
    'paid',
    'rejected'
);

------------------------------------------------
-- 图片类型
------------------------------------------------

create type public.image_type as enum (
    'avatar',
    'order',
    'certificate'
);