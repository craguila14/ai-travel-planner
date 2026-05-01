import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ItineraryGeneratorService } from '../ai/itinerary-generator.service'
import { VoteDto } from './dto/vote.dto'
import { GenerateDto } from './dto/generate.dto'

@Injectable()
export class ItinerariesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: ItineraryGeneratorService,
  ) {}

 async generate(slug: string, dto: GenerateDto) {
  const trip = await this.prisma.trip.findUnique({
    where: { slug },
    include: {
      participants: true,
      proposals: true,
    },
  })

  if (!trip) {
    throw new NotFoundException(`Trip with slug "${slug}" not found`)
  }

  const participant = trip.participants.find(
    (p) => p.id === dto.participantId,
  )

  if (!participant) {
    throw new NotFoundException('Participant not found in this trip')
  }

  if (!participant.isOrganizer) {
    throw new ForbiddenException('Only the organizer can generate the itinerary')
  }

  if (trip.proposals.length === 0) {
    throw new BadRequestException('Cannot generate itinerary without proposals')
  }

  if (trip.proposals.length !== trip.participants.length) {
    throw new BadRequestException(
      `Waiting for all proposals. ${trip.proposals.length}/${trip.participants.length} submitted`,
    )
  }

  if (trip.status === 'GENERATING') {
    throw new BadRequestException('Itinerary is already being generated')
  }

  // Obtiene el feedback del itinerario anterior si existe
  const previousFeedback = await this.getPreviousFeedback(trip.id)

  await this.generator.generate(trip.id, previousFeedback)

  return this.findLatest(slug)
}

private async getPreviousFeedback(tripId: string) {
  const lastItinerary = await this.prisma.itinerary.findFirst({
    where: { tripId },
    orderBy: { version: 'desc' },
    include: {
      days: {
        include: {
          activities: {
            include: { votes: true },
          },
        },
      },
    },
  })

  if (!lastItinerary) return null

  const participantCount = await this.prisma.participant.count({
    where: { tripId },
  })

  const approved: string[] = []
  const rejected: string[] = []
  const mixed: string[] = []

  for (const day of lastItinerary.days) {
    for (const activity of day.activities) {
      const upVotes = activity.votes.filter((v) => v.value === 'UP').length
      const downVotes = activity.votes.filter((v) => v.value === 'DOWN').length
      const totalVotes = activity.votes.length

      if (totalVotes === 0) continue

      const approvalRate = upVotes / participantCount

      if (approvalRate >= 0.6) {
        approved.push(`"${activity.title}" (${upVotes}/${participantCount} approved)`)
      } else if (approvalRate <= 0.3) {
        rejected.push(`"${activity.title}" (${downVotes}/${participantCount} rejected)`)
      } else {
        mixed.push(`"${activity.title}" (${upVotes} up, ${downVotes} down)`)
      }
    }
  }

  return { approved, rejected, mixed, version: lastItinerary.version }
}

  async findLatest(slug: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { slug },
    })

    if (!trip) {
      throw new NotFoundException(`Trip with slug "${slug}" not found`)
    }

    const itinerary = await this.prisma.itinerary.findFirst({
      where: { tripId: trip.id },
      orderBy: { version: 'desc' },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            activities: {
              include: {
                votes: true,
              },
            },
          },
        },
      },
    })

    if (!itinerary) {
      throw new NotFoundException('No itinerary found for this trip')
    }

    return this.enrichWithConsensus(itinerary, trip.id)
  }

  async vote(
    slug: string,
    activityId: string,
    dto: VoteDto,
  ) {
    const trip = await this.prisma.trip.findUnique({
      where: { slug },
      include: { participants: true },
    })

    if (!trip) {
      throw new NotFoundException(`Trip with slug "${slug}" not found`)
    }

    const participant = trip.participants.find(
      (p) => p.id === dto.participantId,
    )

    if (!participant) {
      throw new NotFoundException('Participant not found in this trip')
    }

    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    })

    if (!activity) {
      throw new NotFoundException('Activity not found')
    }

    return this.prisma.vote.upsert({
      where: {
        activityId_participantId: {
          activityId,
          participantId: dto.participantId,
        },
      },
      update: { value: dto.value },
      create: {
        activityId,
        participantId: dto.participantId,
        value: dto.value,
      },
    })
  }

  private async enrichWithConsensus(itinerary: any, tripId: string) {
    const participantCount = await this.prisma.participant.count({
      where: { tripId },
    })

    const days = itinerary.days.map((day: any) => ({
      ...day,
      activities: day.activities.map((activity: any) => {
        const upVotes = activity.votes.filter(
          (v: any) => v.value === 'UP',
        ).length
        const downVotes = activity.votes.filter(
          (v: any) => v.value === 'DOWN',
        ).length
        const totalVotes = activity.votes.length
        const consensusPercent =
          totalVotes > 0 ? Math.round((upVotes / participantCount) * 100) : null

        return {
          ...activity,
          votes: undefined,
          votesSummary: {
            up: upVotes,
            down: downVotes,
            total: totalVotes,
            consensusPercent,
            participantCount,
          },
        }
      }),
    }))

    return { ...itinerary, days }
  }
}