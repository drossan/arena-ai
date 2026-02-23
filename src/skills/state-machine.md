# Real-Time State Machine

## Overview

This skill covers modeling battle states (waiting → round_1 → voting → round_2 → ... → finished) with Convex as the single source of truth.

## Core Concepts

### State Machine Definition

```typescript
// convex/types.ts
export type BattleState =
  | 'waiting'        // Room created, waiting for start
  | 'round_1_a'      // First model speaking in round 1
  | 'round_1_b'      // Second model speaking in round 1
  | 'voting_1'       // Voting for round 1
  | 'round_2_a'      // First model speaking in round 2
  | 'round_2_b'      // Second model speaking in round 2
  | 'voting_2'       // Voting for round 2
  | 'round_3_a'      // First model speaking in round 3
  | 'round_3_b'      // Second model speaking in round 3
  | 'voting_3'       // Final voting
  | 'finished'       // Battle complete

export type BattleEvent =
  | { type: 'START' }
  | { type: 'NEXT_TURN' }
  | { type: 'START_VOTING' }
  | { type: 'END_VOTING' }
  | { type: 'FINISH' }
```

### State Transitions

```typescript
// convex/stateMachine.ts
const STATE_TRANSITIONS: Record<BattleState, BattleEvent[]> = {
  waiting: ['START'],
  round_1_a: ['NEXT_TURN'],
  round_1_b: ['START_VOTING'],
  voting_1: ['END_VOTING'],
  round_2_a: ['NEXT_TURN'],
  round_2_b: ['START_VOTING'],
  voting_2: ['END_VOTING'],
  round_3_a: ['NEXT_TURN'],
  round_3_b: ['START_VOTING'],
  voting_3: ['END_VOTING', 'FINISH'],
  finished: [],
}

export function canTransition(from: BattleState, toEvent: BattleEvent): boolean {
  return STATE_TRANSITIONS[from]?.includes(toEvent) ?? false
}

export function getNextState(current: BattleState, event: BattleEvent): BattleState | null {
  const stateMap: Record<string, BattleState> = {
    'waiting:START': 'round_1_a',
    'round_1_a:NEXT_TURN': 'round_1_b',
    'round_1_b:START_VOTING': 'voting_1',
    'voting_1:END_VOTING': 'round_2_a',
    'round_2_a:NEXT_TURN': 'round_2_b',
    'round_2_b:START_VOTING': 'voting_2',
    'voting_2:END_VOTING': 'round_3_a',
    'round_3_a:NEXT_TURN': 'round_3_b',
    'round_3_b:START_VOTING': 'voting_3',
    'voting_3:END_VOTING': 'round_3_b', // Back for potential overtime
    'voting_3:FINISH': 'finished',
  }

  return stateMap[`${current}:${event}`] ?? null
}
```

## ArenaAI Patterns

### Battle State in Convex

```typescript
// convex/schema.ts
export default defineSchema({
  battles: defineTable({
    roomId: v.id('rooms'),
    state: v.string(), // BattleState
    currentRound: v.number(),
    currentTurn: v.number(), // A or B
    totalRounds: v.number(),
    startedAt: v.number(),
    updatedAt: v.number(),
  }).index('by_state', ['state']),
})
```

### State Transition Mutation

```typescript
// convex/mutations.ts
import { mutation } from './_generated/server'
import { getNextState, BattleState } from './stateMachine'

export const transitionState = mutation({
  args: {
    roomId: v.id('rooms'),
    event: v.string(),
  },
  handler: async (ctx, args) => {
    const battle = await ctx.db
      .query('battles')
      .withIndex('by_room', q => q.eq('roomId', args.roomId))
      .first()

    if (!battle) throw new Error('Battle not found')

    const currentState = battle.state as BattleState
    const event = args.event as BattleEvent

    if (!canTransition(currentState, event)) {
      throw new Error(`Invalid transition: ${currentState} -> ${event}`)
    }

    const nextState = getNextState(currentState, event)
    if (!nextState) {
      throw new Error(`No next state for: ${currentState} -> ${event}`)
    }

    // Update battle state
    await ctx.db.patch(battle._id, {
      state: nextState,
      updatedAt: Date.now(),
    })

    // Trigger side effects based on new state
    await handleStateChange(ctx, battle.roomId, nextState)

    return nextState
  }
})

async function handleStateChange(ctx: any, roomId: string, state: BattleState) {
  switch (state) {
    case 'round_1_a':
    case 'round_2_a':
    case 'round_3_a':
      // Trigger fighter A's turn
      await ctx.scheduler.runAfter(0, 'fighters:startTurn', {
        roomId,
        side: 'A',
      })
      break

    case 'round_1_b':
    case 'round_2_b':
    case 'round_3_b':
      // Trigger fighter B's turn
      await ctx.scheduler.runAfter(0, 'fighters:startTurn', {
        roomId,
        side: 'B',
      })
      break

    case 'voting_1':
    case 'voting_2':
    case 'voting_3':
      // Open voting for this round
      await ctx.scheduler.runAfter(0, 'voting:open', { roomId })
      break

    case 'finished':
      // Generate commentary
      await ctx.scheduler.runAfter(0, 'commentary:generate', { roomId })
      break
  }
}
```

### State Query with Real-time Updates

```typescript
// convex/queries.ts
import { query } from './_generated/server'

export const getBattleState = query({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const battle = await ctx.db
      .query('battles')
      .withIndex('by_room', q => q.eq('roomId', args.roomId))
      .first()

    return battle
  }
})
```

### Client-side State Hook

```typescript
// src/hooks/useBattleState.ts
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function useBattleState(roomId: string) {
  const battle = useQuery(api.battles.getBattleState, { roomId })

  const isLoading = !battle
  const canVote = battle?.state?.startsWith('voting_')
  const isFinished = battle?.state === 'finished'
  const currentRound = battle?.currentRound ?? 0

  return {
    battle,
    isLoading,
    canVote,
    isFinished,
    currentRound,
  }
}
```

## Best Practices

1. **Single source of truth** - Convex holds all state, never duplicate on client
2. **Validate transitions** - Always check canTransition before changing state
3. **Use scheduled functions** - Trigger side effects via ctx.scheduler
4. **Log state changes** - Keep audit trail of transitions for debugging
5. **Handle edge cases** - What if a model fails mid-turn?
6. **Make states reversible** - Allow recovery from error states
