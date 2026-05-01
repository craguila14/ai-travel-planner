import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ConsensusService } from './consensus.service'
import { LlmService } from './llm/llm.service'
import { ItineraryOutputSchema } from './schemas/itinerary-output.schema'
import { Trip, Proposal } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const PROMPT_VERSION = 'generate-itinerary.v1'

interface PreviousFeedback {
  approved: string[]
  rejected: string[]
  mixed: string[]
  version: number
}

@Injectable()
export class ItineraryGeneratorService {
  private readonly logger = new Logger(ItineraryGeneratorService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly consensus: ConsensusService,
    private readonly llm: LlmService,
  ) {}

async generate(tripId: string, previousFeedback?: PreviousFeedback | null): Promise<void> {
  this.logger.log(`Starting itinerary generation for trip ${tripId}`)

  const trip = await this.prisma.trip.findUnique({
    where: { id: tripId },
    include: { proposals: true },
  })

  if (!trip) throw new Error(`Trip ${tripId} not found`)
  if (trip.proposals.length === 0) throw new Error('No proposals found')

  await this.prisma.trip.update({
    where: { id: tripId },
    data: { status: 'GENERATING' },
  })

  try {
    const consensusData = this.consensus.aggregate(trip.proposals)

    if (consensusData.hasConflicts) {
      this.logger.warn(
        `Trip ${tripId} has conflicts: ${consensusData.conflicts.join(', ')}`,
      )
    }

    const prompt = this.buildPrompt(trip, trip.proposals, consensusData, previousFeedback)

    const output = await this.llm.generateStructured({
      prompt,
      schema: ItineraryOutputSchema,
      promptVersion: PROMPT_VERSION,
      tripId,
    })

    const version = await this.getNextVersion(tripId)

    await this.prisma.itinerary.create({
      data: {
        tripId,
        version,
        rationale: output.rationale,
        totalPerPerson: output.totalPerPerson,
        status: 'DRAFT',
        promptVersion: PROMPT_VERSION,
        days: {
          create: output.days.map((day) => ({
            dayNumber: day.dayNumber,
            date: new Date(day.date),
            activities: {
              create: day.activities.map((activity) => ({
                startTime: activity.startTime,
                endTime: activity.endTime,
                title: activity.title,
                description: activity.description,
                category: activity.category,
                placeId: activity.placeSearchQuery,
                estimatedCost: activity.estimatedCost,
              })),
            },
          })),
        },
      },
    })

    await this.prisma.trip.update({
      where: { id: tripId },
      data: { status: 'VOTING' },
    })

    this.logger.log(`Itinerary v${version} generated successfully for trip ${tripId}`)
  } catch (error) {
    await this.prisma.trip.update({
      where: { id: tripId },
      data: { status: 'COLLECTING' },
    })
    throw error
  }
}

private buildPrompt(
  trip: Trip,
  proposals: Proposal[],
  consensus: ReturnType<ConsensusService['aggregate']>,
  previousFeedback?: PreviousFeedback | null,
): string {
  const templatePath = path.join(
    process.cwd(),
    'src',
    'modules',
    'ai',
    'prompts',
    'generate-itinerary.v1.md',
  )
  let template = fs.readFileSync(templatePath, 'utf-8')

  const totalDays = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  )

  let feedbackSection = 'No previous itinerary feedback available. This is the first generation.'

  if (previousFeedback && (
    previousFeedback.approved.length > 0 ||
    previousFeedback.rejected.length > 0 ||
    previousFeedback.mixed.length > 0
  )) {
    const parts: string[] = [`Feedback from itinerary v${previousFeedback.version}:`]

    if (previousFeedback.approved.length > 0) {
      parts.push(`\nActivities the group LIKED (keep this style):\n${previousFeedback.approved.map(a => `  - ${a}`).join('\n')}`)
    }

    if (previousFeedback.rejected.length > 0) {
      parts.push(`\nActivities the group DISLIKED (avoid this style):\n${previousFeedback.rejected.map(a => `  - ${a}`).join('\n')}`)
    }

    if (previousFeedback.mixed.length > 0) {
      parts.push(`\nActivities with mixed opinions (use your judgment):\n${previousFeedback.mixed.map(a => `  - ${a}`).join('\n')}`)
    }

    feedbackSection = parts.join('')
  }

  const replacements: Record<string, string> = {
    '{{destination}}': trip.destination,
    '{{startDate}}': trip.startDate.toISOString().split('T')[0],
    '{{endDate}}': trip.endDate.toISOString().split('T')[0],
    '{{totalDays}}': String(totalDays),
    '{{currency}}': trip.currency,
    '{{participantCount}}': String(consensus.participantCount),
    '{{budgetMin}}': String(consensus.budgetMin),
    '{{budgetMax}}': String(consensus.budgetMax),
    '{{styles}}': consensus.styles.join(', '),
    '{{pace}}': consensus.pace,
    '{{schedule}}': consensus.schedule,
    '{{mustVisit}}': consensus.mustVisit,
    '{{mustAvoid}}': consensus.mustAvoid,
    '{{availablePlaces}}': 'Places will be added in the next iteration',
    '{{previousFeedback}}': feedbackSection,
  }

  for (const [placeholder, value] of Object.entries(replacements)) {
    template = template.replaceAll(placeholder, value)
  }

  return template
}
  private async getNextVersion(tripId: string): Promise<number> {
    const lastItinerary = await this.prisma.itinerary.findFirst({
      where: { tripId },
      orderBy: { version: 'desc' },
    })

    return (lastItinerary?.version ?? 0) + 1
  }
}