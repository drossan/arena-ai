import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter'
import { OpenRouterClient } from 'openrouter-kit'
import { AttackType, AttackResult, RefereeAnalysis } from './types'

/**
 * Referee Agent
 *
 * Activates after each argument completes. Analyzes the text and
 * classifies it as a hit type (Lightning Strike, Fire Slash, etc.).
 * Calculates damage and updates HP.
 *
 * Uses a cheaper model (Haiku, Mistral-7B) for cost efficiency.
 */
export class RefereeAgent {
  private client: OpenRouterClient

  constructor() {
    // Use OpenRouter client for referee analysis
    this.client = getOpenRouterClient()
  }

  /**
   * Analyze an argument and classify the hit type
   */
  async analyzeArgument(argument: string, topic: string): Promise<RefereeAnalysis> {
    const prompt = this.buildRefereePrompt(argument, topic)

    try {
      // Use a cheaper model for classification
      const result = await this.client.chat({
        model: OPENROUTER_MODELS.CLAUDE_3_HAIKU, // Fast and cheap
        systemPrompt: `You are the ArenaAI Referee. Your job is to classify arguments in an AI debate battle.

Classification criteria:
- LIGHTNING_STRIKE: Argument uses specific data, facts, or sources. High impact.
- FIRE_SLASH: Creative analogy, unique perspective, or original thinking. Medium-high impact.
- COUNTER_ATTACK: Direct rebuttal of opponent's point. Medium impact.
- WEAK_BLOW: Vague, generic, or repetitive content. Low impact.

Respond ONLY with a JSON object in this exact format:
{
  "type": "LIGHTNING_STRIKE|FIRE_SLASH|COUNTER_ATTACK|WEAK_BLOW",
  "reasoning": "Brief explanation of why this classification fits",
  "confidence": 0.0-1.0
}`,
        prompt,
        temperature: 0.3,
        maxTokens: 200,
      })

      // Parse JSON response
      const cleanedResponse = result.content?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim() || '{}'
      const parsed = JSON.parse(cleanedResponse)

      return {
        attackResult: this.getAttackDetails(parsed.type as AttackType),
        confidence: parsed.confidence || 0.5,
      }
    } catch (error) {
      console.error('Referee analysis error:', error)
      // Default to weak blow on error
      return {
        attackResult: this.getAttackDetails('WEAK_BLOW'),
        confidence: 0,
      }
    }
  }

  /**
   * Build the referee's analysis prompt
   */
  private buildRefereePrompt(argument: string, topic: string): string {
    return `Analyze this argument in a debate about: "${topic}"

ARGUMENT:
"${argument}"

Classify the type of attack this represents. Consider:
- Does it cite specific sources or data? → LIGHTNING_STRIKE
- Is it creative or use clever analogies? → FIRE_SLASH
- Does it directly counter the opponent? → COUNTER_ATTACK
- Is it vague or lacks substance? → WEAK_BLOW

Respond with JSON only.`
  }

  /**
   * Get attack details including emoji and damage
   */
  private getAttackDetails(type: AttackType): AttackResult {
    const attacks: Record<AttackType, AttackResult> = {
      LIGHTNING_STRIKE: {
        type: 'LIGHTNING_STRIKE',
        emoji: '⚡',
        damage: 30,
        reasoning: 'Argument backed by data and sources',
      },
      FIRE_SLASH: {
        type: 'FIRE_SLASH',
        emoji: '🔥',
        damage: 20,
        reasoning: 'Creative and original analogy',
      },
      COUNTER_ATTACK: {
        type: 'COUNTER_ATTACK',
        emoji: '💥',
        damage: 15,
        reasoning: 'Direct counter-argument',
      },
      WEAK_BLOW: {
        type: 'WEAK_BLOW',
        emoji: '🫧',
        damage: 5,
        reasoning: 'Vague or generic argument',
      },
    }

    return attacks[type] || attacks.WEAK_BLOW
  }

  /**
   * Calculate final damage based on attack type and other factors
   */
  calculateDamage(baseDamage: number, powerLevel: number, crowdBonus: number = 0): number {
    // Power level modifier (80-100 → 0.8-1.2 multiplier)
    const powerModifier = powerLevel / 100

    // Apply modifiers
    let finalDamage = baseDamage * powerModifier

    // Add crowd bonus from votes (0-20% bonus)
    finalDamage *= (1 + crowdBonus / 100)

    return Math.round(finalDamage)
  }

  /**
   * Determine if a knockout occurs (HP reaches 0 or below)
   */
  isKnockout(currentHp: number, damage: number): boolean {
    return currentHp - damage <= 0
  }
}
