import { BattleContext, BattleStatus } from './types'
import { FighterAgent } from './fighter'
import { RefereeAgent } from './referee'
import { CommentatorAgent } from './commentator'

/**
 * Orchestrator Agent
 *
 * Main coordinator of the battle flow. Decides when to launch each model's turn,
 * calls sub-agents in sequence, and updates battle state in Convex.
 *
 * Acts as the "director of scene" for the entire battle.
 */
export class OrchestratorAgent {
  private fighterAgents: Map<string, FighterAgent> = new Map()
  private referee: RefereeAgent
  private commentator: CommentatorAgent

  constructor(
    private ctx: {
      convex: any
    }
  ) {
    // Referee and Commentator create their own OpenRouter clients
    this.referee = new RefereeAgent()
    this.commentator = new CommentatorAgent()
  }

  /**
   * Initialize fighter agents for the two participants
   */
  async initializeFighters(participants: Array<{ id: string; modelId: string; side: 'A' | 'B' }>) {
    for (const participant of participants) {
      const fighter = new FighterAgent(
        participant.id,
        participant.modelId,
        participant.side,
        this.ctx
      )
      this.fighterAgents.set(participant.id, fighter)
    }
  }

  /**
   * Execute a complete battle
   */
  async runBattle(roomId: string, topic: string, totalRounds: number = 3): Promise<void> {
    // Initialize battle state
    await this.ctx.convex.mutation('battles:startBattle', { roomId, topic, totalRounds })

    // Run each round
    for (let round = 1; round <= totalRounds; round++) {
      await this.runRound(roomId, round)
    }

    // End battle and generate commentary
    await this.endBattle(roomId)
  }

  /**
   * Execute a single round (2 turns - one per fighter)
   */
  private async runRound(roomId: string, roundNumber: number): Promise<void> {
    const battle = await this.ctx.convex.query('battles:getBattle', { roomId })

    // Turn A: First fighter
    await this.runTurn(roomId, battle.participants[0].id, roundNumber, 1)

    // Turn B: Second fighter
    await this.runTurn(roomId, battle.participants[1].id, roundNumber, 2)

    // Voting phase
    await this.ctx.convex.mutation('battles:startVoting', { roomId, roundNumber })
  }

  /**
   * Execute a single fighter's turn with streaming
   */
  private async runTurn(
    roomId: string,
    participantId: string,
    roundNumber: number,
    turnNumber: number
  ): Promise<void> {
    const fighter = this.fighterAgents.get(participantId)
    if (!fighter) {
      throw new Error(`Fighter not found: ${participantId}`)
    }

    const battle = await this.ctx.convex.query('battles:getBattle', { roomId })

    // Start the turn
    await this.ctx.convex.mutation('battles:startTurn', {
      roomId,
      participantId,
      roundNumber,
      turnNumber,
    })

    // Generate argument with streaming
    const stream = fighter.generateArgument(battle.topic, battle.messages)

    // Stream tokens to Convex in real-time
    for await (const chunk of stream) {
      await this.ctx.convex.mutation('battles:streamToken', {
        roomId,
        participantId,
        token: chunk,
      })
    }

    // Complete the turn and get referee analysis
    const message = await this.ctx.convex.query('battles:getLatestMessage', { roomId })
    const analysis = await this.referee.analyzeArgument(message.content, battle.topic)

    // Apply damage based on referee's classification
    await this.ctx.convex.mutation('battles:applyDamage', {
      roomId,
      attackerId: participantId,
      attackResult: analysis.attackResult,
    })
  }

  /**
   * End the battle and generate commentary
   */
  private async endBattle(roomId: string): Promise<void> {
    const battle = await this.ctx.convex.query('battles:getBattle', { roomId })

    // Mark battle as finished
    await this.ctx.convex.mutation('battles:finishBattle', { roomId })

    // Generate commentary
    const commentary = await this.commentator.generateCommentary(battle)

    // Save commentary
    await this.ctx.convex.mutation('battles:saveCommentary', {
      roomId,
      commentary,
    })
  }

  /**
   * Resume a battle from a given state
   */
  async resumeBattle(battle: BattleContext): Promise<void> {
    // Re-initialize fighters
    await this.initializeFighters(
      battle.participants.map((p) => ({
        id: p.id,
        modelId: p.modelId,
        side: p.side,
      }))
    )

    // Continue from current state
    if (battle.status === 'debating') {
      await this.runBattle(battle.roomId, battle.topic, battle.totalRounds)
    }
  }
}
