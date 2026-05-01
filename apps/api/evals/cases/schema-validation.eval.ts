import { EvalCase, assert } from '../lib/runner'
import { ItineraryOutputSchema } from '../../src/modules/ai/schemas/itinerary-output.schema'

export const schemaValidationEval: EvalCase = {
  name: 'schema-validation',
  fixture: 'trip-barcelona',
  run: ({ itinerary }) => {
    const result = ItineraryOutputSchema.safeParse(itinerary)

    if (result.success) {
      return assert(true, 'El itinerario cumple el schema Zod')
    }

    const errors = result.error.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ')

    return assert(false, 'El itinerario no cumple el schema Zod', errors)
  },
}