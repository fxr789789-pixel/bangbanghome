# BangBang 自动化与任务审计

更新时间：2026-07-14  
仓库：`fxr789789-pixel/bangbanghome`  
默认分支：`main`  
仓库可见性：`Public`

## 审计范围

本次审计覆盖：

- GitHub Issues `#1` 到 `#10`
- 本地 `fundraising/` 自动化脚本
- 仓库中的 CI / 任务执行基础设施
- 公开仓库下的融资数据暴露风险

## 前置文件检查

按执行单要求应先读取以下文件，但当前仓库中均不存在，因此本次没有假设其内容：

- `PROJECT_RULES.md`
- `AI_RULES.md`
- `PRODUCT_SPEC.md`
- `ROADMAP.md`
- `TASKS.md`
- `DATABASE_DESIGN.md`
- `AGENTS.md`

结论：这些文件缺失本身就是自动化无法稳定执行的重要原因之一，后续任务只能依据仓库现状、Issue 文本和现有代码做最小保守判断。

## 自动化现状摘要

- 仓库已经是 `Next.js + TypeScript + Tailwind CSS + Supabase` 路线，不适合继续按 `MySQL / Spring Boot / Flutter` issue 路线推进。
- `.github/workflows` 原先不存在，仓库没有最小 CI。
- 本地存在融资自动化脚本和 Windows Scheduled Task 方案，但缺少公开仓库安全边界，且发生过小时任务与人工补发的竞态。
- `fundraising/` 目录下已有大量真实或半真实执行产物，这些内容不应提交到 Public 仓库。
- 2026-07-14 上午本地小时 SMTP 任务已实际跑通，但也暴露出“同机构多邮箱重复触达”的风险。

## Issues #1-#10 审计

