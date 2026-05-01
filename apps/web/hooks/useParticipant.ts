'use client'

import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'

interface ParticipantData {
  participantId: string
  displayName: string
  isOrganizer: boolean
}

export function useParticipant(tripSlug: string) {
  const [participant, setParticipant] = useState<ParticipantData | null>(null)

  useEffect(() => {
    const data = storage.getParticipant(tripSlug)
    setParticipant(data)
  }, [tripSlug])

  const save = (data: ParticipantData) => {
    storage.saveParticipant(tripSlug, data)
    setParticipant(data)
  }

  return { participant, save }
}