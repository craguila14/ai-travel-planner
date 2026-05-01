'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tripsApi } from '@/lib/api'
import { storage } from '@/lib/storage'
import { toast } from 'sonner'

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    currency: 'USD',
    organizerName: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { trip, participantId } = await tripsApi.create(form)

      storage.saveParticipant(trip.slug, {
        participantId,
        displayName: form.organizerName,
        isOrganizer: true,
      })

      toast.success('¡Viaje creado!')
      router.push(`/trips/${trip.slug}`)
    } catch {
      toast.error('Error al crear el viaje. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-800">Crear nuevo viaje</h1>
          <p className="text-gray-500 text-sm mt-1">
            Completa los datos y comparte el link con tus amigos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Nombre del viaje
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Viaje a Barcelona 2025"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Destino
            </label>
            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Ej: Barcelona, España"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Fecha inicio
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Fecha fin
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Moneda
            </label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="USD">USD — Dólar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="CLP">CLP — Peso chileno</option>
              <option value="MXN">MXN — Peso mexicano</option>
              <option value="ARS">ARS — Peso argentino</option>
              <option value="COP">COP — Peso colombiano</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Tu nombre
            </label>
            <input
              name="organizerName"
              value={form.organizerName}
              onChange={handleChange}
              placeholder="Ej: Carlos"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform disabled:opacity-60 disabled:scale-100"
          >
            {loading ? 'Creando viaje...' : '✈️ Crear viaje'}
          </button>

        </form>
      </div>
    </main>
  )
}