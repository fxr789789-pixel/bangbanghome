# 帮帮 MVP Demo

帮帮是一个 C2C 本地上门服务交易平台演示项目，口号是“有事找帮帮”。

当前版本包含：

- Next.js + TypeScript + Tailwind CSS 移动端优先演示界面
- 本地 mock 数据驱动的注册、实名认证、需求发布、服务人员浏览、接单和订单状态流转
- Supabase client 配置骨架
- Supabase PostgreSQL 初始 schema、索引、RLS 策略和 Storage bucket 预留

## 启动

```bash
npm install --cache .npm-cache
npm run dev -- --hostname 127.0.0.1 --port 3000
```

打开：

```text
http://127.0.0.1:3000
```

## 检查

```bash
npm run typecheck
npm run lint
npm run build
```

## Supabase

复制 `.env.example` 为 `.env.local` 后填入：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

如果你的 Supabase 页面显示的是旧版 `anon public key`，也可以使用：

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

初始 SQL 位于：

```text
supabase/migrations/202607070001_initial_schema.sql
```

真实项目创建后，可以将该 SQL 放入 Supabase SQL Editor 执行，或迁移到 Supabase CLI 工作流中。
