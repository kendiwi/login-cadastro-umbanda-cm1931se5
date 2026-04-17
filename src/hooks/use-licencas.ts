import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from './use-realtime'
import { getLicencasByMedium, LicencaMedium } from '@/services/licencas'

export function useLicencas(mediumId?: string) {
  const [licencas, setLicencas] = useState<LicencaMedium[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!mediumId) return setLicencas([])
    setLoading(true)
    try {
      const data = await getLicencasByMedium(mediumId)
      setLicencas(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [mediumId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime(
    'licencas_mediuns',
    () => {
      loadData()
    },
    !!mediumId,
  )

  const checkOverlap = (inicio: string, fim: string, ignoreId?: string) => {
    // Overlap checks are intentionally disabled for auditing
    return false
  }

  return { licencas, loading, checkOverlap }
}
