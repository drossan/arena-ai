# Multi-Tenant Rooms

## Overview

This skill covers managing multiple simultaneous battle rooms without state mixing, ensuring isolation between different battles.

## Core Concepts

### Room Isolation Principles

1. **Each room is独立的** - No shared state between rooms
2. **Participants belong to rooms** - Always filter by roomId
3. **Messages are scoped** - Never query messages across rooms
4. **Viewers per room** - Track spectator counts separately

### Convex Schema for Multi-Tenancy

```typescript
// convex/schema.ts
export default defineSchema({
  // Room is the root entity
  rooms: defineTable({
    topic: v.string(),
    status: v.union(v.literal('waiting'), v.literal('debating'), v.literal('finished')),
    currentRound: v.number(),
    currentTurn: v.number(),
    createdAt: v.number(),
    createdBy: v.optional(v.string()), // Optional user ID
  })
    .index('by_status', ['status'])
    .index('by_createdAt', ['createdAt']),

  // All participants reference a room
  participants: defineTable({
    roomId: v.id('rooms'),
    modelId: v.string(),
    modelName: v.string(),
    color: v.string(),
    hp: v.number(),
    maxHp: v.number(),
    votes: v.number(),
    side: v.union(v.literal('A'), v.literal('B')),
  })
    .index('by_room', ['roomId'])
    .index('by_room_side', ['roomId', 'side']),

  // All messages belong to a room
  messages: defineTable({
    roomId: v.id('rooms'),
    participantId: v.id('participants'),
    content: v.string(),
    turnNumber: v.number(),
    roundNumber: v.number(),
    attackType: v.optional(v.string()),
    isStreaming: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_room', ['roomId'])
    .index('by_room_turn', ['roomId', 'turnNumber']),

  // Viewers tracked per room
  viewers: defineTable({
    roomId: v.id('rooms'),
    sessionId: v.string(), // Browser session ID
    joinedAt: v.number(),
  })
    .index('by_room', ['roomId'])
    .index('by_session', ['sessionId']),
})
```

## ArenaAI Patterns

### Room Creation with Isolation

```typescript
// convex/mutations/rooms.ts
import { mutation } from '../_generated/server'

export const createRoom = mutation({
  args: {
    topic: v.string(),
    modelA: v.string(),
    modelB: v.string(),
  },
  handler: async (ctx, args) => {
    // Create the room
    const roomId = await ctx.db.insert('rooms', {
      topic: args.topic,
      status: 'waiting',
      currentRound: 0,
      currentTurn: 0,
      createdAt: Date.now(),
    })

    // Create participant A
    await ctx.db.insert('participants', {
      roomId,
      modelId: args.modelA,
      modelName: getModelName(args.modelA),
      color: getModelColor(args.modelA),
      hp: 100,
      maxHp: 100,
      votes: 0,
      side: 'A',
    })

    // Create participant B
    await ctx.db.insert('participants', {
      roomId,
      modelId: args.modelB,
      modelName: getModelName(args.modelB),
      color: getModelColor(args.modelB),
      hp: 100,
      maxHp: 100,
      votes: 0,
      side: 'B',
    })

    return roomId
  }
})
```

### Room-Scoped Queries

```typescript
// convex/queries/rooms.ts
import { query } from '../_generated/server'

export const getRoomById = query({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) return null

    // Always filter participants by roomId
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_room', (q) => q.eq('roomId', args.roomId))
      .collect()

    // Always filter messages by roomId
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_room', (q) => q.eq('roomId', args.roomId))
      .collect()

    return {
      ...room,
      participants,
      messages,
    }
  }
})
```

### Viewer Management Per Room

```typescript
// convex/mutations/viewers.ts
import { mutation } from '../_generated/server'

export const joinRoom = mutation({
  args: {
    roomId: v.id('rooms'),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already in room
    const existing = await ctx.db
      .query('viewers')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first()

    if (existing) {
      // Leave previous room
      await ctx.db.delete(existing._id)
    }

    // Join new room
    await ctx.db.insert('viewers', {
      roomId: args.roomId,
      sessionId: args.sessionId,
      joinedAt: Date.now(),
    })

    return args.roomId
  }
})

export const leaveRoom = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const viewer = await ctx.db
      .query('viewers')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .first()

    if (viewer) {
      await ctx.db.delete(viewer._id)
    }
  }
})
```

### Room Cleanup After Battle

```typescript
// convex/mutations/cleanup.ts
import { mutation } from '../_generated/server'
import { v } from 'convex/values'

export const cleanupRoom = mutation({
  args: {
    roomId: v.id('rooms'),
    retainDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { roomId, retainDays = 7 } = args
    const cutoffTime = Date.now() - (retainDays * 24 * 60 * 60 * 1000)

    const room = await ctx.db.get(roomId)
    if (!room || room.createdAt > cutoffTime) {
      throw new Error('Room not eligible for cleanup')
    }

    // Delete all viewers
    const viewers = await ctx.db
      .query('viewers')
      .withIndex('by_room', (q) => q.eq('roomId', roomId))
      .collect()

    for (const viewer of viewers) {
      await ctx.db.delete(viewer._id)
    }

    // Delete all messages
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_room', (q) => q.eq('roomId', roomId))
      .collect()

    for (const message of messages) {
      await ctx.db.delete(message._id)
    }

    // Delete all participants
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_room', (q) => q.eq('roomId', roomId))
      .collect()

    for (const participant of participants) {
      await ctx.db.delete(participant._id)
    }

    // Delete the room
    await ctx.db.delete(roomId)
  }
})
```

### Client-Side Room Management

```typescript
// src/hooks/useRoom.ts
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useEffect, useRef } from 'react'

export function useRoom(roomId: string) {
  const room = useQuery(api.rooms.getRoomById, { roomId })
  const joinRoom = useMutation(api.viewers.joinRoom)
  const leaveRoom = useMutation(api.viewers.leaveRoom)

  const sessionId = useRef(getSessionId()).current

  useEffect(() => {
    // Join room when component mounts
    joinRoom({ roomId, sessionId })

    // Leave room when component unmounts
    return () => {
      leaveRoom({ sessionId })
    }
  }, [roomId, joinRoom, leaveRoom])

  return room
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('arena-session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('arena-session', sessionId)
  }
  return sessionId
}
```

## Best Practices

1. **Always filter by roomId** - Never query across rooms
2. **Use compound indexes** - Create indexes like `by_room_side` for efficient queries
3. **Clean up old rooms** - Don't let data grow indefinitely
4. **Session-based viewers** - Use sessionStorage to track viewers
5. **Validate room ownership** - Ensure actions only affect the correct room
6. **Use transactions** - When creating room + participants together
