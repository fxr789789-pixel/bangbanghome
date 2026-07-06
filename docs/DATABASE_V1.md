# BangBang 数据库设计说明书 V1

## 1. 设计目标

BangBang 的数据库设计目标是支撑一个以本地生活服务交易为核心、同时兼顾钱包结算、合伙人分佣、订单协作、消息通信和 AI 运营日志的多模块平台。

本版本重点覆盖：
- 用户与身份体系
- 服务提供与服务发布
- 订单与支付
- 钱包与佣金结算
- 合伙人与推荐关系
- 评价与消息
- 通知与 AI 日志

## 2. 基础设计原则

### 2.1 通用字段规范
所有表统一包含以下基础字段：
- id：主键，建议使用 UUID
- created_at：创建时间，使用 timestamptz
- updated_at：更新时间，使用 timestamptz

### 2.2 统一数据类型规范
- 字符串使用 text 或 varchar，避免过度冗余
- 金额字段统一使用 decimal/numeric，禁止使用 float
- 时间字段统一使用 timestamptz，确保时区一致
- 状态字段使用枚举或受控文本，便于后续扩展与查询

### 2.3 业务一致性原则
- 所有订单相关金额必须可追溯
- 所有佣金必须绑定订单与交易结果
- 所有付款必须对应钱包流水
- 所有消息、评价与通知必须绑定用户与订单或服务对象

---

## 3. 核心实体与关系概览

### 3.1 主要实体
- profiles：用户基础档案
- wallets：用户钱包账户
- wallet_transactions：钱包流水
- partners：合伙人档案
- referrals：推荐关系
- commissions：佣金记录
- providers：服务商档案
- provider_services：服务商提供的服务项
- categories：服务分类
- orders：订单
- payments：支付记录
- reviews：评价记录
- chats：聊天记录
- notifications：通知消息
- ai_logs：AI 操作日志

### 3.2 核心关系
- profiles 1:1 wallets
- profiles 1:0..1 partners
- profiles 1:0..N referrals
- profiles 1:0..N orders
- providers 1:0..N provider_services
- categories 1:0..N provider_services
- categories 1:0..N orders
- orders 1:0..N payments
- orders 1:0..N reviews
- orders 1:0..N chats
- orders 1:0..N notifications
- orders 1:0..N commissions
- referrals 1:0..N commissions
- profiles 1:0..N notifications
- profiles 1:0..N ai_logs

---

## 4. 表设计规范

## 4.1 profiles

### 作用
存储用户的基础身份与平台角色信息。

### 关键字段
- id
- created_at
- updated_at
- auth_user_id：关联 Supabase Auth 用户
- full_name：姓名
- username：用户名
- phone：手机号
- email：邮箱
- avatar_url：头像
- role：用户角色，如 customer/provider/partner/admin
- status：账户状态，如 active/suspended/blocked
- city：所在城市
- district：区域
- bio：个人简介
- is_verified：是否实名认证
- last_login_at：最后登录时间

### 主键
- id

### 外键
- 无直接外键，通常通过 auth_user_id 与 auth.users 间接关联

### 索引
- auth_user_id 唯一索引
- email 唯一索引
- username 唯一索引
- role、status、city 组合索引

### 唯一约束
- auth_user_id 唯一
- email 唯一
- username 唯一（如启用）

### RLS 策略
- 用户可读取并更新自己的 profile
- 管理员可读取和更新所有 profile
- 公开只读字段可允许匿名访问

### 状态枚举
- role: customer | provider | partner | admin
- status: pending | active | suspended | deleted

### 关系
- 一位用户可拥有一个钱包
- 一位用户可成为一个服务商
- 一位用户可成为一个合伙人
- 一位用户可发起多个订单

---

## 4.2 wallets

### 作用
存储每个用户的余额账户，支持平台内部资金结算。

### 关键字段
- id
- created_at
- updated_at
- profile_id：归属用户
- currency：币种，如 CNY
- balance：当前余额
- available_balance：可提现余额
- pending_balance：待结算余额
- status：钱包状态
- locked_at：锁定时间
- last_transaction_at：最近流水时间

### 主键
- id

### 外键
- profile_id -> profiles.id

### 索引
- profile_id 唯一索引
- status、currency 索引

### 唯一约束
- profile_id 唯一

### RLS 策略
- 用户只能查看和操作自己的钱包
- 管理员可查看所有钱包
- 资金变更通过服务端写入，客户端不可直接修改余额字段

### 状态枚举
- status: active | frozen | closed

### 关系
- 一个钱包对应一个用户
- 一个钱包可产生多条钱包流水

