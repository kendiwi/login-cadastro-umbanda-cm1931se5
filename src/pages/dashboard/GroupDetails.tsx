import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useMediuns, Medium } from '@/hooks/use-mediuns'
import { MediumFormModal } from '@/components/mediuns/MediumFormModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupingListsTab } from '@/components/grupos/GroupingListsTab'
import { EventsTab } from '@/components/grupos/EventsTab'
import { RelatoriosTab } from '@/components/grupos/RelatoriosTab'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Edit, Trash2, Plus, Users } from 'lucide-react'
import { format } from 'date-fns'

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [grupo, setGrupo] = useState<any>(null)
  const [role, setRole] = useState<'owner' | 'membro' | null>(null)
  const [loading, setLoading] = useState(true)

  const { mediuns, addMedium, updateMedium, deleteMedium } = useMediuns(id!)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedium, setEditingMedium] = useState<Medium | null>(null)

  useEffect(() => {
    async function fetchGroup() {
      if (!id || !user) return
      try {
        const groupData = await pb.collection('grupos').getOne(id)
        setGrupo(groupData)

        if (groupData.owner_id === user.id) {
          setRole('owner')
        } else {
          try {
            const membroData = await pb
              .collection('grupo_membros')
              .getFirstListItem(`grupo_id="${id}" && user_id="${user.id}"`)
            setRole(membroData.status)
          } catch (e) {
            setRole(null)
          }
        }
      } catch (error) {
        toast({ title: 'Erro', description: 'Grupo não encontrado', variant: 'destructive' })
        navigate('/dashboard/grupos')
      } finally {
        setLoading(false)
      }
    }
    fetchGroup()
  }, [id, user, navigate, toast])

  if (loading)
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  if (!grupo) return null

  const isOwner = role === 'owner'

  const handleSave = (data: Omit<Medium, 'id' | 'grupo_id'>) => {
    if (editingMedium) {
      updateMedium(editingMedium.id, data)
      toast({ title: 'Sucesso', description: 'Médium atualizado com sucesso!' })
    } else {
      addMedium(data)
      toast({ title: 'Sucesso', description: 'Médium adicionado com sucesso!' })
    }
    setIsModalOpen(false)
    setEditingMedium(null)
  }

  const handleDelete = (mediumId: string) => {
    if (confirm('Tem certeza que deseja remover este médium do registro?')) {
      deleteMedium(mediumId)
      toast({ title: 'Removido', description: 'Médium deletado com sucesso!' })
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4 border-b border-purple-100 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/grupos')}
          className="text-purple-700 hover:text-purple-900 hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-purple-900">{grupo.nome}</h1>
          <p className="text-sm text-muted-foreground">{grupo.descricao || 'Sem descrição'}</p>
        </div>
      </div>

      <Tabs defaultValue="mediuns" className="w-full">
        <TabsList className="mb-4 bg-purple-100/50 text-purple-900 border border-purple-200 w-full sm:w-auto overflow-x-auto flex justify-start">
          <TabsTrigger
            value="mediuns"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
          >
            Corpo Mediúnico
          </TabsTrigger>
          <TabsTrigger
            value="listas"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
          >
            Listas de Agrupamento
          </TabsTrigger>
          <TabsTrigger
            value="eventos"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
          >
            Eventos de Gira
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
          >
            Relatórios
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mediuns">
          <Card className="border-t-4 border-t-amber-500 shadow-lg border-purple-100/50 rounded-xl overflow-hidden mt-0">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-purple-50/40 rounded-t-lg border-b border-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-full shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-purple-900 font-bold">
                    Corpo Mediúnico
                  </CardTitle>
                  <CardDescription className="text-purple-700/70">
                    Gerencie os médiuns deste terreiro.
                  </CardDescription>
                </div>
              </div>
              {isOwner && (
                <Button
                  onClick={() => {
                    setEditingMedium(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Médium
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {mediuns.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
                    <Users className="w-10 h-10 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-1">
                    Nenhum médium cadastrado
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    {isOwner
                      ? 'Clique no botão acima para adicionar o primeiro médium e começar a montar o registro do grupo.'
                      : 'Este grupo ainda não possui médiuns registrados no sistema.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md sm:border border-purple-100 bg-white shadow-sm">
                  <Table>
                    <TableHeader className="bg-purple-50/50 hidden sm:table-header-group">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[80px] font-semibold text-purple-900">
                          Foto
                        </TableHead>
                        <TableHead className="font-semibold text-purple-900">Nome</TableHead>
                        <TableHead className="font-semibold text-purple-900">
                          Data de Nascimento
                        </TableHead>
                        <TableHead className="font-semibold text-purple-900">Contato</TableHead>
                        {isOwner && (
                          <TableHead className="text-right font-semibold text-purple-900">
                            Ações
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mediuns.map((m) => (
                        <TableRow
                          key={m.id}
                          className="flex flex-col sm:table-row border-b border-purple-100/50 sm:border-b py-4 sm:py-0 hover:bg-purple-50/30 transition-colors"
                        >
                          <TableCell className="flex sm:table-cell justify-center mb-3 sm:mb-0">
                            <Avatar className="w-20 h-20 sm:w-12 sm:h-12 border-2 border-amber-200 shadow-sm">
                              <AvatarImage src={m.foto} className="object-cover" />
                              <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-lg sm:text-base">
                                {m.nome.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="text-center sm:text-left align-middle">
                            <div className="font-medium text-purple-900 text-lg sm:text-base">
                              {m.nome}
                            </div>
                            <div className="text-sm text-muted-foreground sm:hidden mt-1">
                              {m.contato || 'Sem contato'}
                            </div>
                          </TableCell>
                          <TableCell className="text-center sm:text-left text-sm text-muted-foreground sm:text-foreground align-middle mt-1 sm:mt-0">
                            {m.data_nascimento ? (
                              format(new Date(m.data_nascimento + 'T12:00:00'), 'dd/MM/yyyy')
                            ) : (
                              <span className="text-gray-400 italic">Não informada</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm align-middle text-muted-foreground">
                            {m.contato || '-'}
                          </TableCell>
                          {isOwner && (
                            <TableCell className="flex justify-center sm:table-cell sm:text-right mt-4 sm:mt-0 space-x-2 align-middle">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingMedium(m)
                                  setIsModalOpen(true)
                                }}
                                className="border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm"
                              >
                                <Edit className="w-4 h-4 sm:mr-0" />
                                <span className="sm:hidden ml-2">Editar</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(m.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                              >
                                <Trash2 className="w-4 h-4 sm:mr-0" />
                                <span className="sm:hidden ml-2">Remover</span>
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <MediumFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            initialData={editingMedium}
          />
        </TabsContent>
        <TabsContent value="listas">
          <GroupingListsTab groupId={id!} isOwner={isOwner} mediuns={mediuns} />
        </TabsContent>
        <TabsContent value="eventos">
          <EventsTab groupId={id!} isOwner={isOwner} mediuns={mediuns} />
        </TabsContent>
        <TabsContent value="relatorios">
          <RelatoriosTab groupId={id!} mediuns={mediuns} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
