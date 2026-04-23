import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

export interface PendingChange {
  mediumId: string
  presente: boolean
  timestamp: number
}

export function useOfflineSync(eventId: string | undefined) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [manualSyncRequired, setManualSyncRequired] = useState(false)

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})

  // Load from local storage
  useEffect(() => {
    if (!eventId) return
    const key = `presenca_pendentes_${eventId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setPendingChanges(JSON.parse(stored))
      } catch (e) {
        setPendingChanges([])
      }
    } else {
      setPendingChanges([])
    }
  }, [eventId])

  // Update local storage
  useEffect(() => {
    if (!eventId) return
    const key = `presenca_pendentes_${eventId}`
    if (pendingChanges.length > 0) {
      localStorage.setItem(key, JSON.stringify(pendingChanges))
    } else {
      localStorage.removeItem(key)
    }
  }, [pendingChanges, eventId])

  // Online status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const syncSingle = async (
    mediumId: string,
    presente: boolean,
    retryCount = 0,
  ): Promise<boolean> => {
    if (!eventId || !mediumId || typeof presente !== 'boolean') {
      toast.error('Dados inválidos. Recarregue a página.')
      return false
    }

    try {
      const existing = await pb.collection('presenca').getFullList({
        filter: `evento_id = "${eventId}" && medium_id = "${mediumId}"`,
      })

      if (existing.length > 0) {
        await pb.collection('presenca').update(existing[0].id, { presente })
      } else {
        await pb.collection('presenca').create({
          evento_id: eventId,
          medium_id: mediumId,
          presente,
        })
      }
      return true
    } catch (err: any) {
      if (retryCount < 3 && navigator.onLine) {
        const delay = Math.pow(2, retryCount + 1) * 1000 // 2s, 4s, 8s
        toast.error(`Erro ao salvar. Tentando novamente em ${delay / 1000}s...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return syncSingle(mediumId, presente, retryCount + 1)
      }
      return false
    }
  }

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine || pendingChanges.length === 0 || isSyncing || !eventId) return
    setIsSyncing(true)

    let allSuccess = true
    const currentPending = [...pendingChanges]

    for (const change of currentPending) {
      setSavingIds((prev) => new Set(prev).add(change.mediumId))
      const success = await syncSingle(change.mediumId, change.presente)
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(change.mediumId)
        return next
      })

      if (success) {
        setPendingChanges((prev) =>
          prev.filter((p) => p.mediumId !== change.mediumId || p.timestamp !== change.timestamp),
        )
      } else {
        allSuccess = false
      }
    }

    setIsSyncing(false)

    if (allSuccess && currentPending.length > 0) {
      toast.success('Tudo sincronizado')
      setManualSyncRequired(false)
    } else if (!allSuccess) {
      setManualSyncRequired(true)
    }
  }, [pendingChanges, isSyncing, eventId])

  useEffect(() => {
    if (isOnline && pendingChanges.length > 0 && !isSyncing && !manualSyncRequired) {
      triggerSync()
    }
  }, [isOnline, pendingChanges.length, triggerSync, isSyncing, manualSyncRequired])

  const savePresence = useCallback(
    (mediumId: string, presente: boolean, onRevert: () => void) => {
      if (!eventId || !mediumId || typeof presente !== 'boolean') {
        toast.error('Dados inválidos. Recarregue a página.')
        onRevert()
        return
      }

      if (debounceTimers.current[mediumId]) {
        clearTimeout(debounceTimers.current[mediumId])
      }

      debounceTimers.current[mediumId] = setTimeout(async () => {
        if (!navigator.onLine) {
          setPendingChanges((prev) => {
            const filtered = prev.filter((p) => p.mediumId !== mediumId)
            return [...filtered, { mediumId, presente, timestamp: Date.now() }]
          })
          toast.info('Salvo localmente')
          return
        }

        setSavingIds((prev) => new Set(prev).add(mediumId))
        const success = await syncSingle(mediumId, presente)
        setSavingIds((prev) => {
          const next = new Set(prev)
          next.delete(mediumId)
          return next
        })

        if (success) {
          toast.success('Presença atualizada')
        } else {
          setPendingChanges((prev) => {
            const filtered = prev.filter((p) => p.mediumId !== mediumId)
            return [...filtered, { mediumId, presente, timestamp: Date.now() }]
          })
          setManualSyncRequired(true)
          onRevert()
        }
      }, 300)
    },
    [eventId],
  )

  return {
    isOnline,
    pendingChanges,
    isSyncing,
    savingIds,
    savePresence,
    triggerSync,
    manualSyncRequired,
  }
}
