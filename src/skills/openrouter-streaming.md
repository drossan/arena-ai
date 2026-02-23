# OpenRouter Streaming Integration

## Overview

This skill covers integrating with **OpenRouter** for multi-model AI access, handling streaming responses, and managing errors with fallbacks.

> **Note:** ArenaAI uses the native `openrouter-kit` npm package for direct integration with OpenRouter's API.

## Core Concepts

### OpenRouter Setup

OpenRouter provides unified access to multiple LLMs (GPT-4o, Claude, Gemini, Llama, Mistral, etc.) via a single API:

```bash
npm install openrouter-kit
```

### Basic Usage

```typescript
import { OpenRouterClient } from 'openrouter-kit'

// Initialize client
const client = new OpenRouterClient({
  apiKey: process.env.OPENROUTER_API_KEY
})

// Simple chat request
const result = await client.chat({
  model: 'anthropic/claude-3.5-sonnet',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
})

console.log(result.content)
```

### Streaming Requests

```typescript
// Stream response
const result = await client.chat({
  model: 'openai/gpt-4o',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
})

for await (const chunk of result) {
  if (chunk.content) {
    process.stdout.write(chunk.content)
  }
}
```

## ArenaAI Patterns

### Fighter Agent with OpenRouter

```typescript
// src/lib/openrouter.ts
import { OpenRouterClient } from 'openrouter-kit'

export function createOpenRouterClient() {
  return new OpenRouterClient({
    apiKey: process.env.OPENROUTER_API_KEY,
  })
}

// Singleton for reuse
let clientInstance: OpenRouterClient | null = null

export function getOpenRouterClient(): OpenRouterClient {
  if (!clientInstance) {
    clientInstance = createOpenRouterClient()
  }
  return clientInstance
}
```

### Streaming in Fighter Agent

```typescript
// src/agents/fighter.ts
import { getOpenRouterClient } from '@/lib/openrouter'

export class FighterAgent {
  private client: OpenRouterClient

  constructor(private modelId: string) {
    this.client = getOpenRouterClient()
  }

  async *generateArgument(topic: string): AsyncGenerator<string> {
    const result = await this.client.chat({
      model: this.modelId,
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: `Debate: ${topic}` }
      ],
      temperature: 0.8,
      max_tokens: 500,
      stream: true,
    })

    for await (const chunk of result) {
      if (chunk.content) {
        yield chunk.content
      }
    }
  }
}
```

### Available Models

```typescript
// src/lib/openrouter.ts
export const OPENROUTER_MODELS = {
  // OpenAI
  GPT_4O: 'openai/gpt-4o',
  GPT_4O_MINI: 'openai/gpt-4o-mini',

  // Anthropic
  CLAUDE_3_5_SONNET: 'anthropic/claude-3.5-sonnet',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',
  CLAUDE_3_7_SONNET: 'anthropic/claude-3.7-sonnet',

  // Google
  GEMINI_PRO: 'google/gemini-pro',
  GEMINI_2_0_FLASH_EXP: 'google/gemini-2.0-flash-exp',

  // Meta
  LLAMA_3_70B: 'meta-llama/llama-3-70b',
  LLAMA_3_3_70B: 'meta-llama/llama-3.3-70b-instruct',

  // Mistral
  MISTRAL_LARGE: 'mistralai/mistral-large',

  // DeepSeek
  DEEPSEEK_CHAT: 'deepseek/deepseek-chat',
  DEEPSEEK_REASONER: 'deepseek/deepseek-reasoner',
} as const
```

### Error Handling & Fallbacks

```typescript
// src/lib/resilient-stream.ts
export class ResilientStream {
  private fallbackModels: string[] = [
    'openai/gpt-4o',
    'anthropic/claude-3.5-sonnet',
  ]

  async streamWithFallback(
    primaryModel: string,
    prompt: string
  ): Promise<AsyncGenerator<string>> {
    let lastError: Error | null = null

    for (const model of [primaryModel, ...this.fallbackModels]) {
      try {
        return this.streamFromModel(model, prompt)
      } catch (error) {
        lastError = error as Error
        console.warn(`Model ${model} failed, trying fallback...`)
      }
    }

    throw new Error(`All models failed: ${lastError?.message}`)
  }

  private async *streamFromModel(model: string, prompt: string): AsyncGenerator<string> {
    const result = await client.chat({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })

    for await (const chunk of result) {
      if (chunk.content) yield chunk.content
    }
  }
}
```

### Rate Limiting

```typescript
// src/lib/rate-limiter.ts
import { LRUCache } from 'lru-cache'

const rateLimiter = new LRUCache<string, number>({
  max: 500,
  ttl: 60000, // 1 minute
})

export function checkRateLimit(modelId: string, maxRequests = 10): boolean {
  const key = modelId
  const count = rateLimiter.get(key) || 0

  if (count >= maxRequests) {
    return false // Rate limited
  }

  rateLimiter.set(key, count + 1)
  return true
}
```

## Best Practices

1. **Use singleton pattern** - Reuse client instance across the application
2. **Handle stream errors** - Wrap streaming in try-catch with fallbacks
3. **Respect rate limits** - Track requests per model per minute
4. **Use shorter prompts** - Reduce token usage and cost
5. **Monitor costs** - OpenRouter charges per token, track usage
6. **Choose appropriate models** - Use cheaper models (Haiku) for simple tasks

## Sources

- [openrouter-kit npm package](https://www.npmjs.com/package/openrouter-kit)
- [OpenRouter Documentation](https://openrouter.ai/docs)
