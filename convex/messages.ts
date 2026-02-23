import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Save a message from a fighter
export const save = mutation({
  args: {
    roomId: v.id('rooms'),
    participantId: v.id('participants'),
    content: v.string(),
    turnNumber: v.number(),
    roundNumber: v.number(),
    attackType: v.optional(v.string()),
    damage: v.optional(v.number()),
    isStreaming: v.boolean(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('messages', {
      roomId: args.roomId,
      participantId: args.participantId,
      content: args.content,
      turnNumber: args.turnNumber,
      roundNumber: args.roundNumber,
      attackType: args.attackType,
      damage: args.damage,
      isStreaming: args.isStreaming,
      createdAt: Date.now(),
    })

    return messageId
  },
})

// Get messages for a room
export const list = query({
  args: {
    roomId: v.id('rooms'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_room', (q) => q.eq('roomId', args.roomId))
      .collect()

    return messages
  },
})
