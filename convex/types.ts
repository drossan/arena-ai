export type AttackType = 'LIGHTNING_STRIKE' | 'FIRE_SLASH' | 'COUNTER_ATTACK' | 'WEAK_BLOW'

export interface Attack {
  type: AttackType
  emoji: string
  damage: number
  description: string
}

export interface Model {
  id: string
  name: string
  color: string
  hex: string
}

export interface BattleState {
  status: 'waiting' | 'debating' | 'voting' | 'finished'
  currentRound: number
  currentTurn: number
  totalRounds: number
}

export interface Participant {
  id: string
  roomId: string
  modelId: string
  modelName: string
  color: string
  hp: number
  maxHp: number
  votes: number
  side: 'A' | 'B'
}
