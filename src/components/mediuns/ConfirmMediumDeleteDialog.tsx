import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, Archive } from 'lucide-react'

interface ConfirmMediumDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: () => void
  onConfirmDeactivate: () => void
  mediumName: string
}

export function ConfirmMediumDeleteDialog({
  isOpen,
  onClose,
  onConfirmDelete,
  onConfirmDeactivate,
  mediumName,
}: ConfirmMediumDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[450px] border-t-4 border-t-red-500 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-xl">
            <AlertCircle className="w-6 h-6" /> Remover Médium
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            O que você deseja fazer com o registro de{' '}
            <strong className="text-foreground">{mediumName}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl flex gap-3 shadow-sm hover:shadow-md transition-shadow">
            <Archive className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">Desativar (Manter Histórico)</h4>
              <p className="text-sm text-amber-700 mt-1 mb-3">
                O médium não aparecerá mais nas listas, mas seu histórico de licenças e presenças
                será mantido para auditoria.
              </p>
              <Button
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 font-medium"
                onClick={onConfirmDeactivate}
              >
                Desativar Médium
              </Button>
            </div>
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded-xl flex gap-3 shadow-sm hover:shadow-md transition-shadow">
            <Trash2 className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Excluir Permanentemente</h4>
              <p className="text-sm text-red-700 mt-1 mb-3">
                Remove permanentemente o médium e todos os seus dados. Esta ação não pode ser
                desfeita.
              </p>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-100 font-medium"
                onClick={onConfirmDelete}
              >
                Excluir Permanentemente
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto hover:bg-muted">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
