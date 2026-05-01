import { z } from 'zod'

const CATEGORY_MAP: Record<string, string> = {
  restaurant: 'restaurante',
  restaurants: 'restaurante',
  museum: 'museo',
  museums: 'museo',
  monument: 'monumento',
  monuments: 'monumento',
  nature: 'naturaleza',
  entertainment: 'entretenimiento',
  transport: 'transporte',
  transportation: 'transporte',
  accommodation: 'alojamiento',
  lodging: 'alojamiento',
  hotel: 'alojamiento',
  shopping: 'compras',
  shop: 'compras',
}

const CategorySchema = z
  .string()
  .transform((val) => CATEGORY_MAP[val.toLowerCase()] ?? val)
  .pipe(
    z.enum([
      'restaurante',
      'museo',
      'monumento',
      'naturaleza',
      'entretenimiento',
      'transporte',
      'alojamiento',
      'compras',
    ]),
  )

export const ActivitySchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format must be HH:MM'),
  title: z.string().min(3),
  description: z.string().min(10),
  category: CategorySchema,
  placeSearchQuery: z.string().min(3),
  estimatedCost: z.number().min(0),
})

export const ItineraryDaySchema = z.object({
  dayNumber: z.number().int().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  activities: z.array(ActivitySchema).min(1).max(8),
})

export const ItineraryOutputSchema = z.object({
  rationale: z.string().min(50),
  totalPerPerson: z.number().min(0),
  days: z.array(ItineraryDaySchema).min(1),
})

export type ItineraryOutput = z.infer<typeof ItineraryOutputSchema>
export type ActivityOutput = z.infer<typeof ActivitySchema>