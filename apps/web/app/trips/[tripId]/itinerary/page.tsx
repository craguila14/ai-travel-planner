'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { itinerariesApi, tripsApi, Itinerary, Activity, Trip } from '@/lib/api'
import { storage } from '@/lib/storage'
import { toast } from 'sonner'

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string }> = {
  restaurante: { emoji: '🍽️', color: 'bg-orange-100 text-orange-700' },
  museo: { emoji: '🏛️', color: 'bg-blue-100 text-blue-700' },
  monumento: { emoji: '🗿', color: 'bg-stone-100 text-stone-700' },
  naturaleza: { emoji: '🌿', color: 'bg-green-100 text-green-700' },
  entretenimiento: { emoji: '🎭', color: 'bg-purple-100 text-purple-700' },
  transporte: { emoji: '🚌', color: 'bg-gray-100 text-gray-700' },
  alojamiento: { emoji: '🏨', color: 'bg-indigo-100 text-indigo-700' },
  compras: { emoji: '🛍️', color: 'bg-pink-100 text-pink-700' },
}

function ConsensusBadge({ summary }: { summary: Activity['votesSummary'] }) {
  if (summary.total === 0) {
    return <span className="text-xs text-gray-400 font-medium">Sin votos</span>
  }
  const percent = summary.consensusPercent ?? 0
  const color =
    percent >= 60
      ? 'bg-green-100 text-green-700'
      : percent >= 40
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      👍 {summary.up}/{summary.participantCount}
    </span>
  )
}

