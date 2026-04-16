import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateGrupo, Grupo } from '@/services/grupos'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { Settings, Save } from 'lucide-react'

export function ConfiguracoesTab({
  grupo,
  onUpdate,
}: {
  grupo: Grupo
  onUpdate: (g: Grupo) => void
}) {
  const [nome, setNome] = useState(grupo.nome)
  const [descricao, setDescricao] = useState(grupo.descricao || '')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    try {
      const updated = await updateGrupo(grupo.id, { nome, descricao })
      onUpdate(updated)
      toast.success('Configurações do grupo atualizadas com sucesso!')
    } catch (error) {
      setFieldErrors(extractFieldErrors(error))
      toast.error('Erro ao atualizar configurações.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-purple-900">Configurações do Grupo</h2>
          <p className="text-sm text-muted-foreground">
            Atualize as informações principais do seu grupo.
          </p>
        </div>
        <div className="p-2.5 bg-purple-100 text-purple-700 rounded-full shadow-sm">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      <Card className="border-purple-100 shadow-sm max-w-2xl">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">Detalhes</CardTitle>
            <CardDescription>
              Edite o nome e a descrição do grupo para que os membros possam identificá-lo
              facilmente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-purple-900 font-medium">
                Nome do Grupo
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border-purple-200 focus-visible:ring-purple-900"
              />
              {fieldErrors.nome && <p className="text-sm text-red-500">{fieldErrors.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-purple-900 font-medium">
                Descrição
              </Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="min-h-[100px] border-purple-200 focus-visible:ring-purple-900"
              />
              {fieldErrors.descricao && (
                <p className="text-sm text-red-500">{fieldErrors.descricao}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-purple-50 pt-4 bg-slate-50/50 rounded-b-xl">
            <Button
              type="submit"
              disabled={loading || (!nome.trim() && !descricao.trim())}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
