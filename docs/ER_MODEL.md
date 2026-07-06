# BangBang ER Model Documentation

## 1. Overview

BangBang is a local services marketplace with four core business domains:
- User identity and profile management
- Service publishing and order execution
- Wallets, payments, and commissions
- Partner growth, referrals, messaging, and notifications

The ER model is designed for Supabase PostgreSQL and supports:
- UUID primary keys
- Explicit foreign keys
- Audit fields for creation and update
- Soft delete support where appropriate
- RLS-friendly access patterns
- Clear relationships for marketplace operations and financial traceability

All tables in this model include:
- id
- created_at
- updated_at

Where appropriate, tables also include soft delete support through deleted_at.

---

## 2. Core Entity Relationship Summary

### 2.1 Main business relationships
- One profile owns one wallet.
- One profile can have many addresses.
- One profile can be a provider and can own many services.
- One profile can place many orders as a customer.
- One profile can receive many orders as a provider.
- One order belongs to one customer and one provider.
- One order can have many images, messages, payments, reviews, and notifications.
- One order can generate many commissions.
- One partner is linked to one profile and can have many descendants.
- One referral links one inviter and one invited profile.
- One referral can contribute to one or many commissions.
- One category can group many services and orders.

### 2.2 Financial relationships
- Wallets are owned by profiles.
- Wallet transactions belong to wallets and record financial movements.
- Payments are attached to orders and linked to the payer profile.
- Commissions are linked to orders, partners, and optionally referrals.

### 2.3 Communication and trust relationships
- Messages belong to orders and are sent between two profiles.
- Reviews belong to orders and link reviewer and target profiles.
- Notifications are addressed to profiles and may relate to orders.

---

## 3. Table-by-Table ER Model Description

## 3.1 profiles

### Purpose
Represents the core user identity in BangBang. It is the central entity for customers, providers, partners, and administrators.

### Key attributes
- id: primary key
- auth_user_id: links the profile to Supabase Auth
- full_name, username, phone, email, avatar_url
- role: customer, provider, partner, or admin
- status: pending, active, suspended, or deleted
- city, district, bio, is_verified
- last_login_at
- deleted_at
- created_at, updated_at

### Relationships
- One profile can have one wallet.
- One profile can have many addresses.
- One profile can have many services if acting as a provider.
- One profile can place many orders as a customer.
- One profile can receive many orders as a provider.
- One profile can have many certifications.
- One profile can have one partner record.
- One profile can invite many referrals and receive many referrals.
- One profile can send and receive many messages.
- One profile can receive many notifications.

### Foreign keys
- auth_user_id -> auth.users(id)

### Indexes
- auth_user_id (unique)
- email (unique)
- username (unique)
- role + status
- city
- deleted_at

---

## 3.2 addresses

### Purpose
Stores a user’s saved delivery or service addresses.

### Key attributes
- id
- profile_id
- label
- full_address
- city
- district
- latitude, longitude
- is_default
- deleted_at
- created_at, updated_at

### Relationships
- Many addresses belong to one profile.
- One address can be used by many orders if reused over time.

### Foreign keys
- profile_id -> profiles.id

### Indexes
- profile_id
- is_default

---

## 3.3 categories

### Purpose
Defines the service taxonomy used for search, discovery, and routing.

### Key attributes
- id
- name
- slug
- parent_id
- description
- icon_url
- sort_order
- is_active
- deleted_at
- created_at, updated_at

### Relationships
- A category can have many child categories.
- A category can contain many services.
- A category can be used by many orders.

### Foreign keys
- parent_id -> categories.id

### Indexes
- slug (unique)
- parent_id
- is_active + sort_order

---

## 3.4 services

### Purpose
Represents a provider’s published service offering.

### Key attributes
- id
- provider_profile_id
- category_id
- title
- description
- price_min, price_max
- currency
- service_area
- availability
- status
- is_featured
- view_count
- order_count
- deleted_at
- created_at, updated_at

### Relationships
- Many services belong to one provider profile.
- Many services belong to one category.
- One service can be referenced by many orders.

### Foreign keys
- provider_profile_id -> profiles.id
- category_id -> categories.id

### Indexes
- provider_profile_id
- category_id
- status + is_featured

---

## 3.5 orders

### Purpose
Represents the main marketplace transaction between a customer and a provider.

### Key attributes
- id
- customer_profile_id
- provider_profile_id
- service_id
- category_id
- address_id
- title
- description
- scheduled_at
- status
- price_amount
- service_fee_amount
- platform_fee_amount
- discount_amount
- total_amount
- currency
- cancellation_reason
- completed_at
- cancelled_at
- deleted_at
- created_at, updated_at

### Relationships
- One order belongs to one customer profile.
- One order belongs to one provider profile.
- One order may reference one service.
- One order belongs to one category.
- One order may use one address.
- One order can have many order images.
- One order can have many payments.
- One order can have many reviews.
- One order can have many messages.
- One order can have many notifications.
- One order can generate many commissions.
- One order can be linked to one referral as the first converted order.

