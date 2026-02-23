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
    const { participantId, roundNumber } = body

    if (!participantId || !roundNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: participantId, roundNumber' },
        { status: 400 }
      )
    }

    // Get or create session ID from cookie
    let sessionId = request.cookies.get('arena_session')?.value
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Check if room exists and is in voting status
    const room = await fetchQuery(api.rooms.getRoom, { roomId })
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status !== 'voting') {
      return NextResponse.json(
        { error: 'Room is not in voting status' },
        { status: 400 }
      )
    }

    // Cast the vote
    const result = await fetchMutation(api.votes.castVote, {
      roomId,
      roundNumber,
      participantId: participantId as Id<'participants'>,
      sessionId,
    })

    // Create response with session cookie
    const response = NextResponse.json(result)

    // Set session cookie if it was new
    if (!request.cookies.get('arena_session')?.value) {
      response.cookies.set('arena_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return response
  } catch (error: any) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cast vote' },
      { status: 500 }
    )
  }
}
