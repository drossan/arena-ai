/**
 * ArenaAI Multi-Agent System
 *
 * This module exports all agents used in the ArenaAI battle system.
 *
 * Architecture:
 * - Orchestrator: Main coordinator of battle flow
 * - Fighter: Per-model agent that generates arguments
 * - Referee: Analyzes arguments and assigns damage
 * - Commentator: Generates battle summaries and highlights
 */

export { OrchestratorAgent } from './orchestrator'
export { FighterAgent } from './fighter'
export { RefereeAgent } from './referee'
export { CommentatorAgent } from './commentator'
export * from './types'