### 金额字段
- balance、available_balance、pending_balance 统一使用 decimal/numeric

---

## 4.3 wallet_transactions

### 作用
记录钱包资金的每一笔变动，形成可审计流水。

### 关键字段
- id
- created_at
- updated_at
- wallet_id：所属钱包
- type：流水类型
- direction：进出方向
- amount：变动金额
- balance_after：变更后的余额
- reference_type：关联对象类型，如 order/payment/commission/withdrawal
- reference_id：关联对象主键
- description：摘要
- status：流水状态
- metadata：扩展字段

### 主键
- id

### 外键
- wallet_id -> wallets.id

### 索引
- wallet_id、created_at 组合索引
- reference_type、reference_id 组合索引
- status 索引

### 唯一约束
- 无强制唯一约束，允许同一订单多次流水

### RLS 策略
- 用户只能查看自己的钱包流水
- 管理员可查看全部流水
- 不允许客户端直接删除或修改流水

### 状态枚举
- type: deposit | withdrawal | payment | refund | commission | adjustment
- direction: inbound | outbound
- status: pending | succeeded | failed | reversed

### 关系
- 一条钱包流水属于一个钱包
- 可关联订单、支付、佣金或提现记录

### 金额字段
- amount、balance_after 使用 decimal/numeric

---

## 4.4 partners

### 作用
存储合伙人信息，支持分佣、邀请和团队发展。

### 关键字段
- id
- created_at
- updated_at
- profile_id：合伙人用户
- partner_code：邀请码
- partner_level：等级，如 basic/agent
- status：合伙人状态
- parent_partner_id：上级合伙人
- city：服务城市
- commission_rate：普通佣金比例
- agent_rate：代理佣金比例
- total_referred_users：邀请用户数
- total_commission_amount：累计佣金
- total_withdrawn_amount：累计提现金额
- available_balance：可提佣金余额
- last_payout_at：最近提现时间

### 主键
- id

### 外键
- profile_id -> profiles.id
- parent_partner_id -> partners.id（可空）

### 索引
- profile_id 唯一索引
- partner_code 唯一索引
- status、partner_level 索引
- parent_partner_id 索引

### 唯一约束
- profile_id 唯一
- partner_code 唯一

### RLS 策略
- 合伙人可查看自己的合伙人信息和收益
- 管理员可查看和维护所有合伙人信息
- 上级合伙人可查看下级团队相关汇总信息

### 状态枚举
- partner_level: basic | agent | city_agent
- status: active | inactive | suspended | closed

### 关系
- 一个合伙人对应一个用户
- 一个合伙人可有多个下级合伙人
- 一个合伙人可参与多条佣金记录

### 金额字段
- commission_rate、agent_rate 使用 decimal/numeric
- total_commission_amount、total_withdrawn_amount、available_balance 使用 decimal/numeric

---

## 4.5 referrals

### 作用
记录用户之间的推荐关系，支撑邀请和分佣追踪。

### 关键字段
- id
- created_at
- updated_at
- inviter_profile_id：邀请人
- invited_profile_id：被邀请人
- referral_code：使用的邀请码或链接码
- referral_source：渠道，如 invite_link | qrcode | share
- status：关系状态
- first_order_id：首单订单
- first_order_at：首单时间
- reward_status：奖励状态

### 主键
- id

### 外键
- inviter_profile_id -> profiles.id
- invited_profile_id -> profiles.id
- first_order_id -> orders.id（可空）

### 索引
- inviter_profile_id 索引
- invited_profile_id 唯一索引
- referral_code 索引
- status 索引

### 唯一约束
- inviter_profile_id + invited_profile_id 组合唯一

### RLS 策略
- 用户可查看自己发起或接收的推荐关系
- 管理员可查看全部关系
- 仅服务端可写入奖励状态变更

### 状态枚举
- status: pending | converted | expired | revoked
- reward_status: pending | granted | reversed

### 关系
- 一条推荐关系对应一个邀请人和一个被邀请人
- 可关联首次交易订单

---

## 4.6 commissions

### 作用
记录平台对合伙人发放的佣金，支持追踪与回滚。

### 关键字段
- id
- created_at
- updated_at
- order_id：关联订单
- partner_id：受益合伙人
- referral_id：关联推荐关系
- commission_type：佣金类型，如 direct | agent
- base_amount：基础金额
- commission_rate：佣金比例
- commission_amount：实际佣金金额
- currency：币种
- status：佣金状态
- settlement_at：结算时间
- reversed_at：回滚时间
- note：备注

### 主键
- id

### 外键
- order_id -> orders.id
- partner_id -> partners.id
- referral_id -> referrals.id（可空）

