import { useState, useEffect, useCallback } from 'react'

export interface Medium {
  id: string
  grupo_id: string
  nome: string
  data_nascimento: string
  contato: string
  foto: string
}

export function useMediuns(grupoId: string) {
  const [mediuns, setMediuns] = useState<Medium[]>([])

  const load = useCallback(() => {
    try {
      const data = localStorage.getItem('mediuns_db')
      const all: Medium[] = data ? JSON.parse(data) : []
      setMediuns(all.filter((m) => m.grupo_id === grupoId))
    } catch (error) {
      console.error('Failed to load mediuns', error)
      setMediuns([])
    }
  }, [grupoId])

  useEffect(() => {
    load()
  }, [load])

  const addMedium = (medium: Omit<Medium, 'id' | 'grupo_id'>) => {
    const data = localStorage.getItem('mediuns_db')
    const all: Medium[] = data ? JSON.parse(data) : []
    const newId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15)

    const newMedium: Medium = { ...medium, id: newId, grupo_id: grupoId }
    all.push(newMedium)
    localStorage.setItem('mediuns_db', JSON.stringify(all))
    load()
  }

  const updateMedium = (id: string, medium: Partial<Medium>) => {
    const data = localStorage.getItem('mediuns_db')
    const all: Medium[] = data ? JSON.parse(data) : []
    const index = all.findIndex((m) => m.id === id)
    if (index !== -1) {
      all[index] = { ...all[index], ...medium }
      localStorage.setItem('mediuns_db', JSON.stringify(all))
      load()
    }
  }

  const deleteMedium = (id: string) => {
    const data = localStorage.getItem('mediuns_db')
    const all: Medium[] = data ? JSON.parse(data) : []
    const filtered = all.filter((m) => m.id !== id)
    localStorage.setItem('mediuns_db', JSON.stringify(filtered))
    load()
  }

  return { mediuns, addMedium, updateMedium, deleteMedium, refresh: load }
}
