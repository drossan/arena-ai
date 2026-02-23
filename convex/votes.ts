import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Cast a vote for a participant in a specific round
export const castVote = mutation({
  args: {
    roomId: v.id('rooms'),
    roundNumber: v.number(),
    participantId: v.id('participants'),
    sessionId: v.string(),
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    // Check if room is in voting status
    const room = await ctx.db.get(args.roomId)
    if (!room || room.status !== 'voting') {
      throw new Error('Room is not in voting status')
    }

    // Check if this session already voted in this round
    const existingVotes = await ctx.db
      .query('votes')
      .withIndex('by_room_round', (q) =>
        q.eq('roomId', args.roomId).eq('roundNumber', args.roundNumber)
      )
      .collect()

    const alreadyVoted = existingVotes.some((v) => v.sessionId === args.sessionId)
    if (alreadyVoted) {
      throw new Error('You have already voted in this round')
    }

    // Record the vote
    const voteId = await ctx.db.insert('votes', {
      roomId: args.roomId,
      roundNumber: args.roundNumber,
      participantId: args.participantId,
      sessionId: args.sessionId,
      userId: args.userId,
      createdAt: Date.now(),
    })

    return { success: true, voteId }
  },
})

// Get votes for a room in a specific round
export const getRoundVotes = query({
  args: {
    roomId: v.id('rooms'),
    roundNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query('votes')
      .withIndex('by_room_round', (q) =>
        q.eq('roomId', args.roomId).eq('roundNumber', args.roundNumber)
      )
      .collect()

    // Count votes per participant
    const voteCounts: Record<string, number> = {}
    for (const vote of votes) {
      const participantId = vote.participantId.toString()
      voteCounts[participantId] = (voteCounts[participantId] || 0) + 1
    }

    return {
      total: votes.length,
      byParticipant: voteCounts,
      votes,
    }
  },
})

// Check if a session has voted in a round
export const hasVoted = query({
  args: {
    roomId: v.id('rooms'),
    roundNumber: v.number(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query('votes')
      .withIndex('by_room_round', (q) =>
        q.eq('roomId', args.roomId).eq('roundNumber', args.roundNumber)
      )
      .collect()

    const hasVoted = votes.some((v) => v.sessionId === args.sessionId)
    return hasVoted
  },
})

// Apply damage based on vote results (called when voting ends)
export const applyVoteResults = mutation({
  args: {
    roomId: v.id('rooms'),
    roundNumber: v.number(),
  },
  handler: async (ctx, args) => {
    // Get votes for this round
    const votes = await ctx.db
      .query('votes')
      .withIndex('by_room_round', (q) =>
        q.eq('roomId', args.roomId).eq('roundNumber', args.roundNumber)
      )
      .collect()

    if (votes.length === 0) {
      return { noVotes: true }
    }

    // Count votes per participant
    const voteCounts: Record<string, number> = {}
    for (const vote of votes) {
      const participantId = vote.participantId.toString()
      voteCounts[participantId] = (voteCounts[participantId] || 0) + 1
    }

    // Get participants for this room
    const participants = await ctx.db
      .query('participants')
      .withIndex('by_room', (q) => q.eq('roomId', args.roomId))
      .collect()

    if (participants.length < 2) {
      throw new Error('Not enough participants')
    }

    // Find winner and loser based on votes
    const sortedByVotes = participants.sort((a, b) => {
      const votesA = voteCounts[a._id.toString()] || 0
      const votesB = voteCounts[b._id.toString()] || 0
      return votesB - votesA
    })

    const winner = sortedByVotes[0]
    const loser = sortedByVotes[1]
    const winnerVotes = voteCounts[winner._id.toString()] || 0
    const loserVotes = voteCounts[loser._id.toString()] || 0

    // Calculate damage: 5-15 HP based on vote difference
    const voteDifference = winnerVotes - loserVotes
    const totalVotes = votes.length
    const loserPercentage = loserVotes / totalVotes

    // Loser loses HP: higher percentage = less damage
    const damage = Math.round(5 + (1 - loserPercentage) * 10) // 5-15 damage

    // Apply damage to loser
    const currentHP = loser.hp || 100
    const newHP = Math.max(0, currentHP - damage)

    await ctx.db.patch(loser._id, { hp: newHP })

    return {
      winner: winner.modelName,
      loser: loser.modelName,
      winnerVotes,
      loserVotes,
      damage,
      loserNewHP: newHP,
    }
  },
})
