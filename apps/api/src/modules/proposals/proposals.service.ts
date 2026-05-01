import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SubmitProposalDto } from './dto/submit-proposal.dto'

@Injectable()
export class ProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(slug: string, dto: SubmitProposalDto) {
    const trip = await this.prisma.trip.findUnique({
      where: { slug },
      include: { participants: true },
    })

    if (!trip) {
      throw new NotFoundException(`Trip with slug "${slug}" not found`)
    }

    if (trip.status !== 'COLLECTING') {
      throw new BadRequestException(
        'This trip is no longer accepting proposals',
      )
    }

    const participant = trip.participants.find(
      (p) => p.id === dto.participantId,
    )

    if (!participant) {
      throw new NotFoundException(
        `Participant not found in this trip`,
      )
    }

    if (dto.budgetMin > dto.budgetMax) {
      throw new BadRequestException(
        'budgetMin cannot be greater than budgetMax',
      )
    }

    const existingProposal = await this.prisma.proposal.findUnique({
      where: { participantId: dto.participantId },
    })

    if (existingProposal) {
      return this.prisma.proposal.update({
        where: { participantId: dto.participantId },
        data: {
          budgetMin: dto.budgetMin,
          budgetMax: dto.budgetMax,
          style: dto.style,
          pace: dto.pace,
          schedule: dto.schedule,
          mustVisit: dto.mustVisit,
          mustAvoid: dto.mustAvoid,
          notes: dto.notes,
          submittedAt: new Date(),
        },
        include: { participant: true },
      })
    }

    return this.prisma.proposal.create({
      data: {
        tripId: trip.id,
        participantId: dto.participantId,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        style: dto.style,
        pace: dto.pace,
        schedule: dto.schedule,
        mustVisit: dto.mustVisit,
        mustAvoid: dto.mustAvoid,
        notes: dto.notes,
      },
      include: { participant: true },
    })
  }

  async findByTrip(slug: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { slug },
    })

    if (!trip) {
      throw new NotFoundException(`Trip with slug "${slug}" not found`)
    }

    return this.prisma.proposal.findMany({
      where: { tripId: trip.id },
      include: { participant: true },
    })
  }
}