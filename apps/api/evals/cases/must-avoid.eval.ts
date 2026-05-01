import { EvalCase, assert } from '../lib/runner'

export const mustAvoidEval: EvalCase = {
  name: 'must-avoid',
  fixture: 'trip-dietary',
  run: ({ itinerary, fixture }) => {
    const avoidTerms = fixture.proposals
      .map((p: any) => p.mustAvoid.toLowerCase())
      .join(' ')

    const keywords = ['cerdo', 'discoteca', 'mariscos']
      .filter((k) => avoidTerms.includes(k))

    // Para gluten y alcohol buscamos frases negativas explícitas
    const negativePatterns = [
      /contiene gluten/i,
      /con gluten/i,
      /sirve alcohol/i,
      /bar de alcohol/i,
      /discoteca/i,
      /cerdo/i,
      /mariscos/i,
    ]

    const allActivities = itinerary.days.flatMap((d: any) => d.activities)
    const violations: string[] = []

    for (const activity of allActivities) {
      const text = `${activity.title} ${activity.description}`

      for (const pattern of negativePatterns) {
        if (pattern.test(text)) {
          violations.push(`"${activity.title}" puede violar must-avoid`)
          break
        }
      }

      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword)) {
          violations.push(`"${activity.title}" menciona "${keyword}"`)
          break
        }
      }
    }

    return assert(
      violations.length === 0,
      violations.length === 0
        ? 'Ninguna actividad viola los must-avoid'
        : `${violations.length} actividad(es) violan must-avoid`,
      violations.join(', '),
    )
  },
}