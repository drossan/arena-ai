import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Users table
  users: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    displayName: v.string(),
    role: v.union(v.literal('admin'), v.literal('viewer')),
    createdAt: v.number(),
    isActive: v.boolean(),
  })
    .index('by_username', ['username']),

  // Rooms
  rooms: defineTable({
    topic: v.string(),
    modelA: v.string(),
    modelB: v.string(),
    startTime: v.number(),
    status: v.union(
      v.literal('scheduled'),
      v.literal('debating'),
      v.literal('voting'),
      v.literal('finished')
    ),
    currentRound: v.optional(v.number()),
    currentTurn: v.optional(v.number()),
    createdBy: v.optional(v.id('users')), // Admin who created the room
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_startTime', ['startTime'])
    .index('by_status', ['status']),

  // Participants
  participants: defineTable({
    roomId: v.id('rooms'),
    modelId: v.string(),
    modelName: v.string(),
    color: v.string(),
    hp: v.number(),
    maxHp: v.number(),
    side: v.union(v.literal('A'), v.literal('B')),
  })
    .index('by_room', ['roomId'])
    .index('by_room_side', ['roomId', 'side']),

  // Messages
  messages: defineTable({
    roomId: v.id('rooms'),
    participantId: v.id('participants'),
    content: v.string(),
    turnNumber: v.number(),
    roundNumber: v.number(),
    attackType: v.optional(v.string()),
    damage: v.optional(v.number()),
    isStreaming: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_room', ['roomId'])
    .index('by_room_turn', ['roomId', 'turnNumber']),

  // Viewers
  viewers: defineTable({
    roomId: v.id('rooms'),
    sessionId: v.string(),
    userId: v.optional(v.id('users')),
    joinedAt: v.number(),
  })
    .index('by_room', ['roomId'])
    .index('by_session', ['sessionId']),

  // Votes
  votes: defineTable({
    roomId: v.id('rooms'),
    roundNumber: v.number(),
    participantId: v.id('participants'),
    sessionId: v.string(),
    userId: v.optional(v.id('users')),
    createdAt: v.number(),
  })
    .index('by_room_round', ['roomId', 'roundNumber'])
    .index('by_participant', ['participantId']),
})
