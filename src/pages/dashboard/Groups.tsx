import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Users, PlusCircle, Calendar as CalendarIcon, Crown, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getMembrosByUserId, createMembro, GrupoMembro } from '@/services/membros'
import { createGrupo } from '@/services/grupos'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'

export default function Groups() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [membros, setMembros] = useState<GrupoMembro[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')

  const loadGroups = async () => {
    if (!user?.id) return
    try {
      const data = await getMembrosByUserId(user.id)
      setMembros(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [user?.id])

  useRealtime('grupo_membros', () => loadGroups())
  useRealtime('grupos', () => loadGroups())

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    try {
      const grupo = await createGrupo({
        nome,
        descricao,
        data_fundacao: date?.toISOString(),
        owner_id: user.id,
      })
      await createMembro({
        grupo_id: grupo.id,
        user_id: user.id,
        status: 'owner',
      })
      setIsModalOpen(false)
      setNome('')
      setDescricao('')
      setDate(undefined)
      toast.success('Grupo criado com sucesso!')
      navigate(`/dashboard/grupos/${grupo.id}`)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
    }
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-purple-900">Meus Grupos</h1>
          <p className="text-slate-600 mt-2">
            Gerencie as comunidades religiosas das quais você participa.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-900 hover:bg-purple-800 text-white font-medium">
              <PlusCircle className="w-5 h-5 mr-2" />
              Criar Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-purple-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-purple-900">Novo Grupo</DialogTitle>
              <DialogDescription className="text-slate-600">
                Preencha os detalhes para fundar um novo terreiro ou grupo de estudos.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-purple-900 font-medium">
                    Nome do Grupo
                  </Label>
                  <Input
                    id="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Tenda Espírita Caboclo Pena Branca"
                    className="border-purple-200 focus-visible:ring-purple-900"
                  />
                  {fieldErrors.nome && <p className="text-sm text-red-500">{fieldErrors.nome}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-purple-900 font-medium">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Qual o propósito deste grupo?"
                    className="min-h-[100px] border-purple-200 focus-visible:ring-purple-900"
                  />
                  {fieldErrors.descricao && (
                    <p className="text-sm text-red-500">{fieldErrors.descricao}</p>
                  )}
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label className="text-purple-900 font-medium">Data de Fundação</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full justify-start text-left font-normal border-purple-200',
                          !date && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldErrors.data_fundacao && (
                    <p className="text-sm text-red-500">{fieldErrors.data_fundacao}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-purple-200 text-purple-900 hover:bg-purple-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-purple-950 font-semibold"
                >
                  Salvar Grupo
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {membros.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-lg border border-purple-100">
            Você ainda não participa de nenhum grupo.
          </div>
        ) : (
          membros.map((membro) => {
            const grupo = membro.expand?.grupo_id
            if (!grupo) return null
            return (
              <Card
                key={membro.id}
                onClick={() => navigate(`/dashboard/grupos/${grupo.id}`)}
                className="border-purple-200/60 bg-white hover:shadow-lg hover:shadow-purple-900/5 transition-all duration-300 cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-900">
                      <Users className="w-6 h-6" />
                    </div>
                    {membro.status === 'owner' ? (
                      <Badge className="bg-yellow-500 text-purple-950 hover:bg-yellow-600 font-semibold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Owner
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-purple-300 text-purple-700 flex items-center gap-1"
                      >
                        <UserIcon className="w-3 h-3" /> Membro
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-serif text-purple-900 leading-tight">
                    {grupo.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-slate-600 mt-2">
                    <Users className="w-4 h-4 mr-2 text-purple-400" />
                    Membros ativos
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
