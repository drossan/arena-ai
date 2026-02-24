import { NextRequest, NextResponse } from 'next/server'
import { Id } from '@/convex/_generated/dataModel'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { CommentatorAgent } from '@/agents/commentator'
import { BattleContext } from '@/agents/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId as Id<'rooms'>

    // Get room details
    const room = await fetchQuery(api.rooms.getRoom, { roomId })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status !== 'finished') {
      return NextResponse.json(
        { error: 'Battle is not finished yet' },
        { status: 400 }
      )
    }

    // Build battle context for commentator
    const participants = (room.participants || []).map(p => ({
      id: p._id.toString(),
      modelId: p.modelId,
      modelName: p.modelName,
      color: p.color,
      hp: p.hp || 100,
      maxHp: p.maxHp || 100,
      votes: 0, // TODO: Get vote counts
      side: p.side,
    }))

    const messages = (room.messages || []).map(m => ({
      id: m._id.toString(),
      participantId: m.participantId.toString(),
      content: m.content,
      turnNumber: m.turnNumber,
      roundNumber: m.roundNumber,
      attackType: m.attackType,
      damage: m.damage,
      isStreaming: m.isStreaming,
    }))

    const battleContext: BattleContext = {
      roomId: roomId.toString(),
      topic: room.topic,
      status: room.status,
      currentRound: room.currentRound || 3,
      currentTurn: room.currentTurn || 6,
      totalRounds: 3,
      participants,
      messages,
    }

    // Generate commentary
    const commentator = new CommentatorAgent()
    const commentary = await commentator.generateCommentary(battleContext)

    return NextResponse.json(commentary)
  } catch (error: any) {
    console.error('Commentary generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate commentary' },
      { status: 500 }
    )
  }
}
