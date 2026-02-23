import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter'
import { OpenRouterClient } from 'openrouter-kit'
import { BattleContext, CommentaryResult, ShareableCard } from './types'

/**
 * Commentator Agent
 *
 * Activates at the end of the battle. Generates dramatic summary,
 * best argument highlight, and shareable card.
 *
 * Uses a creative model like Claude for engaging commentary.
 */
export class CommentatorAgent {
  private client: OpenRouterClient

  constructor() {
    // Use OpenRouter client for commentary
    this.client = getOpenRouterClient()
  }

  /**
   * Generate full battle commentary
   */
  async generateCommentary(battle: BattleContext): Promise<CommentaryResult> {
    const [summary, highlight, winner] = await Promise.all([
      this.generateSummary(battle),
      this.findBestArgument(battle),
      this.determineWinner(battle),
    ])

    const shareableCard = await this.generateShareableCard(battle, summary, highlight, winner)

    return {
      summary,
      highlight,
      winner,
      shareableCard,
    }
  }

  /**
   * Generate dramatic battle summary
   */
  private async generateSummary(battle: BattleContext): Promise<string> {
    const prompt = this.buildSummaryPrompt(battle)

    try {
      const result = await this.client.chat({
        model: OPENROUTER_MODELS.CLAUDE_3_5_SONNET, // Creative and expressive
        systemPrompt: `You are an epic esports commentator for ArenaAI, where AI models battle in debates.

Your style: Dramatic, energetic, and engaging. Like a Street Fighter announcer meets a tech debate host.

Guidelines:
- Use dramatic language ("CRUSHING BLOW!", "MASTERFUL COUNTER!")
- Highlight key moments and turning points
- Mention the crowd's reaction
- Keep it under 200 words
- End with a memorable closing line`,
        prompt,
        temperature: 0.9,
        maxTokens: 300,
      })

      return result.content || 'An epic battle unfolded in the Arena!'
    } catch (error) {
      console.error('Summary generation error:', error)
      return 'An epic battle took place in the Arena!'
    }
  }

  /**
   * Find the best argument of the battle
   */
  private async findBestArgument(battle: BattleContext): Promise<string> {
    const prompt = `Review these arguments from a debate about "${battle.topic}" and select the BEST one.

Arguments:
${battle.messages.map((m, i) => `${i + 1}. ${m.content}`).join('\n\n')}

Reply with:
1. The number of the best argument
2. A brief explanation of why it was the best (20 words max)

Format: "ARGUMENT NUMBER - REASONING"`

    try {
      const result = await this.client.chat({
        model: OPENROUTER_MODELS.CLAUDE_3_5_SONNET,
        prompt,
        temperature: 0.5,
        maxTokens: 100,
      })

      return result.content || 'Great debate all around!'
    } catch (error) {
      console.error('Highlight selection error:', error)
      return 'Great debate all around!'
    }
  }

  /**
   * Determine and announce the winner
   */
  private async determineWinner(battle: BattleContext): Promise<string> {
    const sortedParticipants = [...battle.participants].sort((a, b) => b.hp - a.hp)
    const winner = sortedParticipants[0]
    const loser = sortedParticipants[1]

    const hpDifference = winner.hp - loser.hp

    let victoryType = ''
    if (loser.hp <= 0) {
      victoryType = 'A DEVASTATING KNOCKOUT!'
    } else if (hpDifference > 50) {
      victoryType = 'A DOMINANT VICTORY!'
    } else if (hpDifference > 20) {
      victoryType = 'A CLEAR WIN!'
    } else {
      victoryType = 'A CLOSE CALL!'
    }

    return `${winner.modelName} emerges victorious ${victoryType}`
  }

  /**
   * Generate shareable card for social media
   */
  private async generateShareableCard(
    battle: BattleContext,
    summary: string,
    highlight: string,
    winner: string
  ): Promise<ShareableCard> {
    const sortedParticipants = [...battle.participants].sort((a, b) => b.hp - a.hp)
    const winnerModel = sortedParticipants[0]
    const loserModel = sortedParticipants[1]

    return {
      title: `⚔️ ${battle.topic}`,
      finalScore: `${winnerModel.modelName} ${winnerModel.hp} - ${loserModel.hp} ${loserModel.modelName}`,
      bestArgument: highlight.split('-')[1]?.trim() || highlight,
    }
  }

  /**
   * Build the summary prompt
   */
  private buildSummaryPrompt(battle: BattleContext): string {
    const participantA = battle.participants.find((p) => p.side === 'A')
    const participantB = battle.participants.find((p) => p.side === 'B')

    return `Generate an epic battle summary for this ArenaAI match:

TOPIC: "${battle.topic}"
FINAL SCORE: ${participantA?.modelName} (${participantA?.hp} HP) vs ${participantB?.modelName} (${participantB?.hp} HP)
ROUNDS: ${battle.currentRound}

Key moments:
${battle.messages
  .filter((m) => m.attackType)
  .map(
    (m) =>
      `- ${m.attackType} by ${battle.participants.find((p) => p.id === m.participantId)?.modelName}`
  )
  .join('\n')}

Make it DRAMATIC!`
  }
}
