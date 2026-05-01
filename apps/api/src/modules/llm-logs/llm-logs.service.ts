import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class LlmLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const logs = await this.prisma.llmCallLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const stats = await this.computeStats()

    return { logs, stats }
  }

  private async computeStats() {
    const all = await this.prisma.llmCallLog.findMany()

    if (all.length === 0) {
      return {
        totalCalls: 0,
        successRate: 0,
        avgLatencyMs: 0,
        totalCostUsd: 0,
        avgRetries: 0,
        byPromptVersion: [],
      }
    }

    const successful = all.filter((l) => l.success)
    const totalCostUsd = all.reduce((sum, l) => sum + Number(l.costUsd), 0)
    const avgLatencyMs = Math.round(
      all.reduce((sum, l) => sum + l.latencyMs, 0) / all.length,
    )
    const avgRetries =
      all.reduce((sum, l) => sum + l.retryCount, 0) / all.length

    const byVersion = new Map<string, { calls: number; successes: number; totalCost: number }>()

    for (const log of all) {
      const current = byVersion.get(log.promptVersion) ?? {
        calls: 0,
        successes: 0,
        totalCost: 0,
      }
      byVersion.set(log.promptVersion, {
        calls: current.calls + 1,
        successes: current.successes + (log.success ? 1 : 0),
        totalCost: current.totalCost + Number(log.costUsd),
      })
    }

    const byPromptVersion = Array.from(byVersion.entries()).map(
      ([version, data]) => ({
        version,
        calls: data.calls,
        successRate: Math.round((data.successes / data.calls) * 100),
        totalCostUsd: Number(data.totalCost.toFixed(4)),
      }),
    )

    return {
      totalCalls: all.length,
      successRate: Math.round((successful.length / all.length) * 100),
      avgLatencyMs,
      totalCostUsd: Number(totalCostUsd.toFixed(4)),
      avgRetries: Number(avgRetries.toFixed(2)),
      byPromptVersion,
    }
  }
}