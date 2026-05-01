import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bull'
import { PrismaModule } from './prisma/prisma.module'
import { TripsModule } from './modules/trips/trips.module'
import { ProposalsModule } from './modules/proposals/proposals.module'
import { AiModule } from './modules/ai/ai.module'
import { ItinerariesModule } from './modules/itineraries/itineraries.module'
import { LlmLogsModule } from './modules/llm-logs/llm-logs.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
          tls: process.env.NODE_ENV === 'production' ? {} : undefined,
        },
      }),
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