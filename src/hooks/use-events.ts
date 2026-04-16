import { useState, useEffect } from 'react'

export interface GiraEvent {
  id: string
  groupId: string
  date: string
  time: string
  location: string
  description: string
  listId: string
  status: 'planejado' | 'em andamento' | 'fechado'
}

export function useEvents(groupId: string) {
  const [events, setEvents] = useState<GiraEvent[]>([])

  useEffect(() => {
    const data = localStorage.getItem(`umbanda_group_events_${groupId}`)
    if (data) {
      setEvents(JSON.parse(data))
    }
  }, [groupId])

  const saveEvents = (newEvents: GiraEvent[]) => {
    setEvents(newEvents)
    localStorage.setItem(`umbanda_group_events_${groupId}`, JSON.stringify(newEvents))
  }

  const addEvent = (event: Omit<GiraEvent, 'id' | 'groupId'>) => {
    const newEvent: GiraEvent = {
      ...event,
      id: crypto.randomUUID(),
      groupId,
    }
    saveEvents([...events, newEvent])
  }

  const updateEvent = (id: string, event: Partial<GiraEvent>) => {
    saveEvents(events.map((e) => (e.id === id ? { ...e, ...event } : e)))
  }

  const deleteEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id))
  }

  return { events, addEvent, updateEvent, deleteEvent }
}