### Foreign keys
- customer_profile_id -> profiles.id
- provider_profile_id -> profiles.id
- service_id -> services.id
- category_id -> categories.id
- address_id -> addresses.id

### Indexes
- customer_profile_id
- provider_profile_id
- status + scheduled_at
- category_id
- created_at

---

## 3.6 order_images

### Purpose
Stores images attached to an order, usually for service evidence, before/after proof, or work documentation.

### Key attributes
- id
- order_id
- image_url
- caption
- sort_order
- deleted_at
- created_at, updated_at

### Relationships
- Many order images belong to one order.

### Foreign keys
- order_id -> orders.id

### Indexes
- order_id

---

## 3.7 wallets

### Purpose
Represents the financial account of a profile for platform transactions.

### Key attributes
- id
- profile_id
- currency
- balance
- available_balance
- pending_balance
- status
- locked_at
- created_at, updated_at

### Relationships
- One wallet belongs to one profile.
- One wallet can have many wallet transactions.

### Foreign keys
- profile_id -> profiles.id

### Indexes
- profile_id (unique)
- status

---

## 3.8 wallet_transactions

### Purpose
Records every financial movement for a wallet.

### Key attributes
- id
- wallet_id
- transaction_type
- direction
- amount
- balance_after
- reference_type
- reference_id
- description
- status
- metadata
- created_at, updated_at

### Relationships
- Many wallet transactions belong to one wallet.
- Transactions may reference an external business object such as an order, payment, commission, or withdrawal.

### Foreign keys
- wallet_id -> wallets.id

### Indexes
- wallet_id + created_at
- reference_type + reference_id
- status

---

## 3.9 provider_certifications

### Purpose
Stores provider verification documents and credentials.

### Key attributes
- id
- profile_id
- cert_type
- title
- issuer
- certificate_number
- issued_at
- expires_at
- document_url
- status
- is_verified
- deleted_at
- created_at, updated_at

### Relationships
- Many certifications belong to one provider profile.

### Foreign keys
- profile_id -> profiles.id

### Indexes
- profile_id
- status

---

## 3.10 partners

### Purpose
Represents the partner and city-partner layer of the growth system.

### Key attributes
- id
- profile_id
- parent_partner_id
- partner_code
- partner_level
- status
- commission_rate
- agent_rate
- total_referred_users
- total_commission_amount
- total_withdrawn_amount
- available_balance
- deleted_at
- created_at, updated_at

### Relationships
- One partner belongs to one profile.
- One partner may have one parent partner and many child partners.
- One partner can earn many commissions.

### Foreign keys
- profile_id -> profiles.id
- parent_partner_id -> partners.id

### Indexes
- profile_id (unique)
- partner_code (unique)
- status + partner_level
- parent_partner_id

---

## 3.11 referrals

### Purpose
Tracks invitation and referral relationships between users.

### Key attributes
- id
- inviter_profile_id
- invited_profile_id
- referral_code
- referral_source
- status
- first_order_id
- first_order_at
- reward_status
- deleted_at
- created_at, updated_at

### Relationships
- One referral has one inviter profile and one invited profile.
- One referral may be linked to one first order.
- One referral can generate many commissions.

### Foreign keys
- inviter_profile_id -> profiles.id
- invited_profile_id -> profiles.id
- first_order_id -> orders.id

### Indexes
- inviter_profile_id
- invited_profile_id (unique)
- referral_code
- status

---

## 3.12 commissions

### Purpose
Stores the payout record associated with partner growth and successful orders.

### Key attributes
- id
- order_id
- partner_id
- referral_id
- commission_type
- base_amount
- commission_rate
- commission_amount
- currency
- status
- settlement_at
- reversed_at
- note
- deleted_at
- created_at, updated_at

### Relationships
- Many commissions belong to one order.
- Many commissions belong to one partner.
- One commission may optionally be linked to one referral.

### Foreign keys
- order_id -> orders.id
- partner_id -> partners.id
- referral_id -> referrals.id

### Indexes
- order_id + partner_id + commission_type (logical uniqueness)
- partner_id + status
- settlement_at

---

## 3.13 payments

### Purpose
Stores payment attempts and completed payments for orders.

### Key attributes
- id
- order_id
- payer_profile_id
- payment_method
- payment_provider
- amount
- currency
- status
- transaction_id
- paid_at
- refunded_at
- refund_amount
- metadata
- deleted_at
- created_at, updated_at

### Relationships
- One payment belongs to one order.
- One payment is initiated by one payer profile.

### Foreign keys
- order_id -> orders.id
- payer_profile_id -> profiles.id

### Indexes
- order_id (unique)
- payer_profile_id
- status + payment_method
- transaction_id (unique when present)

---

## 3.14 reviews

### Purpose
Captures customer feedback and trust signals after an order.

