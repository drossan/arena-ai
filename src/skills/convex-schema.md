# Convex Schema & Mutations Skill

## Overview

This skill covers designing reactive schemas, writing optimistic mutations, and creating filtered queries for real-time data synchronization in ArenaAI.

## Core Concepts

### Schema Design

Convex uses a declarative schema defined in `convex/schema.ts`. All documents have an `_id` and `_creationTime` field automatically.

```typescript
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  rooms: defineTable({
    topic: v.string(),
    status: v.union(v.literal('waiting'), v.literal('debating'), v.literal('finished')),
    currentTurn: v.number(),
    totalRounds: v.number(),
  }).index('by_status', ['status']),
})
```

### Mutations

Mutations modify data and are executed transactionally:

```typescript
// convex/rooms.ts
import { mutation } from './_generated/server'

export const createRoom = mutation({
  args: { topic: v.string(), modelA: v.string(), modelB: v.string() },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert('rooms', {
      topic: args.topic,
      status: 'waiting',
      currentTurn: 0,
      totalRounds: 3,
    })
    return roomId
  }
})
```

### Queries

Queries read data and automatically re-run when dependencies change:

```typescript
import { query } from './_generated/server'

export const getRoom = query({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roomId)
  }
})
```

## ArenaAI Patterns

### Streaming Token-by-Token

For real-time argument streaming, use incremental updates:

```typescript
export const streamToken = mutation({
  args: { roomId: v.id('rooms'), content: v.string() },
  handler: async (ctx, args) => {
    const message = await ctx.db.query('messages')
      .withIndex('by_room', q => q.eq('roomId', args.roomId))
      .filter(q => q.eq(q.field('isStreaming'), true))
      .first()

    if (message) {
      await ctx.db.patch(message._id, {
        content: message.content + args.content
      })
    }
  }
})
```

### Optimistic Updates

Update UI immediately before server confirmation:

```typescript
// On client side
const optimisticVote = useMutation(api.votes.castVote)

const handleVote = async (participantId: string) => {
  // Optimistic update
  await optimisticVote({ participantId }, { optimistic: { participantId } })
}
```

## Best Practices

1. **Index your queries** - Add indexes for fields used in `withIndex()`
2. **Use v.union()** for enums - Better than v.string() for status fields
3. **Batch writes** - Use `ctx.db.insert()` multiple times in one mutation
4. **Validate input** - Always use `v.*` validators for args
5. **Handle relationships** - Store IDs and use separate queries for joins