| Issue | 原任务目标 | 当前状态 | 是否已有代码结果 | 是否存在技术栈冲突 | 缺少输入 | 是否可直接执行 | 建议 | 下一步 |
|---|---|---|---|---|---|---|---|---|
| `#1` `Sprint 0 - Product Requirements Document (PRD)` | 补产品需求文档，覆盖用户端、服务人员端、后台、AI、派单、支付、风控、安全中心 | 仓库已有 [`README.md`](</D:/Backup/Documents/bangbang 2/README.md>)、[`docs/development-roadmap.md`](</D:/Backup/Documents/bangbang 2/docs/development-roadmap.md>)、[`docs/launch-readiness.md`](</D:/Backup/Documents/bangbang 2/docs/launch-readiness.md>)，但没有正式 PRD 文件 | 部分有 | 否 | 统一 PRD 格式、验收口径、业务优先级 | 可执行 | 保留并重写范围 | 以现有 Next.js/Supabase MVP 为基线补正式 PRD，而不是重新开产品方向 |
| `#2` `Sprint 0 - Database Design` | 设计 `MySQL`、ER 图、约 80 张表、SQL 脚本 | 仓库当前已落地 [`supabase/migrations/`](</D:/Backup/Documents/bangbang 2/supabase/migrations>)，实际是 `Supabase Postgres` 路线，不是 MySQL | 有 | 是 | Postgres 版数据设计文档、真实生产边界 | 不可按原描述执行 | 阻塞并重写 | 改写为“Supabase/Postgres schema 审计与扩展设计”，保留业务目标，不保留 MySQL 方案 |
| `#3` `Sprint 1 - Spring Boot Initialization` | 初始化 Spring Boot 后端 | 当前仓库没有 Spring Boot 代码，也没有 Java 构建链 | 无 | 是 | 创始人书面批准更换技术栈 | 不可执行 | 阻塞 | 不启动 Spring Boot；所有后端能力继续放在 Next.js + Supabase 体系内 |
| `#4` `Sprint 1 - Flutter User App` | 开发 Flutter 用户端 | 当前仓库已有 Next.js 移动优先 Web MVP，未使用 Flutter | 有替代结果 | 是 | 创始人书面批准切 Flutter | 不可执行 | 阻塞 | 保留功能目标，改写为“Next.js 用户端体验完善” |
| `#5` `Sprint 1 - Flutter Worker App` | 开发 Flutter 服务人员端 | 当前仓库已有单仓 Web 端“师傅导航 / 订单中心 / 认证 UI” | 有替代结果 | 是 | 独立 worker 端产品边界、是否仍需 Flutter | 不可执行 | 阻塞 | 保留业务目标，改写为“同仓 Web Worker Flow / 后续再评估独立端” |
| `#6` `Sprint 1 - Admin Web` | 开发后台管理 Web | 当前只有 [`app/page.tsx`](</D:/Backup/Documents/bangbang 2/app/page.tsx>) 里的后台审核展示面板，没有独立后台应用、权限和数据闭环 | 部分有 | 否 | 后台角色定义、权限矩阵、工单流程 | 不适合按现状直接展开 | 保留并拆小 | 先做 Next.js 后台信息架构与权限设计，再开独立页面和数据表 |
| `#7` `Sprint 1 - Login Module` | 登录模块 | UI 和环境变量示例存在，但没有真实短信 OTP / Supabase Auth 闭环 | 部分有 | 否 | 真实 Auth 方案、短信供应商、风控要求 | 可执行但缺条件 | 保留 | 先接 `Supabase Auth`，短信 OTP 放后续供应商接入 |
| `#8` `Sprint 1 - Home Page` | 首页模块 | 首页 UI 已在 [`app/page.tsx`](</D:/Backup/Documents/bangbang 2/app/page.tsx>) 实现，包含 AI 发布、附近需求、热门服务等 | 有 | 否 | 验收标准、数据来源从 mock 切真实 | 可执行 | 保留并更新描述 | 将 issue 改为“首页从 mock 过渡到 Supabase 实数”更合适 |
| `#9` `Sprint 1 - Service Category` | 服务分类模块 | 分类、筛选、专业资质限制、热门服务 UI 已存在 | 有 | 否 | 分类字典来源、后台可配置策略 | 可执行 | 保留并更新描述 | 将 issue 从“新建模块”改为“分类配置化和审核规则入库” |
| `#10` `Sprint 1 - Order System` | 订单系统 | 订单中心、聊天、支付、退款、投诉 UI 已存在，但仍是演示层，缺真实入库和状态流转 | 部分有 | 否 | 订单状态机、支付/退款回调、权限边界 | 可执行但不完整 | 保留并拆小 | 拆成订单建单、状态流转、支付、售后四个子任务 |

## 发现的自动化错误

1. 原先没有 `.github/workflows`，Issue 只能停留在待办，没有最小执行器。
2. 融资自动化把真实执行产物写在工作区，但缺少公开仓库安全隔离。
3. 小时 SMTP 任务与人工/半自动补发之间没有“发件前回查 sent mail”保护，导致同机构多地址重复触达。
4. `sent-record-YYYY-MM-DD.csv` 曾出现编码与写入方式不一致的问题，导致流水文件损坏风险。
5. 当前仓库缺少统一的 Codex 任务格式，导致任务输入、输出、安全边界不稳定。
6. 公开仓库仍可能误纳入 `fundraising/` 下真实 CRM、日志、Deck 和草稿，需要显式忽略规则。

## 审计结论

- `#2-#5` 不应继续按原技术栈执行，应视为阻塞或重写候选。
- `#1`、`#6-#10` 可以保留业务目标，但都需要改写成符合当前 `Next.js + Supabase` 路线的任务。
- 公开仓库必须只提交融资模板、流程规范和空数据结构，不能提交真实投资机构、真实发信记录、真实 Deck、OAuth/SMTP/Gmail 凭据。
- 后续任何融资自动化继续扩量前，必须先保证：
  - 同机构去重在“发件前”完成
  - 真实发送和本地记账顺序一致
  - 自动回复和自动跟进保持关闭

