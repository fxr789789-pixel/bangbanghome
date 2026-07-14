# Fundraising Workspace

本目录用于管理 BangBang 的融资流程模板、公开规则和 dry-run 规范。

## 公开仓库原则

当前 GitHub 仓库为 `Public`。因此本目录在公开提交时只能包含：

- 模板
- 空数据结构
- 流程说明
- 去敏示例
- 自动化规则

以下内容不得提交到公开仓库：

- 真实投资机构名单
- 真实投资人邮箱
- CRM 明细
- 发送日志
- 回复正文
- Pitch Deck 成品
- OAuth / Gmail / SMTP 凭据
- 尽调材料

## 建议目录职责

- `investor-criteria.md`：投资机构筛选标准
- `outreach-policy.md`：外联规则与红线
- `email-templates.md`：首封邮件模板
- `daily-report-template.md`：日报模板
- `data-schema.csv`：私有数据库字段定义
- `dry-run-report.md`：dry-run 结果模板
- `SECURITY.md`：敏感数据存储和提交边界

## 执行顺序

1. 先补机构筛选标准和数据结构
2. 只在私有环境维护真实名单
3. 先 `dry-run` 再真实发送
4. 发送后只更新私有 CRM 和私有日志
5. 收到回复后只生成建议和 draft，不自动回复

