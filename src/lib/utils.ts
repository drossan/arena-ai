import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const AI_MODELS = {
  'openai/gpt-4o': {
    name: 'GPT-4o',
    color: 'neon-blue',
    hex: '#00f0ff',
  },
  'anthropic/claude-3.5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    color: 'neon-purple',
    hex: '#b026ff',
  },
  'google/gemini-pro': {
    name: 'Gemini Pro',
    color: 'neon-green',
    hex: '#39ff14',
  },
  'meta-llama/llama-3-70b': {
    name: 'Llama 3',
    color: 'neon-orange',
    hex: '#ff6b35',
  },
  'mistralai/mistral-large': {
    name: 'Mistral',
    color: 'neon-white',
    hex: '#f0f0f0',
  },
} as const

export type ModelId = keyof typeof AI_MODELS

export const ATTACK_TYPES = {
  LIGHTNING_STRIKE: {
    name: 'Lightning Strike',
    emoji: '⚡',
    damage: 30,
    description: 'Argument with data and sources',
  },
  FIRE_SLASH: {
    name: 'Fire Slash',
    emoji: '🔥',
    damage: 20,
    description: 'Creative and original analogy',
  },
  COUNTER_ATTACK: {
    name: 'Counter Attack',
    emoji: '💥',
    damage: 15,
    description: 'Direct counter-argument',
  },
  WEAK_BLOW: {
    name: 'Weak Blow',
    emoji: '🫧',
    damage: 5,
    description: 'Vague or generic argument',
  },
} as const

export type AttackType = keyof typeof ATTACK_TYPES
