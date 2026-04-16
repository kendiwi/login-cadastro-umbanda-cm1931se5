import { useState, useEffect } from 'react'

export interface GroupingList {
  id: string
  groupId: string
  name: string
  mediumIds: string[]
}

export function useGroupingLists(groupId: string) {
  const [lists, setLists] = useState<GroupingList[]>([])

  useEffect(() => {
    const data = localStorage.getItem(`umbanda_group_lists_${groupId}`)
    if (data) {
      setLists(JSON.parse(data))
    }
  }, [groupId])

  const saveLists = (newLists: GroupingList[]) => {
    setLists(newLists)
    localStorage.setItem(`umbanda_group_lists_${groupId}`, JSON.stringify(newLists))
  }

  const addList = (list: Omit<GroupingList, 'id' | 'groupId'>) => {
    const newList: GroupingList = {
      ...list,
      id: crypto.randomUUID(),
      groupId,
    }
    saveLists([...lists, newList])
  }

  const updateList = (id: string, list: Omit<GroupingList, 'id' | 'groupId'>) => {
    saveLists(lists.map((l) => (l.id === id ? { ...l, ...list } : l)))
  }

  const deleteList = (id: string) => {
    saveLists(lists.filter((l) => l.id !== id))
  }

  return { lists, addList, updateList, deleteList }
}
