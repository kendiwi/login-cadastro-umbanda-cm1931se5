import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getSolicitacoesByOwner,
  updateSolicitacao,
  SolicitacaoAcesso,
} from '@/services/solicitacoes'
import { createMembro } from '@/services/membros'
import { format } from 'date-fns'

export default function Requests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<SolicitacaoAcesso[]>([])

  const loadRequests = async () => {
    if (!user?.id) return
    try {
      const data = await getSolicitacoesByOwner(user.id)
      setRequests(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [user?.id])

  useRealtime('solicitacoes_acesso', () => loadRequests())

  const handleApprove = async (
    reqId: string,
    grupoId: string,
    userId: string,
    userName: string,
  ) => {
    try {
      await updateSolicitacao(reqId, { status: 'aprovado' })
      await createMembro({ grupo_id: grupoId, user_id: userId, status: 'membro' })
      toast.success('Solicitação Aprovada', {
        description: `${userName} agora é membro do grupo.`,
      })
    } catch (err) {
      toast.error('Erro ao aprovar solicitação.')
    }
  }

  const handleDeny = async (reqId: string, userName: string) => {
    try {
      await updateSolicitacao(reqId, { status: 'negado' })
      toast.success('Solicitação Recusada', {
        description: `A entrada de ${userName} foi negada.`,
      })
    } catch (err) {
      toast.error('Erro ao recusar solicitação.')
    }
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-purple-900">Solicitações de Acesso</h1>
        <p className="text-slate-600 mt-2">
          Gerencie quem deseja participar dos grupos que você administra.
        </p>
      </div>

      <Card className="border-purple-200/60 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-purple-50/50 border-b border-purple-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-900 font-serif">
            <Users className="w-5 h-5 text-yellow-600" />
            Pendentes
            <Badge className="bg-purple-900 hover:bg-purple-800 ml-2">{requests.length}</Badge>
          </CardTitle>
          <CardDescription className="text-slate-600">
            Revisão de novos membros para aprovação.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhuma solicitação pendente no momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-purple-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-purple-900 whitespace-nowrap">
                      Nome do Solicitante
                    </TableHead>
                    <TableHead className="font-semibold text-purple-900 hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-purple-900 hidden md:table-cell">
                      Grupo
                    </TableHead>
                    <TableHead className="font-semibold text-purple-900 hidden lg:table-cell">
                      Data da Solicitação
                    </TableHead>
                    <TableHead className="text-right font-semibold text-purple-900">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => {
                    const requester = req.expand?.user_id
                    const group = req.expand?.grupo_id
                    if (!requester || !group) return null

                    return (
                      <TableRow
                        key={req.id}
                        className="border-purple-100 hover:bg-purple-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                          {requester.name || requester.email}
                          <div className="text-xs text-slate-500 sm:hidden mt-0.5">
                            {requester.email}
                          </div>
                          <div className="text-xs mt-1 md:hidden">
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1 border-purple-200 text-purple-700 bg-purple-50"
                            >
                              {group.nome}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 hidden sm:table-cell">
                          {requester.email}
                        </TableCell>
                        <TableCell className="text-slate-600 hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className="border-purple-200 text-purple-700 bg-purple-50"
                          >
                            {group.nome}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 hidden lg:table-cell">
                          {req.data_solicitacao
                            ? format(new Date(req.data_solicitacao), 'dd/MM/yyyy')
                            : req.created
                              ? format(new Date(req.created), 'dd/MM/yyyy')
                              : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col sm:flex-row items-end justify-end gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="w-full sm:w-auto"
                              onClick={() => handleDeny(req.id, requester.name || requester.email)}
                            >
                              <X className="w-4 h-4 mr-2 sm:mr-0 lg:mr-1" />
                              <span className="inline sm:hidden lg:inline">Negar</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() =>
                                handleApprove(
                                  req.id,
                                  group.id,
                                  requester.id,
                                  requester.name || requester.email,
                                )
                              }
                            >
                              <Check className="w-4 h-4 mr-2 sm:mr-0 lg:mr-1" />
                              <span className="inline sm:hidden lg:inline">Aprovar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
