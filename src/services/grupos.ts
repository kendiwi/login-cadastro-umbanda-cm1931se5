import pb from '@/lib/pocketbase/client'

export interface Grupo {
  id: string
  collectionId: string
  collectionName: string
  nome: string
  descricao: string
  data_fundacao: string
  owner_id: string
  icone: string
  created: string
  updated: string
}

export const getGrupos = () => pb.collection('grupos').getFullList<Grupo>({ sort: '-created' })

export const createGrupo = (data: FormData | Record<string, any>) =>
  pb.collection('grupos').create<Grupo>(data)

export const updateGrupo = (id: string, data: FormData | Record<string, any>) =>
  pb.collection('grupos').update<Grupo>(id, data)
