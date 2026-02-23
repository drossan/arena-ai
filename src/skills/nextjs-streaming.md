# Next.js App Router + Server Actions Streaming

## Overview

This skill covers API routes, server actions, and proper streaming handling with ReadableStream for real-time token delivery in ArenaAI.

## Core Concepts

### App Router Structure

Next.js 14 uses the App Router with route groups:

```
src/app/
├── layout.tsx
├── page.tsx
├── rooms/
│   ├── [id]/
│   │   └── page.tsx
└── api/
    └── battle/
        └── route.ts
```

### API Routes with Streaming

Create streaming API routes using ReadableStream:

```typescript
// src/app/api/battle/stream/route.ts
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { roomId, modelId } = await req.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Your streaming logic here
        for await (const chunk of openAIStream) {
          const text = chunk.choices[0]?.delta?.content || ''
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: text })}\n\n`))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### Server Actions

Server actions simplify form submissions and mutations:

```typescript
// src/app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createRoom(formData: FormData) {
  const topic = formData.get('topic') as string

  // Create room in Convex
  const roomId = await convex.mutation('rooms:create', { topic })

  revalidatePath(`/rooms/${roomId}`)
  return { roomId }
}
```

### Client-Side Streaming

Use `useEventSource` or custom hook for streaming responses:

```typescript
// src/hooks/useStream.ts
export function useStream(url: string) {
  const [data, setData] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      if (event.data === '[DONE]') {
        setIsStreaming(false)
        eventSource.close()
        return
      }

      const { token } = JSON.parse(event.data)
      setData((prev) => prev + token)
    }

    return () => eventSource.close()
  }, [url])

  return { data, isStreaming }
}
```

## ArenaAI Patterns

### Battle Orchestration Endpoint

```typescript
// src/app/api/battle/start/route.ts
export async function POST(req: NextRequest) {
  const { roomId, topic, modelA, modelB } = await req.json()

  // Initialize battle state
  await convex.mutation('battles:initialize', { roomId, topic, modelA, modelB })

  // Return stream of battle events
  return streamBattleEvents(roomId)
}
```

### Streaming to Convex

```typescript
// src/app/api/battle/turn/route.ts
export async function POST(req: NextRequest) {
  const { roomId, participantId, prompt } = await req.json()

  const openAI = new OpenAI({ baseURL: 'https://openrouter.ai/api/v1' })

  const stream = await openAI.chat.completions.create({
    model: participantId,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  })

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content || ''

          // Update Convex in real-time
          await convex.mutation('battles:streamToken', { roomId, token })

          controller.enqueue(new TextEncoder().encode(token))
        }
        controller.close()
      },
    }),
    {
      headers: { 'Content-Type': 'text/plain' }
    }
  )
}
```

## Best Practices

1. **Always close streams** - Send `[DONE]` event and close controller
2. **Handle errors gracefully** - Use try-catch and send error events
3. **Set proper headers** - Use `text/event-stream` for SSE
4. **Debounce Convex updates** - Don't write every single token if rate limited
5. **Use revalidatePath** - After mutations that affect pages
