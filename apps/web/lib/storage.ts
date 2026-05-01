const STORAGE_KEY = 'travel_planner_participants'

interface ParticipantMap {
  [tripSlug: string]: {
    participantId: string
    displayName: string
    isOrganizer: boolean
  }
}

export const storage = {
  saveParticipant: (
    tripSlug: string,
    data: { participantId: string; displayName: string; isOrganizer: boolean },
  ) => {
    const current = storage.getAll()
    current[tripSlug] = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  },

  getParticipant: (tripSlug: string) => {
    const current = storage.getAll()
    return current[tripSlug] ?? null
  },

  getAll: (): ParticipantMap => {
    if (typeof window === 'undefined') return {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  },

  clear: (tripSlug: string) => {
    const current = storage.getAll()
    delete current[tripSlug]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  },
}