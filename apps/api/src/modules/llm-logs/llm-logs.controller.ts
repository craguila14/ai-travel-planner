import { Controller, Get } from '@nestjs/common'
import { LlmLogsService } from './llm-logs.service'

@Controller('llm-logs')
export class LlmLogsController {
  constructor(private readonly llmLogsService: LlmLogsService) {}

  @Get()
  findAll() {
    return this.llmLogsService.findAll()
  }
}