import { Module } from '@nestjs/common'
import { ConsensusService } from './consensus.service'
import { LlmService } from './llm/llm.service'
import { ItineraryGeneratorService } from './itinerary-generator.service'

@Module({
  providers: [
    ConsensusService,
    LlmService,
    ItineraryGeneratorService,
  ],
  exports: [
    ItineraryGeneratorService,
  ],
})
export class AiModule {}