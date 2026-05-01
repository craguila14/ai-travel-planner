import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { TripsService } from './trips.service'
import { CreateTripDto } from './dto/create-trip.dto'
import { JoinTripDto } from './dto/join-trip.dto'

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto)
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.tripsService.findBySlug(slug)
  }

  @Post(':slug/join')
  join(@Param('slug') slug: string, @Body() dto: JoinTripDto) {
    return this.tripsService.join(slug, dto)
  }
}