### 索引
- order_id 唯一索引
- partner_id、status 组合索引
- settlement_at 索引

### 唯一约束
- order_id + partner_id + commission_type 组合唯一

### RLS 策略
- 合伙人仅可查看自己的佣金记录
- 管理员可查看全部记录
- 佣金状态变更仅允许服务端或后台权限执行

### 状态枚举
- commission_type: direct | agent
- status: pending | settled | reversed | cancelled

### 关系
- 一条佣金记录对应一个订单和一个合伙人
- 可通过推荐关系追溯来源

### 金额字段
- base_amount、commission_amount 使用 decimal/numeric

---

## 4.7 providers

### 作用
存储服务商的专业信息与资质信息。

### 关键字段
- id
- created_at
- updated_at
- profile_id：关联用户
- provider_name：服务商名称
- headline：简介标题
- description：详细说明
- service_radius_km：服务半径
- city：所在城市
- district：区域
- average_rating：平均评分
- completed_orders：完成单数
- response_rate：响应率
- is_verified：是否认证
- status：服务商状态
- verified_at：认证时间

### 主键
- id

### 外键
- profile_id -> profiles.id

### 索引
- profile_id 唯一索引
- city、status 索引
- average_rating 索引

### 唯一约束
- profile_id 唯一

### RLS 策略
- 服务商可查看和更新自己的 provider 数据
- 用户不可修改他人 provider 数据
- 管理员可管理全部 provider

### 状态枚举
- status: pending | approved | suspended | rejected

### 关系
- 一个 provider 对应一个用户
- 一个 provider 可提供多项服务
- 一个 provider 可接收多个订单

---

## 4.8 provider_services

### 作用
存储服务商提供的具体服务项，支撑服务发布与搜索。

### 关键字段
- id
- created_at
- updated_at
- provider_id：服务商
- category_id：服务分类
- title：服务标题
- description：服务说明
- price_min：最低价格
- price_max：最高价格
- currency：币种
- unit：计价单位，如 per_hour | per_job
- service_area：服务区域
- availability: 可用时间说明
- status：服务状态
- is_featured：是否置顶
- view_count：浏览量
- order_count：接单量

### 主键
- id

### 外键
- provider_id -> providers.id
- category_id -> categories.id

### 索引
- provider_id 索引
- category_id 索引
- status、is_featured 索引
- city/area 相关字段索引（如有）

### 唯一约束
- provider_id + category_id + title 组合唯一

### RLS 策略
- 服务商可维护自己的服务项
- 用户可读取已发布的服务项
- 管理员可管理全部服务项

### 状态枚举
- status: draft | published | paused | archived

### 关系
- 一个服务项属于一个服务商
- 一个服务项属于一个分类
- 一个服务项可被多个订单引用

### 金额字段
- price_min、price_max 使用 decimal/numeric

---

## 4.9 categories

### 作用
维护服务分类体系，为搜索、筛选和服务发布提供统一分类。

### 关键字段
- id
- created_at
- updated_at
- name：分类名
- slug：唯一标识
- parent_id：父分类
- description：分类说明
- icon_url：图标
- sort_order：排序
- is_active：是否启用

### 主键
- id

### 外键
- parent_id -> categories.id（可空）

### 索引
- slug 唯一索引
- parent_id 索引
- is_active、sort_order 索引

### 唯一约束
- slug 唯一

### RLS 策略
- 分类信息对公开用户可读
- 管理员可维护分类
- 普通用户不可修改分类

### 状态枚举
- 无强状态枚举，使用 is_active 布尔值即可

### 关系
- 分类可形成树状结构
- 一个分类可挂多个服务项和订单

---

## 4.10 orders

### 作用
存储交易订单的核心信息，连接需求方、服务方、商品服务和支付。

### 关键字段
- id
- created_at
- updated_at
- customer_id：需求方
- provider_id：服务商
- provider_service_id：服务项
- category_id：服务分类
- title：订单标题
- description：服务描述
- address：服务地点
- scheduled_at：预约时间
- status：订单状态
- price_amount：订单金额
- service_fee_amount：服务费
- platform_fee_amount：平台费
- discount_amount：优惠金额
- total_amount：实际支付金额
- currency：币种
- cancellation_reason：取消原因
- completed_at：完成时间
- cancelled_at：取消时间

### 主键
- id

### 外键
- customer_id -> profiles.id
- provider_id -> providers.id
- provider_service_id -> provider_services.id（可空）
- category_id -> categories.id

### 索引
- customer_id、provider_id 组合索引
- status、scheduled_at 组合索引
- category_id 索引
- created_at 索引

