import { EvalCase, assert } from '../lib/runner'

export const budgetConstraintEval: EvalCase = {
  name: 'budget-constraint',
  fixture: 'trip-barcelona',
  run: ({ itinerary, consensus }) => {
    const total = Number(itinerary.totalPerPerson)
    const { budgetMin, budgetMax } = consensus

    return assert(
      total >= budgetMin && total <= budgetMax,
      `Total por persona (${total}) debe estar entre ${budgetMin} y ${budgetMax}`,
      `totalPerPerson: ${total}, viable range: ${budgetMin}-${budgetMax}`,
    )
  },
}