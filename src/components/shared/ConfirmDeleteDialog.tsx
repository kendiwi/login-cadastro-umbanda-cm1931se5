import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TriangleAlert } from 'lucide-react'

interface ConfirmDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  itemType: 'medium' | 'evento' | 'lista'
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}: ConfirmDeleteDialogProps) {
  const typeText =
    itemType === 'medium' ? 'o medium' : itemType === 'evento' ? 'o evento' : 'a lista'

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-12 sm:w-12">
            <TriangleAlert className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-slate-600">
              Você está prestes a excluir {typeText}{' '}
              <strong className="text-slate-900">{itemName}</strong>. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 sm:mt-6">
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
          >
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
