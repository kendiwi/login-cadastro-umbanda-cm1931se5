import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import useRealtime from '@/hooks/use-realtime'

export interface GroupingList {
  id: string
  groupId: string
  name: string
  mediumIds: string[]
}

export function useGroupingLists(groupId: string) {
  const [lists, setLists] = useState<GroupingList[]>([])

  const load = useCallback(async () => {
    if (!groupId) return
    try {
      const [listRecords, itemsRecords] = await Promise.all([
        pb.collection('listas_agrupamento').getFullList({
          filter: `grupo_id = "${groupId}"`,
        }),
        pb.collection('lista_mediuns').getFullList({
          filter: `lista_id.grupo_id = "${groupId}"`,
        }),
      ])

      const listsData = listRecords.map((l: any) => {
        const mIds = itemsRecords
          .filter((item: any) => item.lista_id === l.id)
          .map((item: any) => item.medium_id)

        return {
          id: l.id,
          groupId: l.grupo_id,
          name: l.nome,
          mediumIds: mIds,
        }
      })
      setLists(listsData)
    } catch (error) {
      console.error('Failed to load lists', error)
      setLists([])
    }
  }, [groupId])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('listas_agrupamento', () => {
    load()
  })
  useRealtime('lista_mediuns', () => {
    load()
  })

  const addList = async (list: Omit<GroupingList, 'id' | 'groupId'>) => {
    const newList = await pb.collection('listas_agrupamento').create({
      grupo_id: groupId,
      nome: list.name,
    })

    for (const mId of list.mediumIds) {
      await pb.collection('lista_mediuns').create({
        lista_id: newList.id,
        medium_id: mId,
      })
    }
  }

  const updateList = async (id: string, list: Omit<GroupingList, 'id' | 'groupId'>) => {
    await pb.collection('listas_agrupamento').update(id, {
      nome: list.name,
    })

    const existing = await pb.collection('lista_mediuns').getFullList({
      filter: `lista_id = "${id}"`,
    })

    const existingIds = existing.map((e: any) => e.medium_id)
    const toAdd = list.mediumIds.filter((m) => !existingIds.includes(m))
    const toRemove = existing.filter((e: any) => !list.mediumIds.includes(e.medium_id))

    for (const r of toRemove) {
      await pb.collection('lista_mediuns').delete(r.id)
    }
    for (const a of toAdd) {
      await pb.collection('lista_mediuns').create({
        lista_id: id,
        medium_id: a,
      })
    }
  }

  const deleteList = async (id: string) => {
    await pb.collection('listas_agrupamento').delete(id)
  }

  return { lists, addList, updateList, deleteList }
}
