import { Module } from '@nestjs/common'
import { LlmLogsController } from './llm-logs.controller'
import { LlmLogsService } from './llm-logs.service'

@Module({
  controllers: [LlmLogsController],
  providers: [LlmLogsService],
})
export class LlmLogsModule {}