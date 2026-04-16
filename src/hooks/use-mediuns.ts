import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import useRealtime from '@/hooks/use-realtime'

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

  const load = useCallback(async () => {
    if (!grupoId) return
    try {
      const records = await pb.collection('mediuns').getFullList({
        filter: `grupo_id = "${grupoId}"`,
      })
      setMediuns(
        records.map((r: any) => ({
          id: r.id,
          grupo_id: r.grupo_id,
          nome: r.nome,
          data_nascimento: r.data_nascimento ? r.data_nascimento.split(' ')[0] : '',
          contato: r.contato || '',
          foto: r.foto ? pb.files.getURL(r, r.foto) : '',
        })),
      )
    } catch (error) {
      console.error('Failed to load mediuns', error)
      setMediuns([])
    }
  }, [grupoId])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('mediuns', () => {
    load()
  })

  const addMedium = async (medium: Omit<Medium, 'id' | 'grupo_id'>) => {
    const formData = new FormData()
    formData.append('grupo_id', grupoId)
    formData.append('nome', medium.nome)
    if (medium.data_nascimento) {
      formData.append('data_nascimento', medium.data_nascimento + ' 12:00:00.000Z')
    }
    formData.append('contato', medium.contato || '')

    if (medium.foto && medium.foto.startsWith('data:image')) {
      const res = await fetch(medium.foto)
      const blob = await res.blob()
      formData.append('foto', blob, 'foto.jpg')
    }

    await pb.collection('mediuns').create(formData)
  }

  const updateMedium = async (id: string, medium: Partial<Medium>) => {
    const formData = new FormData()
    if (medium.nome !== undefined) formData.append('nome', medium.nome)
    if (medium.data_nascimento !== undefined) {
      formData.append(
        'data_nascimento',
        medium.data_nascimento ? medium.data_nascimento + ' 12:00:00.000Z' : '',
      )
    }
    if (medium.contato !== undefined) formData.append('contato', medium.contato || '')

    if (medium.foto && medium.foto.startsWith('data:image')) {
      const res = await fetch(medium.foto)
      const blob = await res.blob()
      formData.append('foto', blob, 'foto.jpg')
    } else if (medium.foto === '') {
      formData.append('foto', '')
    }

    await pb.collection('mediuns').update(id, formData)
  }

  const deleteMedium = async (id: string) => {
    await pb.collection('mediuns').delete(id)
  }

  return { mediuns, addMedium, updateMedium, deleteMedium, refresh: load }
}
