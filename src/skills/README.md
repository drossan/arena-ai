# ArenaAI Skills Reference

This directory contains skills documentation for the ArenaAI project. Each skill covers a specific technical area required for building the platform.

## Code Skills

### [Convex Schema & Mutations](./convex-schema.md)
Designing reactive schemas, writing optimistic mutations, and creating filtered queries for real-time data synchronization.

### [Next.js Streaming](./nextjs-streaming.md)
API routes, server actions, and proper streaming handling with ReadableStream for real-time token delivery.

### [OpenRouter Streaming](./openrouter-streaming.md)
Integrating with OpenRouter for multi-model AI access. Uses the native `openrouter-kit` npm package for direct API integration, handling streaming responses and managing errors with fallbacks.

### [Framer Motion](./framer-motion.md)
Battle animations, HP transitions, hit effects, and visual feedback using Framer Motion.

## Architecture Skills

### [Real-Time State Machine](./state-machine.md)
Modeling battle states (waiting → round_1 → voting → round_2 → ... → finished) with Convex as the single source of truth.

### [Prompt Engineering](./prompt-engineering.md)
Constructing system prompts for Fighter agents that make AI models argue from their "personality" while maintaining consistency.

### [Multi-Tenant Rooms](./multi-tenant-rooms.md)
Managing multiple simultaneous battle rooms without state mixing, ensuring isolation between different battles.

## Product Skills

### [Convex Reactivity](./convex-reactivity.md)
Understanding how Convex eliminates the need for manual WebSockets and leveraging `useQuery` for automatic subscriptions.

### [Rate Limiting](./rate-limiting.md)
Managing OpenRouter token rate limits per model to prevent battles from failing mid-stream due to API throttling.
