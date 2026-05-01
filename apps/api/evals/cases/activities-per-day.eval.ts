import { EvalCase, assert } from '../lib/runner'

export const activitiesPerDayEval: EvalCase = {
  name: 'activities-per-day',
  fixture: 'trip-barcelona',
  run: ({ itinerary }) => {
    const violations: string[] = []

    for (const day of itinerary.days) {
      const count = day.activities.length
      if (count < 1 || count > 8) {
        violations.push(`Día ${day.dayNumber}: ${count} actividades (debe ser 1-8)`)
      }
    }

    return assert(
      violations.length === 0,
      violations.length === 0
        ? 'Todos los días tienen entre 1 y 8 actividades'
        : `${violations.length} día(s) con cantidad inválida de actividades`,
      violations.join(', '),
    )
  },
}