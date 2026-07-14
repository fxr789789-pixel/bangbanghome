# Fundraising Security

## Public Repo Boundary

当前仓库为 `Public`。融资相关内容必须分为两类：

### 可以提交

- 模板
- 空 schema
- 流程规则
- 去敏说明
- 自动化安全边界

### 不可以提交

- 真实投资人邮箱
- 真实 CRM
- 发送记录
- 回复正文
- Pitch Deck 成品
- OAuth / Gmail / SMTP / API Key
- 尽调资料
- 创始人私人信息

## 推荐私有存储位置

- 私有 Supabase 表
- 私有 Drive / 云盘
- 本地加密目录
- 仅本机 `.env.local` / User environment variables

## 提交前检查

- 确认没有 `.env`、token、secret、OAuth 文件被跟踪
- 确认 `fundraising/` 下没有真实 CSV / Deck / 日志被加入 Git
- 确认 CI 可阻止明显 secrets 进入仓库

