import { ConsensusService } from '../../src/modules/ai/consensus.service'
import { Proposal } from '@prisma/client'

export interface EvalCase {
  name: string
  fixture: string
  run: (params: {
    itinerary: any
    consensus: any
    fixture: any
  }) => EvalResult
}

export interface EvalResult {
  passed: boolean
  message: string
  details?: string
}

export interface EvalReport {
  promptVersion: string
  totalCases: number
  passed: number
  failed: number
  results: {
    caseName: string
    fixture: string
    passed: boolean
    message: string
    details?: string
  }[]
}

export function assert(condition: boolean, message: string, details?: string): EvalResult {
  return {
    passed: condition,
    message,
    details,
  }
}