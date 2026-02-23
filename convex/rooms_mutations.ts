import { mutation } from './_generated/server'
import { v } from 'convex/values'

// Update room
export const updateRoom = mutation({
  args: {
    roomId: v.id('rooms'),
    status: v.optional(
      v.union(
        v.literal('scheduled'),
        v.literal('debating'),
        v.literal('voting'),
        v.literal('finished')
      )
    ),
    currentRound: v.optional(v.number()),
    currentTurn: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updates: any = {}
    if (args.status !== undefined) updates.status = args.status
    if (args.currentRound !== undefined) updates.currentRound = args.currentRound
    if (args.currentTurn !== undefined) updates.currentTurn = args.currentTurn
    if (args.updatedAt !== undefined) updates.updatedAt = args.updatedAt

    await ctx.db.patch(args.roomId, updates)
    return { success: true }
  },
})
