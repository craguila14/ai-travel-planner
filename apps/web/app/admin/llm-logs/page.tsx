'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface LlmLog {
  id: string
  createdAt: string
  promptVersion: string
  model: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
  costUsd: number
  success: boolean
  errorType: string | null
  retryCount: number
  tripId: string | null
}

interface Stats {
  totalCalls: number
  successRate: number
  avgLatencyMs: number
  totalCostUsd: number
  avgRetries: number
  byPromptVersion: {
    version: string
    calls: number
    successRate: number
    totalCostUsd: number
  }[]
}

export default function LlmLogsPage() {
  const [logs, setLogs] = useState<LlmLog[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/llm-logs`,
        )
        setLogs(res.data.logs)
        setStats(res.data.stats)
      } catch {
        console.error('Error loading logs')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Cargando logs...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-8 text-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-1">
            Panel de administración
          </p>
          <h1 className="text-3xl font-bold">🤖 Observabilidad LLM</h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitoreo de llamadas a Claude API
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Total llamadas',
                value: stats.totalCalls,
                emoji: '📞',
                color: 'from-blue-500 to-blue-600',
              },
              {
                label: 'Tasa de éxito',
                value: `${stats.successRate}%`,
                emoji: '✅',
                color: 'from-green-500 to-green-600',
              },
              {
                label: 'Latencia promedio',
                value: `${(stats.avgLatencyMs / 1000).toFixed(1)}s`,
                emoji: '⚡',
                color: 'from-yellow-500 to-orange-500',
              },
              {
                label: 'Costo total',
                value: `$${stats.totalCostUsd}`,
                emoji: '💰',
                color: 'from-purple-500 to-violet-600',
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-md`}
              >
                <div className="text-2xl mb-2">{card.emoji}</div>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-white/70 text-xs mt-1">{card.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Por versión de prompt */}
        {stats && stats.byPromptVersion.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-700 mb-4">
              📊 Comparativa por versión de prompt
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-semibold">Versión</th>
                    <th className="pb-3 font-semibold">Llamadas</th>
                    <th className="pb-3 font-semibold">Tasa éxito</th>
                    <th className="pb-3 font-semibold">Costo total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byPromptVersion.map((row) => (
                    <tr key={row.version} className="border-b border-gray-50 last:border-0">
                      <td className="py-3">
                        <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {row.version}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{row.calls}</td>
                      <td className="py-3">
                        <span className={`font-semibold ${
                          row.successRate >= 80
                            ? 'text-green-600'
                            : row.successRate >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {row.successRate}%
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">${row.totalCostUsd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs individuales */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-700 mb-4">
            📋 Últimas 100 llamadas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Fecha</th>
                  <th className="pb-3 font-semibold">Prompt</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold">Tokens</th>
                  <th className="pb-3 font-semibold">Latencia</th>
                  <th className="pb-3 font-semibold">Costo</th>
                  <th className="pb-3 font-semibold">Reintentos</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-gray-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3">
                      <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
                        {log.promptVersion}
                      </span>
                    </td>
                    <td className="py-3">
                      {log.success ? (
                        <span className="text-green-600 font-semibold">✅ OK</span>
                      ) : (
                        <span className="text-red-500 font-semibold">
                          ❌ {log.errorType ?? 'error'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-600">
                      {log.inputTokens + log.outputTokens}
                    </td>
                    <td className="py-3 text-gray-600">
                      {(log.latencyMs / 1000).toFixed(1)}s
                    </td>
                    <td className="py-3 text-gray-600">
                      ${Number(log.costUsd).toFixed(4)}
                    </td>
                    <td className="py-3">
                      {log.retryCount > 0 ? (
                        <span className="text-yellow-600 font-semibold">
                          {log.retryCount}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No hay llamadas registradas todavía
              </p>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}