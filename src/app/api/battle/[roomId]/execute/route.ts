import { NextRequest, NextResponse } from 'next/server'
import { Id } from '@/convex/_generated/dataModel'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { getOpenRouterClient } from '@/lib/openrouter'

// Simple referee analysis (in production, use AI model)
function analyzeArgument(content: string): { type: string; damage: number } {
  const keywords = {
    data: ['data', 'evidence', 'facts', 'study', 'research', 'statistics'],
    creative: ['metaphor', 'analogy', 'imagine', 'creative', 'innovative'],
    counter: ['false', 'wrong', 'incorrect', 'however', 'but', 'actually', 'not true'],
    weak: ['maybe', 'perhaps', 'might', 'could be', 'I think', 'probably'],
  }

  let score = 10 // Base damage
  let type = 'WEAK_BLOW'

  // Check for strong arguments with data
  if (keywords.data.some(k => content.toLowerCase().includes(k))) {
    score += 20
    type = 'LIGHTNING_STRIKE'
  }

  // Check for creative metaphors
  if (keywords.creative.some(k => content.toLowerCase().includes(k))) {
    score += 15
    if (type !== 'LIGHTNING_STRIKE') type = 'FIRE_SLASH'
  }

  // Check for counter-arguments
  if (keywords.counter.some(k => content.toLowerCase().includes(k))) {
    score += 15
    if (type !== 'LIGHTNING_STRIKE') type = 'COUNTER_ATTACK'
  }

  // Check for weak arguments
  if (keywords.weak.some(k => content.toLowerCase().includes(k))) {
    score = Math.max(5, score - 10)
  }

  // Length bonus
  if (content.length > 200) score += 5
  if (content.length > 500) score += 5

  return { type, damage: Math.min(30, score) }
}

export async function POST(
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

    if (room.status !== 'debating') {
      return NextResponse.json({ error: 'Battle not in debating status' }, { status: 400 })
    }

    const participants = room.participants || []
    if (participants.length < 2) {
      return NextResponse.json({ error: 'Not enough participants' }, { status: 400 })
    }

    const [fighterA, fighterB] = participants
    if (!fighterA || !fighterB) {
      return NextResponse.json({ error: 'Missing fighters' }, { status: 400 })
    }

    // Get existing messages to determine current turn
    const messages = room.messages || []
    const currentRound = room.currentRound || 1
    const currentTurn = room.currentTurn || 1

    // Determine which fighter's turn it is
    const isTurnA = currentTurn % 2 === 1 // Odd turns = A, Even turns = B
    const currentFighter = isTurnA ? fighterA : fighterB
    const opponent = isTurnA ? fighterB : fighterA

    // Get previous messages for context
    const previousContext = messages
      .filter(m => m.roundNumber === currentRound)
      .map(m => ({
        id: m._id,
        participantId: m.participantId,
        content: m.content,
        turnNumber: m.turnNumber,
        roundNumber: m.roundNumber,
      }))

    // Generate argument using OpenRouter
    // Use free router - automatically selects best available free model
    const freeModel = 'openrouter/free'

    const systemPrompt = `You are ${currentFighter.modelName}, an AI warrior in the ArenaAI battle arena.

Your fighting style: analytical and precise.

When you debate:
- Be direct and powerful with your arguments
- Use specific evidence and examples when possible
- Counter your opponent's previous points directly
- Stay in character as a warrior - this is a battle!
- Keep responses concise (2-3 paragraphs maximum)
- You are Side ${currentFighter.side} of this debate

The crowd is watching. Make your argument count!`

    const userPrompt = `The debate topic is: "${room.topic}"

Previous arguments in this round:
${previousContext.map(m => `- ${m.participantId === fighterA._id ? fighterA.modelName : fighterB.modelName}: ${m.content}`).join('\n')}

You are Side ${currentFighter.side}. Present your argument. Be powerful, be specific, and win this round!`

    // Call OpenRouter API with free model
    let argumentContent: string
    try {
      const client = getOpenRouterClient()
      const result = await client.chat({
        model: freeModel,
        systemPrompt,
        prompt: userPrompt,
        temperature: 0.8,
        maxTokens: 500,
      })

      argumentContent = result.content || 'No response generated'

      if (!argumentContent || argumentContent === 'No response generated') {
        console.error('No content generated from OpenRouter')
        return NextResponse.json(
          { error: 'No response from AI model' },
          { status: 500 }
        )
      }
    } catch (apiError: any) {
      console.error('OpenRouter API error:', apiError)
      return NextResponse.json(
        { error: 'Failed to generate argument', details: apiError.message || String(apiError) },
        { status: 500 }
      )
    }

    // Analyze the argument for attack type and damage
    const { type: attackType, damage } = analyzeArgument(argumentContent)

    // Save message to Convex
    const messageId = await fetchMutation(api.messages.save, {
      roomId,
      participantId: currentFighter._id,
      content: argumentContent,
      turnNumber: currentTurn,
      roundNumber: currentRound,
      attackType,
      damage,
      isStreaming: false,
    })

    // Apply damage to opponent
    const opponentHP = opponent.hp || 100
    const newHP = Math.max(0, opponentHP - damage)

    await fetchMutation(api.participants.updateHP, {
      participantId: opponent._id,
      hp: newHP,
    })

    // Update room turn
    const nextTurn = currentTurn + 1
    const totalTurns = currentRound * 2 // 2 turns per round

    let updateData: any = {
      currentTurn: nextTurn,
      updatedAt: Date.now(),
    }

    // Check if round is complete
    if (nextTurn > totalTurns) {
      // Move to voting phase
      updateData.status = 'voting'
    }

    await fetchMutation(api.rooms.updateRoom, {
      roomId,
      ...updateData,
    })

    return NextResponse.json({
      success: true,
      messageId,
      content: argumentContent,
      attackType,
      damage,
      opponentNewHP: newHP,
      nextTurn: updateData.currentTurn,
    })

  } catch (error: any) {
    console.error('Battle execution error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to execute battle turn' },
      { status: 500 }
    )
  }
}
