# OpenRouter Rate Limiting

## Overview

This skill covers managing token rate limits per model to prevent battles from failing mid-stream due to API throttling.

## Core Concepts

### OpenRouter Rate Limits

Different models have different rate limits:

```typescript
// src/lib/rate-limits.ts
export const RATE_LIMITS = {
  'openai/gpt-4o': {
    tokensPerMinute: 150000,  // TPM (Tokens Per Minute)
    requestsPerMinute: 500,   // RPM (Requests Per Minute)
    maxTokens: 128000,        // Context window
  },
  'anthropic/claude-3.5-sonnet': {
    tokensPerMinute: 200000,
    requestsPerMinute: 100,
    maxTokens: 200000,
  },
  'google/gemini-pro': {
    tokensPerMinute: 60000,
    requestsPerMinute: 60,
    maxTokens: 91728,
  },
  'meta-llama/llama-3-70b': {
    tokensPerMinute: 6000,
    requestsPerMinute: 60,
    maxTokens: 8192,
  },
  'mistralai/mistral-large': {
    tokensPerMinute: 80000,
    requestsPerMinute: 50,
    maxTokens: 32768,
  },
} as const
```

### Token Usage Tracking

```typescript
// src/lib/token-tracker.ts
interface TokenUsage {
  modelId: string
  tokensUsed: number
  windowStart: number
  requestCount: number
}

class TokenTracker {
  private usage: Map<string, TokenUsage> = new Map()
  private windowMs = 60000 // 1 minute sliding window

  canMakeRequest(modelId: string, estimatedTokens: number): boolean {
    const limits = RATE_LIMITS[modelId as keyof typeof RATE_LIMITS]
    if (!limits) return false

    const now = Date.now()
    const usage = this.getUsage(modelId, now)

    // Check token limit
    if (usage.tokensUsed + estimatedTokens > limits.tokensPerMinute) {
      return false
    }

    // Check request limit
    if (usage.requestCount >= limits.requestsPerMinute) {
      return false
    }

    return true
  }

  recordUsage(modelId: string, tokensUsed: number): void {
    const now = Date.now()
    const usage = this.getUsage(modelId, now)

    usage.tokensUsed += tokensUsed
    usage.requestCount += 1
  }

  private getUsage(modelId: string, now: number): TokenUsage {
    let usage = this.usage.get(modelId)

    // Reset window if expired
    if (!usage || now - usage.windowStart > this.windowMs) {
      usage = {
        modelId,
        tokensUsed: 0,
        windowStart: now,
        requestCount: 0,
      }
      this.usage.set(modelId, usage)
    }

    return usage
  }

  getWaitTimeMs(modelId: string): number {
    const usage = this.usage.get(modelId)
    if (!usage) return 0

    const limits = RATE_LIMITS[modelId as keyof typeof RATE_LIMITS]
    if (!limits) return 0

    // Calculate when to retry based on window expiration
    const timeUntilReset = this.windowMs - (Date.now() - usage.windowStart)

    // If token limited, estimate wait time
    if (usage.tokensUsed >= limits.tokensPerMinute) {
      return timeUntilReset
    }

    // If request limited, wait for window to expire
    if (usage.requestCount >= limits.requestsPerMinute) {
      return timeUntilReset
    }

    return 0
  }
}

export const tokenTracker = new TokenTracker()
```

## ArenaAI Patterns

### Fighter Agent with Rate Limiting

