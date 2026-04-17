import { useState } from 'react'
import { useLicencas } from '@/hooks/use-licencas'
import { createLicenca, updateLicenca, deleteLicenca } from '@/services/licencas'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DatePicker } from '@/components/ui/date-picker'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Edit2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

export function MediumLicencasTab({ mediumId }: { mediumId: string }) {
  const { licencas, checkOverlap } = useLicencas(mediumId)
  const { toast } = useToast()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined)
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined)
  const [justificativa, setJustificativa] = useState('')

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const resetForm = () => {
    setEditingId(null)
    setDataInicio(undefined)
    setDataFim(undefined)
    setJustificativa('')
  }

  const handleEdit = (l: any) => {
    setEditingId(l.id)
    setDataInicio(new Date(l.data_inicio))
    setDataFim(new Date(l.data_fim))
    setJustificativa(l.justificativa || '')
  }

  const handleSave = async () => {
    if (!dataInicio || !dataFim) {
      return toast({ title: 'Erro', description: 'Selecione as datas', variant: 'destructive' })
    }
    if (dataFim <= dataInicio) {
      return toast({
        title: 'Erro',
        description: 'A data final deve ser posterior à inicial',
        variant: 'destructive',
      })
    }

    const startIso = new Date(
      dataInicio.getFullYear(),
      dataInicio.getMonth(),
      dataInicio.getDate(),
      12,
      0,
      0,
    ).toISOString()
    const endIso = new Date(
      dataFim.getFullYear(),
      dataFim.getMonth(),
      dataFim.getDate(),
      12,
      0,
      0,
    ).toISOString()

    if (checkOverlap(startIso, endIso, editingId || undefined)) {
      return toast({
        title: 'Erro',
        description: 'O período conflita com uma licença existente',
        variant: 'destructive',
      })
    }

    try {
      if (editingId) {
        await updateLicenca(editingId, { data_inicio: startIso, data_fim: endIso, justificativa })
        toast({ title: 'Licença atualizada' })
      } else {
        await createLicenca({
          medium_id: mediumId,
          data_inicio: startIso,
          data_fim: endIso,
          justificativa,
        })
        toast({ title: 'Licença registrada' })
      }
      resetForm()
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteLicenca(deletingId)
      toast({ title: 'Licença excluída' })
      setDeletingId(null)
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 space-y-3">
        <h4 className="font-semibold text-purple-900">
          {editingId ? 'Editar Licença' : 'Nova Licença'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-purple-800">Data Início</label>
            <DatePicker date={dataInicio} setDate={setDataInicio} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-purple-800">Data Fim</label>
            <DatePicker date={dataFim} setDate={setDataFim} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-purple-800">Justificativa</label>
          <Textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Motivo da licença..."
            className="resize-none h-20 border-purple-200 focus-visible:ring-purple-500"
          />
        </div>
        <div className="flex justify-end gap-2">
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              Cancelar
            </Button>
          )}
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleSave}
          >
            {editingId ? 'Salvar Alterações' : 'Adicionar Licença'}
          </Button>
        </div>
      </div>

      <div className="border rounded-md border-purple-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-purple-50">
            <TableRow>
              <TableHead className="text-purple-900">Início</TableHead>
              <TableHead className="text-purple-900">Fim</TableHead>
              <TableHead className="text-purple-900">Justificativa</TableHead>
              <TableHead className="text-right text-purple-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licencas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  Nenhuma licença registrada
                </TableCell>
              </TableRow>
            ) : (
              licencas.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{format(new Date(l.data_inicio), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(l.data_fim), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{l.justificativa || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleEdit(l)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={() => setDeletingId(l.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deletingId} onOpenChange={(val) => !val && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" /> Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este registro de licença? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
