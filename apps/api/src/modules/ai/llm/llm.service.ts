import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { parseStructuredOutput, buildRetryPrompt } from './structured-output'
import { PrismaService } from '../../../prisma/prisma.service'

const MAX_RETRIES = 3
const MODEL = 'claude-sonnet-4-5'

@Injectable()
export class LlmService {
  private readonly client: Anthropic
  private readonly logger = new Logger(LlmService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    })
  }

  async generateStructured<T>(params: {
    prompt: string
    schema: z.ZodSchema<T>
    promptVersion: string
    tripId?: string
    maxTokens?: number
  }): Promise<T> {
    const { prompt, schema, promptVersion, tripId, maxTokens = 4096 } = params

    let currentPrompt = prompt
    let lastError = ''
    const startTime = Date.now()

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      this.logger.log(`LLM call attempt ${attempt}/${MAX_RETRIES} - ${promptVersion}`)

      try {
        const response = await this.client.messages.create({
          model: MODEL,
          max_tokens: maxTokens,
          messages: [
            {
              role: 'user',
              content: currentPrompt,
            },
          ],
        })

        const rawText = response.content
          .filter((block) => block.type === 'text')
          .map((block) => block.text)
          .join('')

        const result = parseStructuredOutput(rawText, schema)

        if (result.success) {
          await this.logCall({
            promptVersion,
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            latencyMs: Date.now() - startTime,
            success: true,
            retryCount: attempt - 1,
            tripId,
          })

          return result.data
        }

        lastError = result.error
        this.logger.warn(`Attempt ${attempt} failed validation: ${lastError}`)

        if (attempt < MAX_RETRIES) {
          currentPrompt = buildRetryPrompt(prompt, lastError)
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        this.logger.error(`Attempt ${attempt} API error: ${lastError}`)

        await this.logCall({
          promptVersion,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          errorType: 'api_error',
          retryCount: attempt - 1,
          tripId,
        })

        throw error
      }
    }

    await this.logCall({
      promptVersion,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startTime,
      success: false,
      errorType: 'zod_validation',
      retryCount: MAX_RETRIES,
      tripId,
    })

    throw new Error(
      `Failed to generate valid response after ${MAX_RETRIES} attempts. Last error: ${lastError}`,
    )
  }

  private async logCall(params: {
    promptVersion: string
    inputTokens: number
    outputTokens: number
    latencyMs: number
    success: boolean
    errorType?: string
    retryCount: number
    tripId?: string
  }) {
    const costUsd = this.calculateCost(params.inputTokens, params.outputTokens)

    try {
      await this.prisma.llmCallLog.create({
        data: {
          promptVersion: params.promptVersion,
          model: MODEL,
          inputTokens: params.inputTokens,
          outputTokens: params.outputTokens,
          latencyMs: params.latencyMs,
          costUsd,
          success: params.success,
          errorType: params.errorType,
          retryCount: params.retryCount,
          tripId: params.tripId,
        },
      })
    } catch (error) {
      this.logger.error('Failed to save LLM log', error)
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCostPerMillion = 3.0
    const outputCostPerMillion = 15.0

    return (
      (inputTokens / 1_000_000) * inputCostPerMillion +
      (outputTokens / 1_000_000) * outputCostPerMillion
    )
  }
}