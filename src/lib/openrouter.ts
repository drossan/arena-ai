/**
 * OpenRouter Client Configuration
 *
 * OpenRouter provides unified access to multiple LLMs (GPT-4o, Claude, Gemini, etc.)
 * via a single API.
 *
 * @see https://openrouter.ai/docs
 * @see https://www.npmjs.com/package/openrouter-kit
 */

import { OpenRouterClient, Message } from 'openrouter-kit'

/**
 * Available AI models on OpenRouter for ArenaAI battles
 */
export const OPENROUTER_MODELS = {
  // OpenAI
  GPT_4O: 'openai/gpt-4o',
  GPT_4O_MINI: 'openai/gpt-4o-mini',

  // Anthropic
  CLAUDE_3_5_SONNET: 'anthropic/claude-3.5-sonnet',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',
  CLAUDE_3_7_SONNET: 'anthropic/claude-3.7-sonnet',

  // Google
  GEMINI_PRO: 'google/gemini-pro',
  GEMINI_2_0_FLASH_EXP: 'google/gemini-2.0-flash-exp',
  GEMINI_1_5_FLASH: 'google/gemini-1.5-flash',

  // Meta
  LLAMA_3_70B: 'meta-llama/llama-3-70b',
  LLAMA_3_1_70B: 'meta-llama/llama-3.1-70b',
  LLAMA_3_3_70B: 'meta-llama/llama-3.3-70b-instruct',

  // Mistral
  MISTRAL_LARGE: 'mistralai/mistral-large',
  MISTRAL_MEDIUM: 'mistralai/mistral-medium',

  // DeepSeek
  DEEPSEEK_CHAT: 'deepseek/deepseek-chat',
  DEEPSEEK_REASONER: 'deepseek/deepseek-reasoner',
} as const

export type OpenRouterModelId = (typeof OPENROUTER_MODELS)[keyof typeof OPENROUTER_MODELS]

/**
 * Model metadata for ArenaAI characters
 */
export const MODEL_METADATA: Record<string, { name: string; color: string; hex: string }> = {
  [OPENROUTER_MODELS.GPT_4O]: { name: 'GPT-4o', color: 'neon-blue', hex: '#00f0ff' },
  [OPENROUTER_MODELS.CLAUDE_3_5_SONNET]: { name: 'Claude 3.5 Sonnet', color: 'neon-purple', hex: '#b026ff' },
  [OPENROUTER_MODELS.GEMINI_PRO]: { name: 'Gemini Pro', color: 'neon-green', hex: '#39ff14' },
  [OPENROUTER_MODELS.LLAMA_3_70B]: { name: 'Llama 3 70B', color: 'neon-orange', hex: '#ff6b35' },
  [OPENROUTER_MODELS.MISTRAL_LARGE]: { name: 'Mistral Large', color: 'neon-white', hex: '#f0f0f0' },
  [OPENROUTER_MODELS.DEEPSEEK_CHAT]: { name: 'DeepSeek', color: 'neon-cyan', hex: '#00ced1' },
} as any

/**
 * Create an OpenRouter client for ArenaAI
 */
export function createOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set')
  }

  return new OpenRouterClient({
    apiKey,
  })
}

/**
 * Singleton instance for reuse across the application
 */
let clientInstance: OpenRouterClient | null = null

export function getOpenRouterClient(): OpenRouterClient {
  if (!clientInstance) {
    clientInstance = createOpenRouterClient()
  }
  return clientInstance
}

/**
 * Helper to create a Message object
 */
export function createMessage(role: 'user' | 'assistant' | 'system', content: string): Message {
  return {
    role,
    content,
    timestamp: new Date().toISOString(),
  }
}
