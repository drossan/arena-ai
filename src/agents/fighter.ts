import { getOpenRouterClient, MODEL_METADATA, OPENROUTER_MODELS, createMessage } from '@/lib/openrouter'
import { OpenRouterClient } from 'openrouter-kit'
import { MessageContext } from './types'

/**
 * Fighter Agent
 *
 * One agent per battling model. Receives the debate context,
 * calls its assigned model via OpenRouter, and streams tokens
 * one-by-one to Convex.
 *
 * Instantiated dynamically based on room participants.
 */
export class FighterAgent {
  private client: OpenRouterClient
  private systemPrompts: Map<string, string> = new Map()

  constructor(
    private participantId: string,
    private modelId: string,
    private side: 'A' | 'B',
    private ctx: {
      convex: any
    }
  ) {
    // Use OpenRouter native client
    this.client = getOpenRouterClient()

    this.initializeSystemPrompts()
  }

  /**
   * Initialize system prompts for each model with their "personality"
   */
  private initializeSystemPrompts() {
    this.systemPrompts.set(OPENROUTER_MODELS.GPT_4O, this.buildPrompt('GPT-4o', 'Electric Blue Warrior', 'analytical and precise'))
    this.systemPrompts.set(OPENROUTER_MODELS.CLAUDE_3_5_SONNET, this.buildPrompt('Claude 3.5 Sonnet', 'Purple Warrior', 'thoughtful and nuanced'))
    this.systemPrompts.set(OPENROUTER_MODELS.GEMINI_PRO, this.buildPrompt('Gemini Pro', 'Neon Green Warrior', 'creative and unexpected'))
    this.systemPrompts.set(OPENROUTER_MODELS.LLAMA_3_70B, this.buildPrompt('Llama 3', 'Orange Wild Warrior', 'bold and direct'))
    this.systemPrompts.set(OPENROUTER_MODELS.MISTRAL_LARGE, this.buildPrompt('Mistral', 'Ice White Warrior', 'sharp and elegant'))
    this.systemPrompts.set(OPENROUTER_MODELS.DEEPSEEK_CHAT, this.buildPrompt('DeepSeek', 'Cyan Lightning Warrior', 'logical and fast'))
  }

  /**
   * Build a system prompt that gives the model its fighting personality
   */
  private buildPrompt(name: string, character: string, style: string): string {
    return `You are ${character} (${name}), an AI warrior in the ArenaAI battle arena.

Your fighting style: ${style}.

When you debate:
- Be direct and powerful with your arguments
- Use specific evidence and examples when possible
- Counter your opponent's previous points directly
- Stay in character as a warrior - this is a battle!
- Keep responses concise (2-3 paragraphs maximum)
- You are on side ${this.side} of this debate

The crowd is watching. Make your argument count!`
  }

  /**
   * Generate an argument with streaming
   */
  async *generateArgument(topic: string, previousMessages: MessageContext[]): AsyncGenerator<string> {
    const systemPrompt = this.systemPrompts.get(this.modelId) || this.systemPrompts.get(OPENROUTER_MODELS.GPT_4O)!

    // Build conversation history
    const customMessages = [
      createMessage('system', systemPrompt),
      createMessage('user', `The debate topic is: "${topic}"

You are Side ${this.side}. Present your argument. Be powerful, be specific, and win this round!`),
    ]

    // Add previous messages for context (last 2 rounds)
    for (const msg of previousMessages.slice(-4)) {
      customMessages.push(createMessage('assistant', msg.content))
    }

    try {
      // Use openrouter-kit for streaming with callbacks
      const streamResult = await this.client.chatStream({
        model: this.modelId,
        temperature: 0.8,
        maxTokens: 500,
        customMessages,
        streamCallbacks: {
          onContent: (content: string) => {
            // This callback gets incremental content
            // We'll emit it from the async generator
          },
        },
      })

      // The streamResult.content contains the full content
      // For true streaming, we need a different approach
      // For now, yield the full result
      if (streamResult.content) {
        // Yield character by character for visual effect
        for (const char of streamResult.content) {
          yield char
        }
      }
    } catch (error) {
      console.error(`Fighter ${this.participantId} error:`, error)
      yield `[Error generating argument: ${error instanceof Error ? error.message : 'Unknown error'}]`
    }
  }

  /**
   * Generate a quick counter-argument (used for bonus rounds)
   */
  async generateCounterArgument(topic: string, opponentArgument: string): Promise<string> {
    const systemPrompt = this.systemPrompts.get(this.modelId) || this.systemPrompts.get(OPENROUTER_MODELS.GPT_4O)!

    try {
      const result = await this.client.chat({
        model: this.modelId,
        systemPrompt,
        prompt: `Topic: "${topic}"

Your opponent just said: "${opponentArgument}"

Deliver a crushing counter-argument in 1-2 sentences!`,
        temperature: 0.9,
        maxTokens: 150,
      })

      return result.content || '[No response]'
    } catch (error) {
      console.error(`Counter-argument error for ${this.participantId}:`, error)
      return '[Error generating counter-argument]'
    }
  }

  /**
   * Get the fighter's "power level" (affects damage calculation)
   */
  getPowerLevel(): number {
    // Could be adjusted based on model capabilities
    const powerLevels: Record<string, number> = {
      [OPENROUTER_MODELS.GPT_4O]: 95,
      [OPENROUTER_MODELS.CLAUDE_3_5_SONNET]: 92,
      [OPENROUTER_MODELS.GEMINI_PRO]: 88,
      [OPENROUTER_MODELS.LLAMA_3_70B]: 85,
      [OPENROUTER_MODELS.MISTRAL_LARGE]: 87,
      [OPENROUTER_MODELS.DEEPSEEK_CHAT]: 90,
    }
    return powerLevels[this.modelId] || 80
  }
}
