import { NextRequest, NextResponse } from 'next/server'
import { Id } from '@/convex/_generated/dataModel'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId as Id<'rooms'>

    // Get request body
    const body = await request.json()
    const { roundNumber } = body

    if (!roundNumber) {
      return NextResponse.json(
        { error: 'Missing required field: roundNumber' },
        { status: 400 }
      )
    }

    // Get room details
    const room = await fetchQuery(api.rooms.getRoom, { roomId })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Apply vote results
    const result = await fetchMutation(api.votes.applyVoteResults, {
      roomId,
      roundNumber,
    })

    if (result.noVotes) {
      // No votes, move to next round/finish without damage
      const currentRound = room.currentRound || 1
      let updateData: any = {
        updatedAt: Date.now(),
      }

      if (currentRound >= 3) {
        updateData.status = 'finished'
      } else {
        updateData.status = 'debating'
        updateData.currentRound = currentRound + 1
        updateData.currentTurn = (currentRound * 2) + 1
      }

      await fetchMutation(api.rooms.updateRoom, {
        roomId,
        ...updateData,
      })

      return NextResponse.json({
        success: true,
        noVotes: true,
        nextStatus: updateData.status,
      })
    }

    // Determine next state
    const currentRound = room.currentRound || 1
    let updateData: any = {
      updatedAt: Date.now(),
    }

    if (currentRound >= 3) {
      // Battle finished
      updateData.status = 'finished'
    } else {
      // Move to next round
      updateData.status = 'debating'
      updateData.currentRound = currentRound + 1
      updateData.currentTurn = (currentRound * 2) + 1
    }

    await fetchMutation(api.rooms.updateRoom, {
      roomId,
      ...updateData,
    })

    return NextResponse.json({
      success: true,
      voteResults: result,
      nextStatus: updateData.status,
      nextRound: updateData.currentRound,
      nextTurn: updateData.currentTurn,
    })
  } catch (error: any) {
    console.error('End voting error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to end voting' },
      { status: 500 }
    )
  }
}
