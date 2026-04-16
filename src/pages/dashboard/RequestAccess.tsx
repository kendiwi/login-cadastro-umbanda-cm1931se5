import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getGrupos, Grupo } from '@/services/grupos'
import {
  getMinhasSolicitacoes,
  createSolicitacao,
  SolicitacaoAcesso,
} from '@/services/solicitacoes'
import { getMembrosByUserId, GrupoMembro } from '@/services/membros'

export default function RequestAccess() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [groups, setGroups] = useState<Grupo[]>([])
  const [requests, setRequests] = useState<SolicitacaoAcesso[]>([])
  const [memberships, setMemberships] = useState<GrupoMembro[]>([])

  const loadData = async () => {
    if (!user?.id) return
    try {
      const [allGroups, myReqs, myMemberships] = await Promise.all([
        getGrupos(),
        getMinhasSolicitacoes(user.id),
        getMembrosByUserId(user.id),
      ])
      setGroups(allGroups)
      setRequests(myReqs)
      setMemberships(myMemberships)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  useRealtime('grupos', () => loadData())
  useRealtime('solicitacoes_acesso', () => loadData())
  useRealtime('grupo_membros', () => loadData())

  const filteredGroups = groups.filter((g) =>
    g.nome.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRequest = async (id: string) => {
    if (!user?.id) return
    try {
      await createSolicitacao({
        grupo_id: id,
        user_id: user.id,
        status: 'pendente',
      })
      toast.success('Solicitação de acesso enviada com sucesso!', {
        description: 'Aguarde a aprovação do dirigente do grupo.',
      })
    } catch (err) {
      toast.error('Erro ao solicitar acesso.')
    }
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-purple-900">Encontrar Comunidades</h1>
        <p className="text-slate-600">
          Pesquise por terreiros e grupos de estudo para solicitar sua participação.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
        <Input
          placeholder="Buscar por nome..."
          className="pl-10 h-12 text-lg border-purple-200 focus-visible:ring-purple-900 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 mt-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-purple-100">
            Nenhum grupo encontrado com os termos de busca.
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isMember = memberships.some((m) => m.grupo_id === group.id)
            const pendingRequest = requests.find(
              (r) => r.grupo_id === group.id && r.status === 'pendente',
            )
            const isOwner = group.owner_id === user?.id

            return (
              <Card
                key={group.id}
                className="border-purple-200/60 bg-white hover:border-purple-300 transition-colors"
              >
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-serif text-purple-900">
                      {group.nome}
                    </CardTitle>
                    <CardDescription className="text-slate-700">
                      {group.descricao || 'Sem descrição'}
                    </CardDescription>
                  </div>

                  {isOwner || isMember ? (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full sm:w-auto bg-slate-50 text-slate-500 border-slate-200"
                    >
                      Você já participa deste grupo
                    </Button>
                  ) : pendingRequest ? (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full sm:w-auto bg-slate-50 text-slate-500 border-slate-200"
                    >
                      Solicitação Pendente
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRequest(group.id)}
                      className="w-full sm:w-auto bg-purple-100 text-purple-900 hover:bg-purple-200 font-medium border border-purple-200"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Solicitar Acesso
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