function ActivityCard({
  activity,
  participantId,
  slug,
  onVote,
}: {
  activity: Activity
  participantId: string
  slug: string
  onVote: () => void
}) {
  const [voting, setVoting] = useState(false)
  const config = CATEGORY_CONFIG[activity.category] ?? {
    emoji: '📍',
    color: 'bg-gray-100 text-gray-700',
  }

  async function handleVote(value: 'UP' | 'DOWN') {
    setVoting(true)
    try {
      await itinerariesApi.vote(slug, activity.id, participantId, value)
      onVote()
    } catch {
      toast.error('Error al votar')
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
          {config.emoji} {activity.category}
        </span>
        <span className="text-xs text-gray-400">
          🕐 {activity.startTime} - {activity.endTime}
        </span>
        <ConsensusBadge summary={activity.votesSummary} />
      </div>
      <h3 className="font-bold text-gray-800 mb-1">{activity.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{activity.description}</p>
      <p className="text-sm font-semibold text-orange-500">
        💰 {activity.estimatedCost.toLocaleString()} por persona
      </p>
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => handleVote('UP')}
          disabled={voting}
          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2 rounded-xl text-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          👍 Me gusta ({activity.votesSummary.up})
        </button>
        <button
          onClick={() => handleVote('DOWN')}
          disabled={voting}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 rounded-xl text-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          👎 No me gusta ({activity.votesSummary.down})
        </button>
      </div>
    </div>
  )
}

export default function ItineraryPage() {
  const { tripId: slug } = useParams<{ tripId: string }>()
  const router = useRouter()
  const participant = storage.getParticipant(slug)

  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeDay, setActiveDay] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const [itineraryData, tripData] = await Promise.all([
        itinerariesApi.getLatest(slug),
        tripsApi.getBySlug(slug),
      ])
      setItinerary(itineraryData)
      setTrip(tripData)
    } catch {
      toast.error('Error al cargar el itinerario')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (!participant) {
      router.push(`/trips/${slug}`)
      return
    }
    loadData()
  }, [slug])

  async function handleRegenerate() {
    if (!participant?.isOrganizer) return
    setGenerating(true)
    try {
      await itinerariesApi.generate(slug, participant.participantId)
      await loadData()
      setActiveDay(0)
      toast.success('¡Nuevo itinerario generado!')
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Error al regenerar')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando itinerario...</div>
      </main>
    )
  }

  if (!itinerary) return null

  const currentDay = itinerary.days[activeDay]
  const totalCost = Number(itinerary.totalPerPerson)
  const dayTotal = currentDay?.activities.reduce(
    (sum, a) => sum + Number(a.estimatedCost),
    0,
  )

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 px-6 pt-8 pb-0 text-white">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push(`/trips/${slug}`)}
            className="text-white/70 text-sm mb-4 hover:text-white transition-colors block"
          >
            ← Volver al viaje
          </button>
          <div className="mb-4">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">
              Itinerario versión {itinerary.version}
            </p>
            <h1 className="text-3xl font-bold mb-1">🗓️ Tu viaje planificado</h1>
            <p className="text-white/80 text-sm">
              {itinerary.days.length} días • {trip?.currency}{' '}
              {totalCost.toLocaleString()} por persona
            </p>
          </div>

          {/* Pestañas de días */}
          <div className="flex gap-2 overflow-x-auto pb-0 scrollbar-hide">
            {itinerary.days.map((day, index) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(index)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-t-2xl font-bold text-sm transition-all cursor-pointer ${
                  activeDay === index
                    ? 'bg-gray-50 text-violet-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Día {day.dayNumber}
                <span className="block text-xs font-normal opacity-70">
                  {new Date(day.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Rationale */}
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="font-bold text-violet-700 text-sm uppercase tracking-wide">
              Por qué este itinerario
            </span>
            <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-semibold ml-auto">
              v{itinerary.version}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{itinerary.rationale}</p>
        </div>

        {/* Resumen del día activo */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 shadow-sm">
          <div>
            <p className="font-bold text-gray-800">
              Día {currentDay.dayNumber} —{' '}
              {new Date(currentDay.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <p className="text-sm text-gray-400">
              {currentDay.activities.length} actividades
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Costo del día</p>
            <p className="font-bold text-orange-500">
              {trip?.currency} {dayTotal?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actividades del día activo */}
        <div className="flex flex-col gap-3">
          {currentDay.activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              participantId={participant?.participantId ?? ''}
              slug={slug}
              onVote={loadData}
            />
          ))}
        </div>

        {/* Navegación entre días */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveDay((d) => Math.max(0, d - 1))}
            disabled={activeDay === 0}
            className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl hover:border-violet-300 transition-colors disabled:opacity-30 cursor-pointer"
          >
            ← Día anterior
          </button>
          <button
            onClick={() => setActiveDay((d) => Math.min(itinerary.days.length - 1, d + 1))}
            disabled={activeDay === itinerary.days.length - 1}
            className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl hover:border-violet-300 transition-colors disabled:opacity-30 cursor-pointer"
          >
            Día siguiente →
          </button>
        </div>

        {/* Resumen total de costos */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">💰 Resumen total</h2>
          {itinerary.days.map((day) => {
            const total = day.activities.reduce(
              (sum, a) => sum + Number(a.estimatedCost),
              0,
            )
            return (
              <div
                key={day.id}
                className={`flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0 cursor-pointer hover:text-violet-600 transition-colors ${
                  activeDay === itinerary.days.indexOf(day) ? 'text-violet-600 font-semibold' : 'text-gray-500'
                }`}
                onClick={() => setActiveDay(itinerary.days.indexOf(day))}
              >
                <span>Día {day.dayNumber}</span>
                <span>{trip?.currency} {total.toLocaleString()}</span>
              </div>
            )
          })}
          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="font-bold text-gray-800">Total por persona</span>
            <span className="font-bold text-orange-500 text-lg">
              {trip?.currency} {totalCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Botón regenerar */}
        {participant?.isOrganizer && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-1 cursor-pointer">🔄 Regenerar itinerario</h2>
            <p className="text-gray-400 text-sm mb-4">
              La IA usará los votos actuales como feedback para mejorar el itinerario.
            </p>
            <button
              onClick={handleRegenerate}
              disabled={generating}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-transform disabled:opacity-60 disabled:scale-100"
            >
              {generating ? '🤖 Generando...' : '✨ Regenerar con feedback'}
            </button>
          </div>
        )}

      </div>
    </main>
  )
}