### 唯一约束
- 无强制唯一约束

### RLS 策略
- 订单参与方可查看自己的订单
- 管理员可查看全部订单
- 订单状态变更仅允许授权角色或服务端执行

### 状态枚举
- status: pending | accepted | in_progress | completed | cancelled | disputed | refunded

### 关系
- 一个订单属于一个需求方和一个服务商
- 一个订单可关联一个服务项和一个分类
- 一个订单可生成多条支付、评价、消息和佣金记录

### 金额字段
- price_amount、service_fee_amount、platform_fee_amount、discount_amount、total_amount 使用 decimal/numeric

---

## 4.11 payments

### 作用
记录订单支付信息，支持多种支付方式与支付状态追踪。

### 关键字段
- id
- created_at
- updated_at
- order_id：关联订单
- payer_profile_id：付款人
- payment_method：支付方式
- payment_provider：支付渠道
- amount：支付金额
- currency：币种
- status：支付状态
- transaction_id：第三方流水号
- paid_at：付款时间
- refunded_at：退款时间
- refund_amount：退款金额
- metadata：扩展字段

### 主键
- id

### 外键
- order_id -> orders.id
- payer_profile_id -> profiles.id

### 索引
- order_id 唯一索引
- payer_profile_id 索引
- status、payment_method 索引

### 唯一约束
- order_id 唯一
- transaction_id 唯一（如存在）

### RLS 策略
- 用户只能查看自己发起的支付记录
- 管理员可查看全部支付记录
- 退款和支付状态更新需服务端或后台权限

### 状态枚举
- status: pending | paid | failed | refunded | partially_refunded | cancelled
- payment_method: wallet | alipay | wechat | bank_card | cash

### 关系
- 一个订单只有一条主支付记录
- 支付记录可关联钱包流水

### 金额字段
- amount、refund_amount 使用 decimal/numeric

---

## 4.12 reviews

### 作用
记录服务完成后的评价与信誉反馈。

### 关键字段
- id
- created_at
- updated_at
- order_id：关联订单
- reviewer_profile_id：评价人
- target_profile_id：被评价人
- rating：评分
- comment：评价内容
- status：审核状态
- is_anonymous：是否匿名
- helpful_count：有用数

### 主键
- id

### 外键
- order_id -> orders.id
- reviewer_profile_id -> profiles.id
- target_profile_id -> profiles.id

### 索引
- order_id 唯一索引
- target_profile_id、rating 组合索引
- reviewer_profile_id 索引
- status 索引

### 唯一约束
- order_id 唯一

### RLS 策略
- 订单参与双方可查看评价内容
- 评价提交者可修改自己的评价（若允许）
- 管理员可审核和删除不当评价

### 状态枚举
- status: pending | published | hidden | removed

### 关系
- 一条评价对应一个订单
- 可用于服务商信誉计算

---

## 4.13 chats

### 作用
记录订单或服务会话中的实时消息。

### 关键字段
- id
- created_at
- updated_at
- order_id：关联订单
- sender_profile_id：发送人
- receiver_profile_id：接收人
- message_type：消息类型
- content：消息正文
- attachment_url：附件地址
- status：消息状态
- is_read：是否已读
- read_at：阅读时间

### 主键
- id

### 外键
- order_id -> orders.id
- sender_profile_id -> profiles.id
- receiver_profile_id -> profiles.id

### 索引
- order_id、created_at 组合索引
- sender_profile_id、receiver_profile_id 索引
- status、is_read 索引

### 唯一约束
- 无强制唯一约束

### RLS 策略
- 只有订单参与方可读取和发送消息
- 管理员可查看全部消息
- 消息内容默认不公开

### 状态枚举
- message_type: text | image | file | system
- status: sent | delivered | read | failed

### 关系
- 一条消息归属于一个订单会话
- 消息双方通过 profile 关联

---

## 4.14 notifications

### 作用
向用户推送系统通知、订单提醒、支付提醒和合伙人消息。

### 关键字段
- id
- created_at
- updated_at
- recipient_profile_id：接收人
- order_id：关联订单（可空）
- notification_type：通知类型
- title：标题
- body：内容
- is_read：是否已读
- read_at：阅读时间
- status：通知状态
- action_url：跳转链接

### 主键
- id

### 外键
- recipient_profile_id -> profiles.id
- order_id -> orders.id（可空）

### 索引
- recipient_profile_id、is_read 组合索引
- notification_type、status 索引
- created_at 索引

### 唯一约束
- 无强制唯一约束

