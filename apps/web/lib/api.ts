import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Participant {
  id: string
  tripId: string
  displayName: string
  isOrganizer: boolean
  joinedAt: string
}

export interface Trip {
  id: string
  slug: string
  name: string
  destination: string
  startDate: string
  endDate: string
  currency: string
  status: 'COLLECTING' | 'GENERATING' | 'VOTING' | 'DONE'
  participants: Participant[]
  proposals: Proposal[]
}

export interface Proposal {
  id: string
  tripId: string
  participantId: string
  budgetMin: number
  budgetMax: number
  style: string[]
  pace: string
  schedule: string
  mustVisit: string
  mustAvoid: string
  notes?: string
  participant: Participant
}

export interface VoteSummary {
  up: number
  down: number
  total: number
  consensusPercent: number | null
  participantCount: number
}

export interface Activity {
  id: string
  startTime: string
  endTime: string
  title: string
  description: string
  category: string
  placeId: string
  estimatedCost: number
  votesSummary: VoteSummary
}

export interface ItineraryDay {
  id: string
  dayNumber: number
  date: string
  activities: Activity[]
}

export interface Itinerary {
  id: string
  tripId: string
  version: number
  rationale: string
  totalPerPerson: number
  status: 'DRAFT' | 'VOTING' | 'APPROVED'
  promptVersion: string
  createdAt: string
  days: ItineraryDay[]
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const tripsApi = {
  create: async (data: {
    name: string
    destination: string
    startDate: string
    endDate: string
    currency?: string
    organizerName: string
  }) => {
    const res = await api.post<{ trip: Trip; participantId: string }>('/trips', data)
    return res.data
  },

  getBySlug: async (slug: string) => {
    const res = await api.get<Trip>(`/trips/${slug}`)
    return res.data
  },

  join: async (slug: string, displayName: string) => {
    const res = await api.post<{ trip: Trip; participantId: string }>(
      `/trips/${slug}/join`,
      { displayName },
    )
    return res.data
  },
}

export const proposalsApi = {
  submit: async (
    slug: string,
    data: {
      participantId: string
      budgetMin: number
      budgetMax: number
      style: string[]
      pace: string
      schedule: string
      mustVisit: string
      mustAvoid: string
      notes?: string
    },
  ) => {
    const res = await api.post<Proposal>(`/trips/${slug}/proposals`, data)
    return res.data
  },

  getAll: async (slug: string) => {
    const res = await api.get<Proposal[]>(`/trips/${slug}/proposals`)
    return res.data
  },
}

export const itinerariesApi = {
  generate: async (slug: string, participantId: string) => {
    const res = await api.post<Itinerary>(`/trips/${slug}/itineraries/generate`, {
      participantId,
    })
    return res.data
  },

  getLatest: async (slug: string) => {
    const res = await api.get<Itinerary>(`/trips/${slug}/itineraries/latest`)
    return res.data
  },

  vote: async (
    slug: string,
    activityId: string,
    participantId: string,
    value: 'UP' | 'DOWN',
  ) => {
    const res = await api.post(
      `/trips/${slug}/itineraries/activities/${activityId}/vote`,
      { participantId, value },
    )
    return res.data
  },
}