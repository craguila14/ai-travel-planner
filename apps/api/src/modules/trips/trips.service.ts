import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { customAlphabet } from 'nanoid'
import { JoinTripDto } from './dto/join-trip.dto'

const generateSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTripDto) {
    const slug = generateSlug()

    const trip = await this.prisma.trip.create({
      data: {
        slug,
        name: dto.name,
        destination: dto.destination,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        currency: dto.currency ?? 'USD',
        participants: {
          create: {
            displayName: dto.organizerName,
            isOrganizer: true,
          },
        },
      },
      include: {
        participants: true,
      },
    })

    const organizer = trip.participants[0]

    return {
      trip,
      participantId: organizer.id,
    }
  }

  async findBySlug(slug: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { slug },
      include: {
        participants: true,
        proposals: {
          include: {
            participant: true,
          },
        },
      },
    })

    if (!trip) {
      throw new NotFoundException(`Trip with slug "${slug}" not found`)
    }

    return trip
  }

  async join(slug: string, dto: JoinTripDto) {
    const trip = await this.prisma.trip.findUnique({
      where: { slug },
      include: { participants: true },
    })

    if (!trip) {
      throw new NotFoundException(`Trip with slug "${slug}" not found`)
    }

    const nameExists = trip.participants.some(
      (p) => p.displayName.toLowerCase() === dto.displayName.toLowerCase()
    )

    if (nameExists) {
      throw new ConflictException(`The name "${dto.displayName}" is already taken in this trip`)
    }

    const participant = await this.prisma.participant.create({
      data: {
        tripId: trip.id,
        displayName: dto.displayName,
        isOrganizer: false,
      },
    })

    return {
      trip,
      participantId: participant.id,
    }
  }
}