```typescript
// src/agents/fighter-rate-limited.ts
import OpenAI from 'openai'
import { tokenTracker } from '@/lib/token-tracker'

export class RateLimitedFighterAgent {
  private client: OpenAI

  constructor(
    private modelId: string,
    apiKey: string
  ) {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
    })
  }

  async *generateArgument(topic: string, history: Message[]): AsyncGenerator<string> {
    // Estimate tokens (rough estimate: 1 token ≈ 4 characters)
    const estimatedTokens = Math.ceil((topic.length + 500) / 4)

    // Check rate limit
    if (!tokenTracker.canMakeRequest(this.modelId, estimatedTokens)) {
      const waitTime = tokenTracker.getWaitTimeMs(this.modelId)

      // Wait and retry
      await this.delay(waitTime + 1000)
    }

    let tokensUsed = 0

    try {
      const stream = await this.client.chat.completions.create({
        model: this.modelId,
        messages: this.buildMessages(topic, history),
        stream: true,
        max_tokens: 500,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          tokensUsed += Math.ceil(content.length / 4)
          yield content
        }
      }

      // Record actual usage
      tokenTracker.recordUsage(this.modelId, tokensUsed)
    } catch (error) {
      if (this.isRateLimitError(error)) {
        // Retry after wait time
        const waitTime = tokenTracker.getWaitTimeMs(this.modelId)
        await this.delay(waitTime + 2000)

        // Retry once
        yield* this.generateArgument(topic, history)
      } else {
        throw error
      }
    }
  }

  private buildMessages(topic: string, history: Message[]) {
    return [
      {
        role: 'system',
        content: this.getSystemPrompt(),
      },
      {
        role: 'user',
        content: `Topic: ${topic}`,
      },
      ...history,
    ]
  }

  private getSystemPrompt(): string {
    // Model-specific personality
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('rate limit') ||
             error.message.includes('429')
    }
    return false
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### Pre-Battle Rate Limit Check

```typescript
// src/lib/battle-validator.ts
export function validateBattleCanStart(
  modelA: string,
  modelB: string,
  totalRounds: number = 3
): { canStart: boolean; reason?: string } {
  const estimatedTokensPerTurn = 200 // Average tokens per argument
  const turnsPerBattle = totalRounds * 2 // 2 turns per round

  const estimatedTotalTokens = estimatedTokensPerTurn * turnsPerBattle

  // Check both models
  for (const model of [modelA, modelB]) {
    const limits = RATE_LIMITS[model as keyof typeof RATE_LIMITS]

    if (!limits) {
      return { canStart: false, reason: `Unknown model: ${model}` }
    }

    if (estimatedTotalTokens > limits.tokensPerMinute) {
      return {
        canStart: false,
        reason: `Battle would exceed rate limit for ${model}. Consider fewer rounds.`
      }
    }
  }

  return { canStart: true }
}
```

### Battle Orchestrator with Delays

```typescript
// src/agents/orchestrator-rate-limited.ts
export class RateLimitedOrchestrator {
  private readonly TURN_DELAY_MS = 2000 // Pause between turns
  private readonly ROUND_DELAY_MS = 5000 // Pause between rounds

  async runTurn(
    roomId: string,
    participantId: string,
    modelId: string
  ): Promise<void> {
    // Check if we can proceed
    while (!tokenTracker.canMakeRequest(modelId, 500)) {
      const waitTime = tokenTracker.getWaitTimeMs(modelId)

      // Update battle state to "waiting for rate limit"
      await this.convex.mutation('battles:setStatus', {
        roomId,
        status: 'rate_limited',
        waitUntil: Date.now() + waitTime,
      })

      await this.delay(waitTime + 1000)
    }

    // Proceed with turn
    const fighter = new RateLimitedFighterAgent(modelId, this.apiKey)
    const stream = fighter.generateArgument(topic, history)

    for await (const token of stream) {
      await this.convex.mutation('battles:streamToken', { roomId, token })
    }

    // Delay before next turn
    await this.delay(this.TURN_DELAY_MS)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### Client-Side Rate Limit Display

```typescript
// src/components/RateLimitWarning.tsx
function RateLimitWarning({ modelId }: { modelId: string }) {
  const status = useQuery(api.rateLimits.getStatus, { modelId })

  if (!status?.limited) return null

  return (
    <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
      <p className="text-yellow-400">
        ⚠️ Rate limit reached for {status.modelName}
      </p>
      <p className="text-sm text-gray-400">
        Resuming in {Math.ceil(status.waitSeconds)} seconds...
      </p>
    </div>
  )
}
```

## Best Practices

1. **Check before streaming** - Validate rate limits before starting each turn
2. **Add delays between turns** - Prevent hitting burst limits
3. **Use shorter prompts** - Reduce token usage per request
4. **Monitor usage** - Track tokens per model in real-time
5. **Show status to users** - Display "rate limited" status when waiting
6. **Implement graceful degradation** - Fall back to faster/cheaper models if needed
