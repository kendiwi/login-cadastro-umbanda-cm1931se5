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
import pb from '@/lib/pocketbase/client'

export function ConfiguracoesTab({
  grupo,
  onUpdate,
}: {
  grupo: Grupo
  onUpdate: (g: Grupo) => void
}) {
  const [nome, setNome] = useState(grupo.nome)
  const [descricao, setDescricao] = useState(grupo.descricao || '')
  const [icone, setIcone] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    try {
      const formData = new FormData()
      formData.append('nome', nome)
      formData.append('descricao', descricao)
      if (icone) formData.append('icone', icone)

      const updated = await updateGrupo(grupo.id, formData)
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
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-purple-100 shadow-sm gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl font-bold text-purple-900">Configurações do Grupo</h2>
          <p className="text-sm text-muted-foreground">
            Atualize as informações principais do seu grupo.
          </p>
        </div>
        <div className="p-2.5 bg-purple-100 text-purple-700 rounded-full shadow-sm self-end sm:self-auto">
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
            <div className="space-y-2">
              <Label htmlFor="iconeEdit" className="text-purple-900 font-medium">
                Ícone do Grupo
              </Label>
              {grupo.icone && !icone && (
                <div className="mb-2">
                  <img
                    src={pb.files.getUrl(grupo, grupo.icone)}
                    alt="Ícone atual"
                    className="w-16 h-16 object-cover rounded-full border-2 border-purple-200 shadow-sm"
                  />
                </div>
              )}
              <Input
                id="iconeEdit"
                type="file"
                accept="image/*"
                onChange={(e) => setIcone(e.target.files?.[0] || null)}
                className="border-purple-200 file:text-purple-900 focus-visible:ring-purple-900 cursor-pointer"
              />
              {fieldErrors.icone && <p className="text-sm text-red-500">{fieldErrors.icone}</p>}
            </div>
          </CardContent>{' '}
          <CardFooter className="flex flex-col sm:flex-row sm:justify-end border-t border-purple-50 pt-4 bg-slate-50/50 rounded-b-xl">
            <Button
              type="submit"
              disabled={loading || (!nome.trim() && !descricao.trim())}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
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
