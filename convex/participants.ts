import { mutation } from './_generated/server'
import { v } from 'convex/values'

// Update participant HP
export const updateHP = mutation({
  args: {
    participantId: v.id('participants'),
    hp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, {
      hp: args.hp,
    })
    return { success: true }
  },
})
