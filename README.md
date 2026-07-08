# 帮帮 BangBang

帮帮是一个 C2C 本地上门服务交易平台，口号是“有事找帮帮”。当前仓库是预生产 MVP：已经可以公开预览 UI 和主要业务流程，但正式运营前仍需接入真实登录、实名、人脸、支付、退款和后台审核。

## 线上地址

- Production: https://bangbanghome.vercel.app
- GitHub 分支：`codex/bangbang-final-demo`
- Vercel 项目：`bangbanghome`
- Supabase 项目：`bangbang`

## 当前已完成

- Next.js + TypeScript + Tailwind CSS 移动端优先界面。
- 开屏页、首页、需求大厅、师傅大厅、订单中心、个人中心。
- 首页轮播、热门服务折叠、AI 智能分类、师傅资料页、资质和评价展示。
- 首次注册实名认证 UI：实名信息填写 -> 人脸识别 -> 完成。
- 技能认证 UI：人人可接单，专业类服务预留资质审核。
- Supabase client、类型定义、市场数据读取和 mock 回退。
- Supabase 数据库表、索引、RLS、Storage bucket 已应用到远端项目。
- Vercel 生产部署已完成并可公开访问。

## 当前边界

以下能力仍是 UI 或接口预留，不能直接用于真实交易：

- 手机号短信登录和验证码校验。
- 真实身份证和人脸识别核验。
- 需求发布、接单、订单状态真实入库。
- 图片上传、聊天、支付、退款、分账。
- 后台审核、举报投诉、客服工单、风控封禁。
- 正式用户协议、隐私政策和平台服务规则。

完整上线清单见 [docs/launch-readiness.md](docs/launch-readiness.md)。

## 本地启动

```bash
npm install --cache .npm-cache
npm run dev -- --hostname 127.0.0.1 --port 3000
```

打开：

```text
http://127.0.0.1:3000
```

## 检查命令

```bash
npm run typecheck
npm run lint
npm run build
```

## 环境变量

复制 `.env.example` 为 `.env.local`，填入：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

如果 Supabase 项目仍使用旧版 anon public key，也可以使用：

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

不要提交 `.env.local`、`.vercel` 或任何 service role 密钥。

## Supabase

迁移文件位于：

```text
supabase/migrations/
```

已应用到远端项目的迁移包括：

- `complete_existing_enums`
- `create_marketplace_tables`
- `profile_rls_policies`
- `advisor_fixes`

Storage bucket：

- `avatars`
- `request-images`
- `chat-images`
- `qualification-images`

## 下一阶段

建议按以下顺序推进正式上线：

1. 接入 Supabase Auth 和短信登录。
2. 接入实名、人脸核验供应商。
3. 将需求发布、接单、订单状态改为真实入库。
4. 接入 Supabase Storage 上传和签名访问。
5. 接入微信/支付宝支付、退款和分账。
6. 开发后台审核、客服售后、举报投诉和风控。
7. 准备正式协议、隐私政策、平台规则和应用商店材料。
