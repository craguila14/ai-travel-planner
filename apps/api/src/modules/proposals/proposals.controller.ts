import { Controller, Post, Get, Body, Param } from '@nestjs/common'
import { ProposalsService } from './proposals.service'
import { SubmitProposalDto } from './dto/submit-proposal.dto'

@Controller('trips/:slug/proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  submit(
    @Param('slug') slug: string,
    @Body() dto: SubmitProposalDto,
  ) {
    return this.proposalsService.submit(slug, dto)
  }

  @Get()
  findAll(@Param('slug') slug: string) {
    return this.proposalsService.findByTrip(slug)
  }
}