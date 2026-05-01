import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'
import { TripsModule } from './modules/trips/trips.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { AiModule } from './modules/ai/ai.module';
import { ItinerariesModule } from './modules/itineraries/itineraries.module';
import { LlmLogsModule } from './modules/llm-logs/llm-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TripsModule,
    ProposalsModule,
    AiModule,
    ItinerariesModule,
    LlmLogsModule,
  ],
})
export class AppModule {}