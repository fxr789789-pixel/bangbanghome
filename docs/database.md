# Database

## Data Model Overview

The database design for BangBangHome supports user accounts, service providers, service requests, orders, reviews, favorites, chat, and notifications. It is optimized for transactional integrity, search readiness, and modular growth.

## Core Entities

### Users
- `id`
- `name`
- `email`
- `password_hash`
- `avatar_url`
- `role` (consumer, provider, hybrid)
- `location`
- `bio`
- `created_at`
- `updated_at`

### Providers
- `user_id`
- `provider_title`
- `categories`
- `services_offered`
- `availability`
- `rating`
- `profile_status`
- `verification_status`

### Service Listings
- `id`
- `provider_id`
- `title`
- `description`
- `category`
- `subcategory`
- `location`
- `price_min`
- `price_max`
- `service_type`
- `availability`
- `tags`
- `status`
- `created_at`
- `updated_at`

### Service Requests
- `id`
- `requester_id`
- `title`
- `description`
- `category`
- `preferred_date`
- `budget_min`
- `budget_max`
- `location`
- `status`
- `responses_count`
- `created_at`
- `updated_at`

### Orders
- `id`
- `buyer_id`
- `provider_id`
- `listing_id` or `request_id`
- `order_type` (listing_booking, request_match)
- `price`
- `status`
- `scheduled_at`
- `completed_at`
- `canceled_at`
- `created_at`
- `updated_at`

### Reviews
- `id`
- `order_id`
- `author_id`
- `target_user_id`
- `rating`
- `comment`
- `review_type`
- `created_at`
- `updated_at`

### Favorites
- `id`
- `user_id`
- `favorite_type` (listing, provider, request)
- `target_id`
- `created_at`

### Conversations
- `id`
- `order_id` or `request_id`
- `participant_ids`
- `created_at`
- `updated_at`

### Messages
- `id`
- `conversation_id`
- `sender_id`
- `content`
- `content_type`
- `status`
- `sent_at`
- `read_at`

### Notifications
- `id`
- `user_id`
- `type`
- `resource_type`
- `resource_id`
- `title`
- `body`
- `channel`
- `status`
- `received_at`
- `read_at`
- `created_at`

## Storage Recommendations

- Use a relational database for structured entities and transaction-safe operations.
- Consider a document store or message store for chat history if conversation volume scales independently.
- Use full-text search indexes for service listings, request descriptions, and provider profiles.
- Store notification events and delivery state in a dedicated table or event store.

## Indexing Strategy

- Index `users.email`, `providers.user_id`, and `listings.provider_id` for quick joins.
- Index listing search fields: `category`, `location`, `tags`, `status`.
- Index requests by `category`, `location`, and `status`.
- Index orders by `buyer_id`, `provider_id`, and `status`.
- Index conversations by `order_id`/`request_id` and `participant_ids`.
- Index notifications by `user_id` and `status`.

## Relationship Patterns

- One provider can own many service listings.
- One buyer can create many service requests.
- One order belongs to one buyer and one provider.
- One order can link to either a listing or a request.
- Reviews are tied to completed orders and can target either party.
- Favorites can reference providers, listings, or requests.
- Conversations map to orders or requests and contain many messages.

## Data Integrity

- Enforce referential integrity for user, listing, request, and order relationships.
- Use transactions when creating orders, messages, notifications, and review updates.
- Store status changes with timestamps for auditability.

## Mobile Considerations

- Support lightweight mobile synchronization with user-specific caches for favorites, recent chats, and notification summaries.
- Keep mobile payloads minimal by fetching only the latest relevant records and using pagination for history.
- Use shared data contracts so Android and iOS apps can rely on consistent field names and value formats.
