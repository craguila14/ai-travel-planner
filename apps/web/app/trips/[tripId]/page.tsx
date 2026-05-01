'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { tripsApi, Trip, itinerariesApi } from '@/lib/api'
import { storage } from '@/lib/storage'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  COLLECTING: { label: 'Recolectando propuestas', color: 'bg-yellow-100 text-yellow-700', emoji: '📝' },
  GENERATING: { label: 'Generando itinerario...', color: 'bg-blue-100 text-blue-700', emoji: '🤖' },
  VOTING: { label: 'Votando itinerario', color: 'bg-purple-100 text-purple-700', emoji: '🗳️' },
  DONE: { label: 'Itinerario aprobado', color: 'bg-green-100 text-green-700', emoji: '✅' },
}

const DESTINATION_GRADIENTS = [
  'from-orange-500 via-pink-500 to-red-500',
  'from-violet-600 via-blue-500 to-cyan-400',
  'from-green-500 via-teal-500 to-cyan-500',
  'from-yellow-500 via-orange-500 to-pink-500',
  'from-blue-600 via-indigo-500 to-purple-500',
]

function getGradient(slug: string) {
  const index = slug.charCodeAt(0) % DESTINATION_GRADIENTS.length
  return DESTINATION_GRADIENTS[index]
}

export default function TripPage() {
  const { tripId: slug } = useParams<{ tripId: string }>()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joinName, setJoinName] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)

  const participant = storage.getParticipant(slug)

  useEffect(() => {
    loadTrip()
  }, [slug])

  useEffect(() => {
  const interval = setInterval(() => {
    if (trip?.status !== 'DONE') {
      loadTrip()
    }
  }, 5000)

  return () => clearInterval(interval)
}, [trip?.status])

  async function loadTrip() {
    try {
      const data = await tripsApi.getBySlug(slug)
      setTrip(data)
    } catch {
      toast.error('Viaje no encontrado')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoining(true)
    try {
      const { trip: updatedTrip, participantId } = await tripsApi.join(slug, joinName)
      storage.saveParticipant(slug, {
        participantId,
        displayName: joinName,
        isOrganizer: false,
      })
      setTrip(updatedTrip)
      setShowJoinForm(false)
      toast.success(`¡Bienvenido, ${joinName}!`)
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Error al unirse al viaje')
    } finally {
      setJoining(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    toast.success('¡Link copiado!')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando viaje...</div>
      </main>
    )
  }

  if (!trip) return null

  const status = STATUS_LABELS[trip.status]
  const gradient = getGradient(slug)
  const isParticipant = !!participant
  const hasProposal = trip.proposals?.some(
    (p) => p.participantId === participant?.participantId,
  )

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-br ${gradient} px-6 py-10 text-white`}>
        <div className="max-w-2xl mx-auto">
          <p className="text-white/70 text-sm mb-1 uppercase tracking-widest font-semibold">
            Viaje grupal
          </p>
          <h1 className="text-4xl font-bold mb-1">{trip.name}</h1>
          <p className="text-white/80 text-lg mb-4">📍 {trip.destination}</p>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              📅 {new Date(trip.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              {' → '}
              {new Date(trip.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              💰 {trip.currency}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              👥 {trip.participants.length} participante{trip.participants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Status */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm ${status.color}`}>
          <span className="text-lg">{status.emoji}</span>
          {status.label}
          {trip.status === 'GENERATING' && (
            <span className="ml-auto animate-pulse">●</span>
          )}
        </div>

        {/* Compartir link */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Link para compartir</p>
            <p className="text-sm text-gray-700 truncate">{typeof window !== 'undefined' ? window.location.href : ''}</p>
          </div>
          <button
            onClick={copyLink}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform whitespace-nowrap"
          >
            📋 Copiar
          </button>
        </div>

        {/* Participantes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">👥 Participantes</h2>
          <div className="flex flex-col gap-2">
            {trip.participants.map((p) => {
              const submitted = trip.proposals?.some(
                (prop) => prop.participantId === p.id,
              )
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${gradient}`}>
                      {p.displayName[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {p.displayName}
                      {p.isOrganizer && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                          Organizador
                        </span>
                      )}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${submitted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {submitted ? '✅ Propuesta enviada' : '⏳ Pendiente'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Acciones */}
        {!isParticipant && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            {!showJoinForm ? (
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform"
              >
                🙋 Unirme al viaje
              </button>
            ) : (
              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  disabled={joining}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-4 py-2 rounded-xl hover:scale-105 transition-transform disabled:opacity-60"
                >
                  {joining ? '...' : 'Entrar'}
                </button>
              </form>
            )}
          </div>
        )}

        {isParticipant && trip.status === 'COLLECTING' && (
          <button
            onClick={() => router.push(`/trips/${slug}/proposal`)}
            className={`w-full font-bold py-4 rounded-2xl text-white hover:scale-105 transition-transform shadow-md bg-gradient-to-r ${
              hasProposal
                ? 'from-green-500 to-teal-500'
                : 'from-orange-500 to-pink-500'
            }`}
          >
            {hasProposal ? '✏️ Editar mi propuesta' : '📝 Enviar mi propuesta'}
          </button>
        )}

        {isParticipant && (trip.status === 'VOTING' || trip.status === 'DONE') && (
          <button
            onClick={() => router.push(`/trips/${slug}/itinerary`)}
            className="w-full bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform shadow-md"
          >
            🗓️ Ver itinerario
          </button>
        )}

        {isParticipant &&
  participant?.isOrganizer &&
  trip.status === 'COLLECTING' &&
  trip.proposals?.length === trip.participants.length && (
    <button
      onClick={async () => {
        try {
          await itinerariesApi.generate(slug, participant.participantId)
          toast.success('¡Itinerario generado!')
          await loadTrip()
        } catch (error: any) {
          toast.error(error?.response?.data?.message ?? 'Error al generar')
        }
      }}
      className="w-full bg-gradient-to-r from-violet-600 to-blue-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform shadow-md"
    >
      🤖 Generar itinerario con IA
    </button>
  )}

      </div>

      
    </main>
  )
}