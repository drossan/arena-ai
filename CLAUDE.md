# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ArenaAI** is a real-time AI model battle platform. Users choose a topic, pick two AI models to debate in a virtual arena, and spectators vote live on the winner. The experience evokes classic fighting games (Street Fighter) with a cyberpunk neon aesthetic.

*"Street Fighter, but with AI models."*

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend & Backend | **Next.js 14** (App Router) |
| Real-time database | **Convex** — sync state across all spectators |
| AI models | **OpenRouter** — unified API to multiple LLMs (via OpenAI SDK) |
| Styles | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |

---

## Development Commands

```bash
# Install dependencies (once project is initialized)
npm install

# Run development server
npm run dev

# Run Convex dev (in separate terminal)
npx convex dev

# Initialize Convex (first time)
npx convex dev --once

# Deploy Convex to production
npx convex deploy
```

---

## Architecture Overview

### Battle Flow

1. Room creator picks topic + 2 models
2. **3 rounds**, **2 turns each**
3. Each turn: model streams argument token-by-token to all spectators
4. Public votes after each round
5. Model with most HP wins

### HP & Damage System

- Each model starts at 100 HP
- **Referee Agent** classifies each argument as a "hit type":
  - ⚡ Lightning Strike — data with sources (High damage)
  - 🔥 Fire Slash — creative analogy (Med-high)
  - 💥 Counter Attack — direct counter (Medium)
  - 🫧 Weak Blow — vague/generic (Low)
- Public votes determine HP lost by loser after each round

---

## Multi-Agent System

This project uses a multi-agent architecture:

### Agent: Orchestrator
- Main coordinator of battle flow
- Decides when to launch each model's turn
- Calls sub-agents in sequence
- Updates battle state in Convex

### Agent: Fighter (x2 per battle)
- One agent per battling model
- Receives debate context, calls assigned model via OpenRouter
- Streams tokens one-by-one to Convex
- Instantiated dynamically based on room participants

### Agent: Referee
- Activates after each argument completes
- Analyzes text and classifies hit type
- Calculates damage, updates HP
- Use cheaper model (Haiku, Mistral-7B) for cost efficiency

### Agent: Commentator (Phase 3)
- Activates at battle end
- Generates dramatic summary, best argument highlight, shareable card

---

## MCP Servers Required

### Essential
- `@modelcontextprotocol/server-filesystem` — Read/write project files
- `@convex/mcp-server` — Read/write Convex schema, execute mutations/queries, debug real-time data

### Highly Useful
- `@modelcontextprotocol/server-fetch` — Test OpenRouter API calls from CLI
- `@modelcontextprotocol/server-github` — Manage PRs, issues, branches by team
- `@browsertools/mcp` or Puppeteer MCP — Visual debugging of animations and live arena

---

## Convex Data Model

### rooms
- `topic`: string
- `status`: `waiting | debating | finished`
- `currentTurn`: number
- `totalRounds`: number
- `createdAt`: timestamp

### participants
- `roomId`: id
- `modelId`: string (OpenRouter ID, e.g., `openai/gpt-4o`)
- `modelName`: string (display name)
- `color`: string (character color)
- `hp`: number
- `votes`: number

### messages
- `roomId`: id
- `participantId`: id
- `content`: string (updated token-by-token during streaming)
- `turnNumber`: number
- `attackType`: string (classified by referee)
- `isStreaming`: boolean
- `createdAt`: timestamp

### viewers
- `roomId`: id
- `count`: number

---

## Critical Streaming Flow

The key technical challenge — streaming tokens to all spectators in real-time:

1. Room created → persisted to Convex
2. Next.js API route calls OpenRouter with streaming enabled
3. **Each token** received → written to Convex via mutation
4. All spectators receive token instantly via Convex reactive queries
5. Turn ends → referee classifies argument → updates HP
6. Next turn triggered automatically

**Note:** Convex's reactivity eliminates need for manual WebSockets. Use `useQuery` for automatic subscriptions.

---

## AI Model Identities

Each model has a visual character identity:

| Model | Character |
|-------|-----------|
| GPT-4o | Electric Blue Warrior |
| Claude 3.5 Sonnet | Purple Warrior |
| Gemini Pro | Neon Green Warrior |
| Llama 3 | Orange Wild Warrior |
| Mistral | Ice White Warrior |

---

## State Machine

Battle states managed through Convex as single source of truth:

```
waiting → round_1_turn_a → round_1_turn_b → voting →
round_2_turn_a → round_2_turn_b → voting →
round_3_turn_a → round_3_turn_b → voting → finished
```

---

## Key Skills Reference

When working on this codebase:

- **Convex schema design** — Reactive queries, optimistic mutations, filtered queries
- **Next.js streaming** — Proper use of ReadableStream for token-by-token streaming
- **OpenRouter integration** — Uses `openrouter-kit` npm package for native OpenRouter API access, error handling for model failures
- **Framer Motion** — Battle animations, HP transitions, hit effects
- **State machines** — Battle states with Convex as truth source
- **Roleplay prompt engineering** — System prompts for Fighter agents to maintain personality consistency

---

## Visual Style

- Background: Deep black with animated particles
- Palette: Neon red/blue per side, gold for victories
- Typography: Aggressive futuristic (Rajdhani/Orbitron)
- Effects: Screen shake, particle explosions on hits, character recoil on damage
- Victory: Epic neon confetti + victory music
