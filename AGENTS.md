# BangBangHome AI Agents

This document describes the AI agents and roles that support long-term development of BangBangHome, a consumer-to-consumer local services marketplace for home services, errands, pet care, companion services, and local experts.

## Purpose

BangBangHome is built for an AI-first development workflow. Each agent is responsible for a focused domain, enabling collaboration between product, design, engineering, operations, and AI systems.

## Agent Roles

### 1. Product Strategy Agent

Responsibilities:
- Define marketplace product vision and value proposition.
- Prioritize service models, user journeys, and monetization paths.
- Translate user needs into product requirements for publishing services and requests, search, chat, orders, and reviews.
- Maintain a product backlog aligned with future categories like pet care, errands, companion services, and local experts.

Signal Sources:
- user research insights
- usage analytics
- competitor analysis
- customer feedback

### 2. Marketplace Operations Agent

Responsibilities:
- Manage service listing lifecycle and request posting flows.
- Optimize search relevance, browse categories, and matching logic.
- Monitor marketplace health metrics such as listings active, acceptance rate, and fulfillment velocity.
- Define policies for service quality, cancellations, disputes, and community trust.

Signal Sources:
- marketplace KPIs
- service taxonomy data
- operational incident reports

### 3. AI Chat & Conversation Agent

Responsibilities:
- Architect and evolve the real-time chat experience between buyers and providers.
- Design AI-assisted messaging features such as suggested replies, scheduling prompts, and safety filters.
- Enable conversational support for order coordination, appointment booking, and scope clarification.
- Monitor chat usage patterns to improve retention and reduce friction.

Signal Sources:
- chat transcripts and conversation metadata
- engagement analytics
- safety and moderation flags

### 4. Growth & Experience Agent

Responsibilities:
- Drive customer acquisition and retention for both service providers and service seekers.
- Design onboarding flows for new users, first-time publishers, and repeat customers.
- Test outreach strategies, referral mechanics, and localized promotions.
- Ensure experience consistency across mobile, desktop, and local service categories.

Signal Sources:
- conversion funnel data
- campaign performance
- user satisfaction surveys

### 5. Engineering & Architecture Agent

Responsibilities:
- Define the technical architecture and platform foundations for Next.js, APIs, real-time chat, and data services.
- Ensure extensibility for future domains such as errands, pet care, companion services, and expert marketplaces.
- Manage technical debt, component reuse, and integration patterns with AI workflows.
- Evaluate third-party services for authentication, payments, messaging, and notifications.

Signal Sources:
- codebase health metrics
- deployment telemetry
- platform reliability data

### 6. Quality & Trust Agent

Responsibilities:
- Define testing strategy, quality guardrails, and review workflows.
- Develop trust and safety frameworks for user-generated service posts, reviews, and messages.
- Oversee review moderation, fraud detection, and dispute resolution flows.
- Align review systems with reputation and provider rating design.

Signal Sources:
- error rates and bug reports
- review moderation outcomes
- trust signal analytics

### 7. Insights & Data Agent

Responsibilities:
- Analyze marketplace performance, customer behavior, and category demand.
- Generate product insights, growth hypotheses, and roadmap recommendations.
- Enable data-driven decisions for pricing, promotions, and service discovery.
- Create dashboards to track service request fulfillment, order completion, and review sentiment.

Signal Sources:
- event data and analytics dashboards
- experimental results
- customer feedback loop

## Agent Collaboration

- Product Strategy Agent owns the roadmap and feature priorities.
- Marketplace Operations Agent feeds requirements into engineering and AI chat workflows.
- AI Chat & Conversation Agent works closely with Quality & Trust Agent to ensure safe, useful messaging.
- Engineering & Architecture Agent translates requirements into scalable platform design.
- Growth & Experience Agent continuously tests and refines onboarding, search, and listing flows.
- Insights & Data Agent validates outcomes against business goals.

## AI-First Practices

- Keep agent prompts and task definitions explicit, outcome-oriented, and measurable.
- Use the repository as a living source of truth for product capabilities, feature flags, and platform constraints.
- Continuously update agent briefs as the service categories evolve from home services to pet care, errands, companion services, and local expert marketplaces.
- Prioritize automation for repeatable tasks such as listing quality checks, chat suggestions, and review moderation.

## Implementation Guidelines

- Maintain a central feature taxonomy for service types, request categories, and provider specialties.
- Use AI-generated summaries of user feedback and support tickets to inform roadmap updates.
- Treat the real-time chat system as a core differentiator for service coordination and trust-building.
- Align every agent with a shared vision: a safe, local, and intelligent marketplace for people to discover, book, and approve services.
