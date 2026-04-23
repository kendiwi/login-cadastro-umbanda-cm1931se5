import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import useRealtime from '@/hooks/use-realtime'

export interface GiraEvent {
  id: string
  groupId: string
  name: string
  date: string
  time: string
  location: string
  description: string
  listId: string
  status: 'planejado' | 'em andamento' | 'fechado'
  attendance?: Record<string, boolean>
  atendimentoPreferencial?: number
  atendimentoNormal?: number
  atendimentoPasse?: number
}

export function useEvents(groupId: string) {
  const [events, setEvents] = useState<GiraEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!groupId) return
    setIsLoading(true)
    setError(null)
    try {
      const [eventRecords, presencaRecords] = await Promise.all([
        pb.collection('eventos_gira').getFullList({
          filter: `grupo_id = "${groupId}"`,
          sort: '-data',
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
          name: e.nome_evento || 'Evento sem nome',
          date: e.data ? e.data.split(' ')[0] : '',
          time: e.hora,
          location: e.local,
          description: e.descricao || '',
          listId: e.lista_id || '',
          status: e.status,
          attendance,
          atendimentoPreferencial: e.atendimento_preferencial,
          atendimentoNormal: e.atendimento_normal,
          atendimentoPasse: e.atendimento_passe,
        }
      })
      setEvents(eventsData)
    } catch (err: any) {
      console.error('Failed to load events', err)
      setError(err.message || 'Erro ao carregar eventos')
      setEvents([])
    } finally {
      setIsLoading(false)
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

  const addEvent = async (
    event: Omit<GiraEvent, 'id' | 'groupId'> & { participantIds?: string[] },
  ) => {
    const createdEvent = await pb.collection('eventos_gira').create({
      grupo_id: groupId,
      nome_evento: event.name,
      lista_id: event.listId || null,
      data: event.date ? event.date + ' 12:00:00.000Z' : null,
      hora: event.time,
      local: event.location,
      descricao: event.description,
      status: event.status,
    })

    if (event.participantIds && event.participantIds.length > 0) {
      try {
        await Promise.all(
          event.participantIds.map((mId) =>
            pb.collection('presenca').create({
              evento_id: createdEvent.id,
              medium_id: mId,
              presente: false,
            }),
          ),
        )
      } catch (error) {
        console.error('Failed to create attendance records', error)
      }
    } else if (!event.listId) {
      try {
        const allMediuns = await pb.collection('mediuns').getFullList({
          filter: `grupo_id = "${groupId}"`,
        })
        await Promise.all(
          allMediuns.map((m) =>
            pb.collection('presenca').create({
              evento_id: createdEvent.id,
              medium_id: m.id,
              presente: false,
            }),
          ),
        )
      } catch (error) {
        console.error('Failed to create attendance records', error)
      }
    }
  }

  const updateEvent = async (
    id: string,
    event: Partial<GiraEvent> & { participantIds?: string[] },
  ) => {
    if (
      event.name !== undefined ||
      event.status !== undefined ||
      event.date !== undefined ||
      event.time !== undefined ||
      event.location !== undefined ||
      event.description !== undefined ||
      event.listId !== undefined
    ) {
      const data: any = {}
      if (event.name !== undefined) data.nome_evento = event.name
      if (event.date) data.data = event.date + ' 12:00:00.000Z'
      if (event.time) data.hora = event.time
      if (event.location) data.local = event.location
      if (event.description !== undefined) data.descricao = event.description
      if (event.listId !== undefined) data.lista_id = event.listId || null
      if (event.status) data.status = event.status
      if (event.atendimentoPreferencial !== undefined)
        data.atendimento_preferencial = event.atendimentoPreferencial
      if (event.atendimentoNormal !== undefined) data.atendimento_normal = event.atendimentoNormal
      if (event.atendimentoPasse !== undefined) data.atendimento_passe = event.atendimentoPasse

      if (Object.keys(data).length > 0) {
        await pb.collection('eventos_gira').update(id, data)
      }
    }

    if (event.participantIds) {
      const existing = await pb.collection('presenca').getFullList({
        filter: `evento_id = "${id}"`,
      })
      const existingIds = existing.map((p) => p.medium_id)
      const toRemove = existing.filter((p) => !event.participantIds!.includes(p.medium_id))
      const toAdd = event.participantIds.filter((mId) => !existingIds.includes(mId))

      for (const p of toRemove) {
        await pb.collection('presenca').delete(p.id)
      }
      for (const mId of toAdd) {
        await pb.collection('presenca').create({
          evento_id: id,
          medium_id: mId,
          presente: false,
        })
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

  return { events, addEvent, updateEvent, deleteEvent, isLoading, error }
}
