# API

## API Design Principles

- Use a versioned, consistent API contract for web and mobile clients.
- Keep endpoints modular by domain: auth, users, marketplace, orders, reviews, chat, notifications.
- Support both REST and future GraphQL/BFF patterns as needed.
- Ensure payload consistency for Android, iOS, and web applications.

## Authentication

### POST /api/v1/auth/register
- Register a new user account.
- Accepts: name, email, password, role, location
- Returns: user profile, auth token

### POST /api/v1/auth/login
- Authenticate existing users.
- Accepts: email, password
- Returns: auth token, user profile

### POST /api/v1/auth/refresh
- Refresh auth token.
- Accepts: refresh token
- Returns: new auth token

### GET /api/v1/auth/me
- Return current authenticated user profile.
- Requires auth token.

## Users and Providers

### GET /api/v1/users/:id
- Get user profile details.

### PUT /api/v1/users/:id
- Update user profile information.

### GET /api/v1/providers
- Search provider profiles by category, location, rating.

### GET /api/v1/providers/:id
- Get provider details and service offerings.

## Marketplace

### Service Listings

#### POST /api/v1/listings
- Create a new service listing.
- Accepts: title, description, category, location, price range, availability, tags.

#### GET /api/v1/listings
- List service listings with filters.
- Supports: category, location, keyword, price range, provider_id, sort.

#### GET /api/v1/listings/:id
- Get listing detail.

#### PUT /api/v1/listings/:id
- Update an existing listing.

#### DELETE /api/v1/listings/:id
- Archive or delete a listing.

### Service Requests

#### POST /api/v1/requests
- Create a new service request.
- Accepts: title, description, category, location, budget, preferred date.

#### GET /api/v1/requests
- Browse service requests.
- Supports: category, location, status, keyword.

#### GET /api/v1/requests/:id
- Get request detail.

#### PUT /api/v1/requests/:id
- Update a request.

#### DELETE /api/v1/requests/:id
- Cancel or archive a request.

### Search

#### GET /api/v1/search
- Unified search endpoint for listings, providers, and requests.
- Supports query, category, location, sort, page, and pageSize.

## Orders

### POST /api/v1/orders
- Create a new order from a listing or request response.
- Accepts: buyer_id, provider_id, listing_id/request_id, price, schedule.

### GET /api/v1/orders
- List orders for the current user.
- Supports: status, role, sort.

### GET /api/v1/orders/:id
- Get order detail.

### PUT /api/v1/orders/:id
- Update order status or schedule.

### POST /api/v1/orders/:id/cancel
- Cancel an order with reason.

### POST /api/v1/orders/:id/complete
- Mark order as completed.

## Reviews

### POST /api/v1/reviews
- Submit a review after an order is completed.
- Accepts: order_id, target_user_id, rating, comment.

### GET /api/v1/reviews
- List reviews for a provider, user, or listing.
- Supports: target_user_id, listing_id, page.

## Favorites

### POST /api/v1/favorites
- Add a favorite listing, provider, or request.
- Accepts: favorite_type, target_id.

### GET /api/v1/favorites
- List current user favorites.

### DELETE /api/v1/favorites/:id
- Remove a favorite.

## Chat

### POST /api/v1/conversations
- Create or retrieve a conversation for an order or request.
- Accepts: order_id or request_id, participant_ids.

### GET /api/v1/conversations
- List conversations for the current user.

### GET /api/v1/conversations/:id/messages
- Retrieve messages for a conversation.
- Supports pagination.

### POST /api/v1/conversations/:id/messages
- Send a new chat message.
- Accepts: sender_id, content, content_type.

### PATCH /api/v1/conversations/:id/read
- Mark conversation messages as read.

## Notifications

### GET /api/v1/notifications
- List notifications for the current user.
- Supports: status, type, page.

### PATCH /api/v1/notifications/:id/read
- Mark a notification as read.

### POST /api/v1/notifications/subscribe
- Subscribe to notification channels and preferences.

## Mobile and Web Considerations

- Version APIs with `/api/v1/` and plan for `/api/v2/` when needed.
- Keep request and response payloads minimal for mobile efficiency.
- Use a shared authentication scheme across web, Android, and iOS.
- Implement pagination, filtering, and selective fields for list endpoints.

## Security and Validation

- Authenticate all write operations.
- Authorize users based on role and resource ownership.
- Validate input for marketplace listings, requests, orders, chat content, and reviews.
- Rate limit chat, search, and order creation endpoints.
