import pb from '@/lib/pocketbase/client'
import { Grupo } from './grupos'

export interface SolicitacaoAcesso {
  id: string
  grupo_id: string
  user_id: string
  status: 'pendente' | 'aprovado' | 'negado'
  data_solicitacao: string
  created?: string
  updated?: string
  expand?: {
    grupo_id?: Grupo
    user_id?: any
  }
}

export const getSolicitacoesByOwner = (userId: string) =>
  pb.collection('solicitacoes_acesso').getFullList<SolicitacaoAcesso>({
    filter: `grupo_id.owner_id = "${userId}" && status = "pendente"`,
    expand: 'user_id,grupo_id',
    sort: '-created',
  })

export const getMinhasSolicitacoes = (userId: string) =>
  pb.collection('solicitacoes_acesso').getFullList<SolicitacaoAcesso>({
    filter: `user_id = "${userId}"`,
    sort: '-created',
  })

export const createSolicitacao = (data: {
  grupo_id: string
  user_id: string
  status: 'pendente'
}) => pb.collection('solicitacoes_acesso').create<SolicitacaoAcesso>(data)

export const updateSolicitacao = (id: string, data: { status: 'aprovado' | 'negado' }) =>
  pb.collection('solicitacoes_acesso').update<SolicitacaoAcesso>(id, data)
