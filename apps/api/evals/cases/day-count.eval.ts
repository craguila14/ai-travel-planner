import { EvalCase, assert } from '../lib/runner'

export const dayCountEval: EvalCase = {
  name: 'day-count',
  fixture: 'trip-barcelona',
  run: ({ itinerary, fixture }) => {
    const start = new Date(fixture.trip.startDate)
    const end = new Date(fixture.trip.endDate)

    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    )

    const actualDays = itinerary.days.length
    const valid = actualDays === diffDays || actualDays === diffDays + 1

    return assert(
      valid,
      valid
        ? `${actualDays} días es válido para el rango de fechas`
        : `Debe tener ${diffDays} o ${diffDays + 1} días, tiene ${actualDays}`,
      `startDate: ${fixture.trip.startDate}, endDate: ${fixture.trip.endDate}`,
    )
  },
}