### RLS 策略
- 用户只能读取自己的通知
- 管理员可查看全部通知
- 用户可更新自己的已读状态

### 状态枚举
- notification_type: order_update | payment | commission | partner | system | review
- status: pending | sent | delivered | failed

### 关系
- 一个通知属于一个接收用户
- 可关联订单和系统动作

---

## 4.15 ai_logs

### 作用
记录 AI 助手生成、推荐和分析等操作的日志，支撑追踪与调优。

### 关键字段
- id
- created_at
- updated_at
- profile_id：触发用户
- order_id：关联订单（可空）
- module：AI 模块，如 publish_helper | promotion_helper | order_recommender | customer_service
- action：AI 操作动作
- input_summary：输入摘要
- output_summary：输出摘要
- model_name：模型名称
- status：执行状态
- latency_ms：执行耗时
- error_message：错误信息
- metadata：扩展字段

### 主键
- id

### 外键
- profile_id -> profiles.id
- order_id -> orders.id（可空）

### 索引
- profile_id、created_at 组合索引
- module、status 索引
- order_id 索引

### 唯一约束
- 无强制唯一约束

### RLS 策略
- 用户只能查看自己触发的 AI 日志
- 管理员可查看全部日志
- AI 运行结果不应公开给普通用户

### 状态枚举
- status: success | failed | pending | cancelled
- module: publish_helper | promotion_helper | recommender | customer_service | risk_control

### 关系
- AI 日志可关联用户和订单，便于分析效果与异常

---

## 5. 统一 RLS 设计策略

### 5.1 基本原则
- 用户仅可访问自己的数据
- 订单参与方可访问与自己相关的订单和沟通内容
- 合伙人仅可访问自己的合伙人、佣金和团队相关信息
- 管理员可访问全量数据
- 财务与风控数据默认使用服务端写入，避免客户端直接修改

### 5.2 推荐的角色划分
- authenticated users：普通用户
- service_role：后台与服务端任务
- admin：平台管理员

### 5.3 典型策略模式
- 个人资料类表：仅本人可读写
- 交易类表：参与人可读，服务端可写
- 运营类表：管理员可读写，普通用户只读部分字段
- 财务类表：仅本人和管理员可见，严禁客户端直接修改余额与结算状态

---

## 6. 状态与枚举设计建议

### 6.1 通用状态建议
- pending：待处理
- active：已启用
- inactive：未启用
- suspended：暂停
- completed：已完成
- cancelled：已取消
- failed：失败
- refunded：已退款
- reversed：已回滚

### 6.2 业务状态建议
- 用户状态：pending | active | suspended | deleted
- 服务商状态：pending | approved | suspended | rejected
- 服务状态：draft | published | paused | archived
- 订单状态：pending | accepted | in_progress | completed | cancelled | disputed | refunded
- 支付状态：pending | paid | failed | refunded | partially_refunded | cancelled
- 评价状态：pending | published | hidden | removed
- 通知状态：pending | sent | delivered | failed
- AI 日志状态：success | failed | pending | cancelled

---

## 7. 金钱字段设计规范

### 7.1 统一要求
所有金额字段必须使用 decimal/numeric，避免浮点误差。

### 7.2 推荐精度
- 常规金额：decimal(12,2)
- 高精度或复杂计算：decimal(12,4)

### 7.3 建议字段
- balance：当前余额
- available_balance：可用余额
- pending_balance：待结算余额
- amount：标准金额
- commission_amount：佣金金额
- platform_fee_amount：平台手续费
- discount_amount：折扣金额
- refund_amount：退款金额

### 7.4 资金安全要求
- 所有余额变更必须记录流水
- 退款与回滚必须可追溯
- 佣金结算需绑定订单和结算时间
- 不允许直接通过客户端修改钱包余额

---

## 8. 建议的扩展点

### 8.1 后续版本可扩展
- 支付网关流水表
- 退款申请表
- 争议工单表
- 优惠券表
- 促销活动表
- 服务预约日历表
- 地理位置索引表

### 8.2 为未来 AI 能力预留
- AI 推荐结果表
- AI 对话上下文表
- AI 内容审核结果表
- AI 运营分析快照表

---

## 9. 总体结论

BangBang V1 的数据库设计以“交易为核心、钱包为基础、增长为驱动、AI 为增强”构建。

该设计满足以下关键要求：
- 支撑本地服务需求发布与服务提供
- 支撑订单、支付、评价和沟通流程
- 支撑钱包、佣金与合伙人裂变增长
- 支撑 Supabase 的 RLS 与服务端安全模式
- 为未来扩展到更多服务类别、更多支付方式和更多 AI 能力预留扩展空间
