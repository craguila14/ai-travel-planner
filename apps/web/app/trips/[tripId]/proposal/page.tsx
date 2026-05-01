'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { proposalsApi } from '@/lib/api'
import { storage } from '@/lib/storage'
import { toast } from 'sonner'

const STYLES = [
  { value: 'cultural', label: '🏛️ Cultural', desc: 'Museos y patrimonio' },
  { value: 'gastronómico', label: '🍽️ Gastronómico', desc: 'Comida y restaurantes' },
  { value: 'aventura', label: '🧗 Aventura', desc: 'Deportes y adrenalina' },
  { value: 'playa', label: '🏖️ Playa', desc: 'Sol y mar' },
  { value: 'naturaleza', label: '🌿 Naturaleza', desc: 'Parques y paisajes' },
  { value: 'nocturno', label: '🌙 Nocturno', desc: 'Bares y vida nocturna' },
]

const PACE_OPTIONS = [
  { value: 'relajado', label: '😌 Relajado', desc: 'Pocas actividades, mucho tiempo libre' },
  { value: 'equilibrado', label: '⚖️ Equilibrado', desc: 'Mix de actividades y descanso' },
  { value: 'intenso', label: '⚡ Intenso', desc: 'Aprovechar cada momento' },
]

const SCHEDULE_OPTIONS = [
  { value: 'mañanero', label: '🌅 Mañanero', desc: 'Empezar temprano' },
  { value: 'flexible', label: '🕐 Flexible', desc: 'Sin horario fijo' },
  { value: 'trasnochador', label: '🌙 Trasnochador', desc: 'Tarde y noche' },
]

const STEPS = ['Presupuesto', 'Estilo', 'Ritmo', 'Deseos']

export default function ProposalPage() {
  const { tripId: slug } = useParams<{ tripId: string }>()
  const router = useRouter()
  const participant = storage.getParticipant(slug)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    budgetMin: 500,
    budgetMax: 1500,
    style: [] as string[],
    pace: '',
    schedule: '',
    mustVisit: '',
    mustAvoid: '',
    notes: '',
  })

  useEffect(() => {
    if (!participant) {
      toast.error('Debes unirte al viaje primero')
      router.push(`/trips/${slug}`)
    }
  }, [participant])

  function toggleStyle(value: string) {
    setForm((prev) => ({
      ...prev,
      style: prev.style.includes(value)
        ? prev.style.filter((s) => s !== value)
        : [...prev.style, value],
    }))
  }

  function canAdvance() {
    if (step === 0) return form.budgetMin >= 0 && form.budgetMax > form.budgetMin
    if (step === 1) return form.style.length > 0
    if (step === 2) return form.pace !== '' && form.schedule !== ''
    if (step === 3) return form.mustVisit.length >= 3 && form.mustAvoid.length >= 3
    return false
  }

  async function handleSubmit() {
    if (!participant) return
    setLoading(true)
    try {
      await proposalsApi.submit(slug, {
        participantId: participant.participantId,
        ...form,
      })
      toast.success('¡Propuesta enviada!')
      router.push(`/trips/${slug}`)
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Error al enviar la propuesta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-6 text-white">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">
            Tu propuesta
          </p>
          <h1 className="text-2xl font-bold">
            Hola, {participant?.displayName} 👋
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Cuéntanos qué esperas del viaje
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 transition-all ${
                i <= step ? 'bg-orange-500' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

        <div className="px-8 py-6">
          {/* Step label */}
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">
            Paso {step + 1} de {STEPS.length} — {STEPS[step]}
          </p>

          {/* Step 0 — Presupuesto */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-gray-800">
                ¿Cuál es tu presupuesto? 💰
              </h2>
              <p className="text-gray-500 text-sm">
                Indica tu rango en {participant ? 'la moneda del viaje' : 'USD'}.
                Incluye todo: transporte local, comidas y actividades.
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Mínimo — lo menos que puedes gastar
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={500000}
                      step={50}
                      value={form.budgetMin}
                      onChange={(e) => setForm({ ...form, budgetMin: Number(e.target.value) })}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-orange-500 font-bold w-20 text-right">
                      {form.budgetMin.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Máximo — lo más que puedes gastar
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={5000000}
                      step={50}
                      value={form.budgetMax}
                      onChange={(e) => setForm({ ...form, budgetMax: Number(e.target.value) })}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-orange-500 font-bold w-20 text-right">
                      {form.budgetMax.toLocaleString()}
                    </span>
                  </div>
                </div>
                {form.budgetMin >= form.budgetMax && (
                  <p className="text-red-500 text-sm">
                    El mínimo debe ser menor al máximo
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 1 — Estilo */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800">
                ¿Qué tipo de viaje buscas? 🎯
              </h2>
              <p className="text-gray-500 text-sm">
                Puedes elegir varios estilos.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {STYLES.map((s) => {
                  const selected = form.style.includes(s.value)
                  return (
                    <button
                      key={s.value}
                      onClick={() => toggleStyle(s.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-100 hover:border-orange-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{s.label.split(' ')[0]}</div>
                      <div className="font-semibold text-sm text-gray-700">
                        {s.label.split(' ').slice(1).join(' ')}
                      </div>
                      <div className="text-xs text-gray-400">{s.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Ritmo y horario */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  ¿A qué ritmo quieres ir? ⚡
                </h2>
                <p className="text-gray-500 text-sm mb-3">
                  Elige el ritmo que mejor te describe.
                </p>
                <div className="flex flex-col gap-2">
                  {PACE_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setForm({ ...form, pace: p.value })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.pace === p.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-100 hover:border-orange-200'
                      }`}
                    >
                      <span className="font-semibold text-gray-700">{p.label}</span>
                      <span className="text-gray-400 text-sm ml-2">— {p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  ¿Eres mañanero o trasnochador? 🌅
                </h2>
                <p className="text-gray-500 text-sm mb-3">
                  Esto ayuda a organizar los horarios del día.
                </p>
                <div className="flex flex-col gap-2">
                  {SCHEDULE_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setForm({ ...form, schedule: s.value })}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        form.schedule === s.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-100 hover:border-orange-200'
                      }`}
                    >
                      <span className="font-semibold text-gray-700">{s.label}</span>
                      <span className="text-gray-400 text-sm ml-2">— {s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Deseos */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-gray-800">
                ¿Qué no puede faltar? ✨
              </h2>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Lugares o experiencias que SÍ quieres 🌟
                </label>
                <textarea
                  value={form.mustVisit}
                  onChange={(e) => setForm({ ...form, mustVisit: e.target.value })}
                  placeholder="Ej: Quiero ver la Sagrada Familia, probar paella auténtica y caminar por Las Ramblas"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Cosas que quieres evitar ❌
                </label>
                <textarea
                  value={form.mustAvoid}
                  onChange={(e) => setForm({ ...form, mustAvoid: e.target.value })}
                  placeholder="Ej: No como mariscos, no quiero museos de arte moderno, evitar discotecas"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-1 block">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ej: Tengo vuelo de regreso el último día a las 20:00"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-2xl hover:border-orange-300 transition-colors"
              >
                ← Atrás
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canAdvance() || loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-2xl hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100"
              >
                {loading ? 'Enviando...' : '✅ Enviar propuesta'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}