import pb from '@/lib/pocketbase/client'
import { Grupo } from './grupos'

export interface GrupoMembro {
  id: string
  grupo_id: string
  user_id: string
  status: 'owner' | 'membro'
  expand?: {
    grupo_id?: Grupo
    user_id?: any
  }
}

export const getMembrosByUserId = (userId: string) =>
  pb.collection('grupo_membros').getFullList<GrupoMembro>({
    filter: `user_id = "${userId}"`,
    expand: 'grupo_id',
    sort: '-created',
  })

export const createMembro = (data: {
  grupo_id: string
  user_id: string
  status: 'owner' | 'membro'
}) => pb.collection('grupo_membros').create<GrupoMembro>(data)
