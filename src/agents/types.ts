export type BattleStatus = 'waiting' | 'debating' | 'voting' | 'finished'

export interface BattleContext {
  roomId: string
  topic: string
  status: BattleStatus
  currentRound: number
  currentTurn: number
  totalRounds: number
  participants: ParticipantContext[]
  messages: MessageContext[]
}

export interface ParticipantContext {
  id: string
  modelId: string
  modelName: string
  color: string
  hp: number
  maxHp: number
  votes: number
  side: 'A' | 'B'
}

export interface MessageContext {
  id: string
  participantId: string
  content: string
  turnNumber: number
  roundNumber: number
  attackType?: string
  damage?: number
  isStreaming: boolean
}

export type AttackType = 'LIGHTNING_STRIKE' | 'FIRE_SLASH' | 'COUNTER_ATTACK' | 'WEAK_BLOW'

export interface AttackResult {
  type: AttackType
  emoji: string
  damage: number
  reasoning: string
}

export interface FighterResponse {
  content: string
  isComplete: boolean
  error?: string
}

export interface RefereeAnalysis {
  attackResult: AttackResult
  confidence: number
}

export interface CommentaryResult {
  summary: string
  highlight: string
  winner: string
  shareableCard: ShareableCard
}

export interface ShareableCard {
  title: string
  finalScore: string
  bestArgument: string
  imageUrl?: string
}
