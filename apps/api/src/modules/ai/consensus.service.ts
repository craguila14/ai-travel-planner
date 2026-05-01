import { Injectable } from '@nestjs/common'
import { Proposal } from '@prisma/client'

export interface ConsensusResult {
  budgetMin: number
  budgetMax: number
  styles: string[]
  pace: string
  schedule: string
  mustVisit: string
  mustAvoid: string
  participantCount: number
  hasConflicts: boolean
  conflicts: string[]
}

@Injectable()
export class ConsensusService {
  aggregate(proposals: Proposal[]): ConsensusResult {
    if (proposals.length === 0) {
      throw new Error('Cannot aggregate empty proposals')
    }

    const budgetMin = this.aggregateBudgetMin(proposals)
    const budgetMax = this.aggregateBudgetMax(proposals)
    const styles = this.aggregateStyles(proposals)
    const pace = this.aggregatePace(proposals)
    const schedule = this.aggregateSchedule(proposals)
    const mustVisit = this.aggregateMustVisit(proposals)
    const mustAvoid = this.aggregateMustAvoid(proposals)
    const conflicts = this.detectConflicts(proposals, budgetMin, budgetMax)

    return {
      budgetMin,
      budgetMax,
      styles,
      pace,
      schedule,
      mustVisit,
      mustAvoid,
      participantCount: proposals.length,
      hasConflicts: conflicts.length > 0,
      conflicts,
    }
  }

  private aggregateBudgetMin(proposals: Proposal[]): number {
    const mins = proposals.map((p) => Number(p.budgetMin))
    return Math.max(...mins)
  }

  private aggregateBudgetMax(proposals: Proposal[]): number {
    const maxes = proposals.map((p) => Number(p.budgetMax))
    return Math.min(...maxes)
  }

  private aggregateStyles(proposals: Proposal[]): string[] {
    const styleCounts = new Map<string, number>()

    for (const proposal of proposals) {
      for (const style of proposal.style) {
        styleCounts.set(style, (styleCounts.get(style) ?? 0) + 1)
      }
    }

    const threshold = Math.ceil(proposals.length * 0.4)

    return Array.from(styleCounts.entries())
      .filter(([, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([style]) => style)
  }

  private aggregatePace(proposals: Proposal[]): string {
    const paceOrder = ['relajado', 'equilibrado', 'intenso']
    const paces = proposals.map((p) => p.pace)
    const lowestIndex = Math.min(...paces.map((p) => paceOrder.indexOf(p)))
    return paceOrder[lowestIndex]
  }

  private aggregateSchedule(proposals: Proposal[]): string {
    const counts = new Map<string, number>()
    for (const proposal of proposals) {
      counts.set(proposal.schedule, (counts.get(proposal.schedule) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0]
  }

  private aggregateMustVisit(proposals: Proposal[]): string {
    return proposals
      .map((p, i) => `Participant ${i + 1}: ${p.mustVisit}`)
      .join('\n')
  }

  private aggregateMustAvoid(proposals: Proposal[]): string {
    return proposals
      .map((p, i) => `Participant ${i + 1}: ${p.mustAvoid}`)
      .join('\n')
  }

  private detectConflicts(
    proposals: Proposal[],
    budgetMin: number,
    budgetMax: number,
  ): string[] {
    const conflicts: string[] = []

    if (budgetMin > budgetMax) {
      conflicts.push(
        `Budget conflict: the minimum viable budget (${budgetMin}) exceeds the maximum (${budgetMax}). The group needs to renegotiate budgets.`,
      )
    }

    const paces = new Set(proposals.map((p) => p.pace))
    if (paces.has('intenso') && paces.has('relajado')) {
      conflicts.push(
        'Pace conflict: some participants prefer an intense trip while others prefer relaxed. The itinerary will use a balanced pace.',
      )
    }

    return conflicts
  }
}