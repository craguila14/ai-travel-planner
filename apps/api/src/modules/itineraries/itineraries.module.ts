import { Module } from '@nestjs/common'
import { ItinerariesController } from './itineraries.controller'
import { ItinerariesService } from './itineraries.service'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [AiModule],
  controllers: [ItinerariesController],
  providers: [ItinerariesService],
})
export class ItinerariesModule {}