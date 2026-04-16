import pb from '@/lib/pocketbase/client'

export interface Grupo {
  id: string
  nome: string
  descricao: string
  data_fundacao: string
  owner_id: string
  created: string
}

export const getGrupos = () => pb.collection('grupos').getFullList<Grupo>({ sort: '-created' })

export const createGrupo = (data: {
  nome: string
  descricao: string
  data_fundacao?: string
  owner_id: string
}) => pb.collection('grupos').create<Grupo>(data)

export const updateGrupo = (id: string, data: Partial<{ nome: string; descricao: string }>) =>
  pb.collection('grupos').update<Grupo>(id, data)
