import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import useRealtime from '@/hooks/use-realtime'

export interface GiraEvent {
  id: string
  groupId: string
  date: string
  time: string
  location: string
  description: string
  listId: string
  status: 'planejado' | 'em andamento' | 'fechado'
  attendance?: Record<string, boolean>
}

export function useEvents(groupId: string) {
  const [events, setEvents] = useState<GiraEvent[]>([])

  const load = useCallback(async () => {
    if (!groupId) return
    try {
      const [eventRecords, presencaRecords] = await Promise.all([
        pb.collection('eventos_gira').getFullList({
          filter: `grupo_id = "${groupId}"`,
        }),
        pb.collection('presenca').getFullList({
          filter: `evento_id.grupo_id = "${groupId}"`,
        }),
      ])

      const eventsData = eventRecords.map((e: any) => {
        const attendance: Record<string, boolean> = {}
        presencaRecords
          .filter((p: any) => p.evento_id === e.id)
          .forEach((p: any) => {
            attendance[p.medium_id] = p.presente
          })

        return {
          id: e.id,
          groupId: e.grupo_id,
          date: e.data ? e.data.split(' ')[0] : '',
          time: e.hora,
          location: e.local,
          description: e.descricao || '',
          listId: e.lista_id,
          status: e.status,
          attendance,
        }
      })
      setEvents(eventsData)
    } catch (error) {
      console.error('Failed to load events', error)
      setEvents([])
    }
  }, [groupId])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('eventos_gira', () => {
    load()
  })
  useRealtime('presenca', () => {
    load()
  })

  const addEvent = async (event: Omit<GiraEvent, 'id' | 'groupId'>) => {
    await pb.collection('eventos_gira').create({
      grupo_id: groupId,
      lista_id: event.listId,
      data: event.date ? event.date + ' 12:00:00.000Z' : null,
      hora: event.time,
      local: event.location,
      descricao: event.description,
      status: event.status,
    })
  }

  const updateEvent = async (id: string, event: Partial<GiraEvent>) => {
    if (
      event.status ||
      event.date ||
      event.time ||
      event.location ||
      event.description ||
      event.listId
    ) {
      const data: any = {}
      if (event.date) data.data = event.date + ' 12:00:00.000Z'
      if (event.time) data.hora = event.time
      if (event.location) data.local = event.location
      if (event.description !== undefined) data.descricao = event.description
      if (event.listId) data.lista_id = event.listId
      if (event.status) data.status = event.status

      if (Object.keys(data).length > 0) {
        await pb.collection('eventos_gira').update(id, data)
      }
    }

    if (event.attendance) {
      const existing = await pb.collection('presenca').getFullList({
        filter: `evento_id = "${id}"`,
      })

      for (const [mId, presente] of Object.entries(event.attendance)) {
        const p = existing.find((x: any) => x.medium_id === mId)
        if (p) {
          if (p.presente !== presente) {
            await pb.collection('presenca').update(p.id, { presente })
          }
        } else {
          await pb.collection('presenca').create({
            evento_id: id,
            medium_id: mId,
            presente,
          })
        }
      }
    }
  }

  const deleteEvent = async (id: string) => {
    await pb.collection('eventos_gira').delete(id)
  }

  return { events, addEvent, updateEvent, deleteEvent }
}
