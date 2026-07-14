# Codex 任务标准

更新时间：2026-07-14

本标准用于约束后续 Codex 任务输入、执行边界、输出格式和安全要求，避免任务描述不完整、技术栈偏航或敏感数据误提交。

## 每个 Codex 任务必须包含

1. 任务目标  
   说明本次要解决什么问题、交付什么结果。

2. 已知输入  
   列出需求文档、Issue、截图、数据结构、环境约束和外部依赖。

3. 允许修改范围  
   明确哪些目录、文件、脚本或配置允许修改。

4. 禁止事项  
   明确不能改什么，尤其是：
   - 不改技术栈
   - 不删除历史 Issue
   - 不提交 secrets
   - 不把私有融资数据提交到 Public 仓库

5. 安全要求  
   说明凭据、用户数据、投资人数据、邮件记录等如何隔离。

6. 完成标准  
   给出可验证的 done definition，而不是模糊描述。

7. 测试要求  
   至少说明是否需要跑 `lint`、`build`、类型检查、脚本 dry-run 或人工验收。

8. 构建结果要求  
   任务结束时必须说明构建是否通过，哪里失败，失败原因是什么。

9. 变更摘要要求  
   需要输出用户能看懂的高层摘要，而不是只有文件清单。

10. 下一步建议  
   指出后续最合理的延续动作，特别是还需要人工确认的部分。

## 推荐任务模板

```md
## Goal

## Inputs

## Allowed Changes

## Do Not Do

## Security Requirements

## Done Criteria

## Tests Required

## Special Notes
```

## Codex 完成任务后的固定输出

每次完成任务后，输出必须至少包含以下小节：

- `Summary`
- `Files Changed`
- `Tests`
- `Build Result`
- `Security Notes`
- `Remaining Manual Actions`
- `Next Suggestion`

## 公开仓库专项约束

如果仓库是 `Public`，额外适用以下规则：

- 真实投资人邮箱、CRM、发送记录、回复正文、Pitch Deck、尽调材料不得提交
- Gmail / SMTP / OAuth / API Key 不得提交
- 只能提交模板、空 schema、流程说明、去敏示例
- 所有自动化必须优先支持 `dry-run`

## 技术栈锁定

当前项目固定技术栈为：

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `Supabase`

没有创始人后续书面批准前，不新增以下替代主栈：

- `MySQL` 作为主数据库路线
- `Spring Boot`
- `Flutter`