### Key attributes
- id
- order_id
- reviewer_profile_id
- target_profile_id
- rating
- comment
- status
- is_anonymous
- helpful_count
- deleted_at
- created_at, updated_at

### Relationships
- One review belongs to one order.
- One review is written by one reviewer profile.
- One review targets one profile.

### Foreign keys
- order_id -> orders.id
- reviewer_profile_id -> profiles.id
- target_profile_id -> profiles.id

### Indexes
- order_id (unique)
- target_profile_id + rating
- reviewer_profile_id
- status

---

## 3.15 messages

### Purpose
Stores in-app chat messages related to orders and service coordination.

### Key attributes
- id
- order_id
- sender_profile_id
- receiver_profile_id
- message_type
- content
- attachment_url
- status
- is_read
- read_at
- deleted_at
- created_at, updated_at

### Relationships
- Many messages belong to one order.
- Each message is sent by one profile and received by one profile.

### Foreign keys
- order_id -> orders.id
- sender_profile_id -> profiles.id
- receiver_profile_id -> profiles.id

### Indexes
- order_id + created_at
- sender_profile_id + receiver_profile_id
- is_read
- status

---

## 3.16 notifications

### Purpose
Tracks system notifications sent to users about orders, payments, commissions, partners, reviews, and platform alerts.

### Key attributes
- id
- recipient_profile_id
- order_id
- notification_type
- title
- body
- is_read
- read_at
- status
- action_url
- deleted_at
- created_at, updated_at

### Relationships
- Many notifications are addressed to one profile.
- Many notifications may reference one order.

### Foreign keys
- recipient_profile_id -> profiles.id
- order_id -> orders.id

### Indexes
- recipient_profile_id + is_read + created_at
- notification_type + status
- created_at

---

## 3.17 system_configs

### Purpose
Stores configuration values for platform behavior, feature flags, and operational settings.

### Key attributes
- id
- key
- value
- description
- category
- is_active
- deleted_at
- created_at, updated_at

### Relationships
- No direct foreign key relationships.
- Serves as a platform-wide configuration table.

### Foreign keys
- None

### Indexes
- key (unique)
- category + is_active

---

## 4. Relationship Matrix

| Parent | Child | Cardinality | Notes |
| --- | --- | --- | --- |
| profiles | addresses | 1:N | One user can save many addresses |
| profiles | wallets | 1:1 | One profile owns one wallet |
| profiles | services | 1:N | One provider can publish many services |
| profiles | orders as customer | 1:N | One user can place many orders |
| profiles | orders as provider | 1:N | One user can receive many orders |
| profiles | provider_certifications | 1:N | One provider can have many certifications |
| profiles | partners | 1:1 | One profile can be one partner |
| profiles | referrals as inviter | 1:N | One user can invite many others |
| profiles | referrals as invited | 1:N | One user can be invited by many others |
| profiles | messages | 1:N | One profile can send or receive many messages |
| profiles | notifications | 1:N | One profile can receive many notifications |
| categories | services | 1:N | One category groups many services |
| categories | orders | 1:N | One category can be used by many orders |
| addresses | orders | 1:N | One address can be reused by many orders |
| services | orders | 1:N | One service can be ordered many times |
| orders | order_images | 1:N | One order can have many images |
| orders | payments | 1:N | One order can have one primary payment record |
| orders | reviews | 1:N | One order can have one review |
| orders | messages | 1:N | One order can contain many messages |
| orders | notifications | 1:N | One order can trigger many notifications |
| orders | commissions | 1:N | One order can create many commissions |
| partners | commissions | 1:N | One partner can earn many commissions |
| partners | partners | 1:N self-reference | One partner can have many child partners |
| referrals | commissions | 1:N | One referral can influence many commissions |

---

## 5. Index Strategy Summary

The ER model uses indexes to support:
- User lookup by authentication identity and profile identity
- Service discovery by provider, category, and status
- Order lifecycle queries by status and scheduled time
- Financial traceability by wallet and reference object
- Partner growth reporting by partner and settlement state
- Messaging retrieval by order and participant
- Notification delivery by recipient and read state

### Common index patterns
- Foreign key indexes for join-heavy relationships
- Composite indexes for status-based filtering
- Unique indexes for identity and business uniqueness
- Temporal indexes for recent activity and reporting

---

## 6. Design Notes

### 6.1 Soft delete strategy
Soft delete is applied to business entities such as profiles, services, orders, partners, referrals, and reviews. Financial audit tables such as wallet transactions and commissions are retained for traceability and are not removed casually.

### 6.2 RLS readiness
The ER model is structured so that access control can be enforced by ownership and role, especially for profiles, wallets, orders, messages, payments, notifications, and partner data.

### 6.3 Financial integrity
The model separates balance state from transaction history. Wallets hold current balances while wallet_transactions preserve an immutable movement log.

### 6.4 Growth and AI readiness
The model supports future AI features through clear links between orders, services, profiles, notifications, and partner activity. It is also ready for operational analytics through structured history and status tracking.
