# WebSocket vs Convex Reactivity

## Overview

This skill explains how Convex eliminates the need for manual WebSockets by providing automatic reactivity through `useQuery` subscriptions.

## Core Concepts

### Traditional WebSocket Approach (What We DON'T Need)

```typescript
// ❌ Old way with manual WebSockets
const ws = new WebSocket('wss://api.arenaai.app/rooms/abc')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  setMessages(prev => [...prev, data])
}

// Need to handle:
// - Connection drops
// - Reconnection logic
// - Message buffering
// - Subscription management
// - Error states
```

### Convex Reactive Approach (What We Use)

```typescript
// ✅ Convex way - automatic reactivity
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

function BattleRoom({ roomId }: { roomId: string }) {
  // Automatically subscribes to updates!
  const messages = useQuery(api.messages.getByRoom, { roomId })

  // That's it! No WebSocket code needed.
  return (
    <div>
      {messages?.map(msg => <Message key={msg._id} {...msg} />)}
    </div>
  )
}
```

## How Convex Reactivity Works

### 1. Query Definition

```typescript
// convex/queries.ts
import { query } from './_generated/server'

export const listMessages = query({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    // Convex tracks which documents this reads
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_room', q => q.eq('roomId', args.roomId))
      .collect()

    return messages
  }
})
```

### 2. Automatic Subscriptions

```typescript
// Client component
function BattleRoom({ roomId }: { roomId: string }) {
  // Convex automatically:
  // 1. Subscribes to the query
  // 2. Re-runs when relevant data changes
  // 3. Returns updated results
  const messages = useQuery(api.messages.listMessages, { roomId })

  // Real-time updates happen automatically!
}
```

### 3. Mutation Triggers Updates

```typescript
// When a mutation writes to 'messages':
const sendMessage = useMutation(api.messages.send)

// This mutation updates the messages table
await sendMessage({ roomId, content: 'Hello!' })

// ← useQuery automatically re-runs and returns new data!
```

## ArenaAI Patterns

### Real-Time Token Streaming

```typescript
// Component displaying streaming argument
function ArgumentStream({ roomId, participantId }: { roomId: string; participantId: string }) {
  const message = useQuery(api.messages.getCurrentStreaming, { roomId, participantId })

  // Each token that arrives in Convex triggers an automatic update!
  return (
    <div className="argument-content">
      {message?.content || 'Waiting...'}
      {message?.isStreaming && <CursorBlink />}
    </div>
  )
}

// Convex query
export const getCurrentStreaming = query({
  args: { roomId: v.id('rooms'), participantId: v.id('participants') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_participant', q => q.eq('participantId', args.participantId))
      .filter(q => q.eq(q.field('isStreaming'), true))
      .first()
  }
})
```

### Real-Time HP Updates

```typescript
// HP bars update automatically when mutations apply damage
function HPDisplay({ roomId }: { roomId: string }) {
  const participants = useQuery(api.participants.getByRoom, { roomId })

  return (
    <div className="flex gap-8">
      {participants?.map(p => (
        <HPBar key={p._id} current={p.hp} max={p.maxHp} />
      ))}
    </div>
  )
}

// When referee applies damage:
// await ctx.db.patch(participantId, { hp: currentHp - damage })
// The HP bar updates automatically!
```

### Live Viewer Count

```typescript
function ViewerCount({ roomId }: { roomId: string }) {
  // Viewer count updates in real-time as people join/leave
  const viewers = useQuery(api.viewers.getCount, { roomId })

  return (
    <div className="text-sm text-gray-400">
      👥 {viewers} watching
    </div>
  )
}
```

### Battle State Transitions

```typescript
function BattleScreen({ roomId }: { roomId: string }) {
  const battle = useQuery(api.battles.getState, { roomId })

  // UI automatically updates when battle state changes
  switch (battle?.state) {
    case 'waiting':
      return <Lobby />
    case 'round_1_a':
    case 'round_1_b':
    case 'round_2_a':
    case 'round_2_b':
    case 'round_3_a':
    case 'round_3_b':
      return <DebateView />
    case 'voting_1':
    case 'voting_2':
    case 'voting_3':
      return <VotingPanel />
    case 'finished':
      return <Results battle={battle} />
    default:
      return <Loading />
  }
}
```

### Optimistic Updates (Optional)

```typescript
// For instant feedback while mutation processes
function VoteButton({ participantId }: { participantId: string }) {
  const vote = useMutation(api.votes.cast)

  return (
    <button
      onClick={() => {
        // Optimistic update - UI updates before server confirms
        vote({ participantId }, {
          optimistic: (current) => ({
            ...current,
            votes: (current.votes || 0) + 1
          })
        })
      }}
    >
      Vote
    </button>
  )
}
```

## Key Advantages Over WebSockets

| Feature | WebSocket | Convex |
|---------|-----------|--------|
| Connection management | Manual (reconnect, heartbeat) | Automatic |
| Data sync | Manual parsing and state updates | Automatic |
| Error handling | Custom logic needed | Built-in |
| Offline support | Complex to implement | Automatic caching |
| Subscription cleanup | Manual | Automatic on unmount |
| Real-time filtering | Server-side logic required | Built-in to queries |

## Best Practices

1. **Don't mix with WebSockets** - Convex replaces WebSocket needs entirely
2. **Let useQuery handle subscriptions** - No need for useEffect cleanup
3. **Structure queries by data access patterns** - Index for efficient reactivity
4. **Use filtering in queries** - Instead of client-side filtering
5. **Trust the reactivity** - If data changes, components WILL update
6. **Minimize query data** - Only fetch what you need for each component
