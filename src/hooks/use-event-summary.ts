import { useState, useCallback } from 'react'
import { getEventSummary, EventSummaryData } from '@/services/eventService'
import { useToast } from '@/hooks/use-toast'

export function useEventSummary(eventId?: string) {
  const [data, setData] = useState<EventSummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const { toast } = useToast()

  const fetchSummary = useCallback(async () => {
    if (!eventId) return
    setLoading(true)
    setError(false)
    try {
      const summary = await getEventSummary(eventId)
      setData(summary)
    } catch (err) {
      console.error(err)
      setError(true)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar relatorio. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [eventId, toast])

  return { data, loading, error, fetchSummary }
}
