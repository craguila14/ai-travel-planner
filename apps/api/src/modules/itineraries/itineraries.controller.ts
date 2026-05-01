import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common'
import { ItinerariesService } from './itineraries.service'
import { VoteDto } from './dto/vote.dto'
import { GenerateDto } from './dto/generate.dto'

@Controller('trips/:slug/itineraries')
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  @Post('generate')
  generate(
    @Param('slug') slug: string,
    @Body() dto: GenerateDto,
  ) {
    return this.itinerariesService.generate(slug, dto)
  }

  @Get('latest')
  findLatest(@Param('slug') slug: string) {
    return this.itinerariesService.findLatest(slug)
  }

  @Post('activities/:activityId/vote')
  vote(
    @Param('slug') slug: string,
    @Param('activityId') activityId: string,
    @Body() dto: VoteDto,
  ) {
    return this.itinerariesService.vote(slug, activityId, dto)
  }
}