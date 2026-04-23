import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GiraEvent } from '@/hooks/use-events'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface CloseEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: GiraEvent | null
  onConfirm: (
    id: string,
    data: {
      atendimentoPreferencial: number
      atendimentoNormal: number
      atendimentoPasse: number
      status: 'fechado'
    },
  ) => Promise<void>
}

export function CloseEventModal({ isOpen, onClose, event, onConfirm }: CloseEventModalProps) {
  const [preferencial, setPreferencial] = useState('')
  const [normal, setNormal] = useState('')
  const [passe, setPasse] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setPreferencial('')
      setNormal('')
      setPasse('')
      setIsSubmitting(false)
      setIsLoadingData(true)

      const timer = setTimeout(() => {
        setIsLoadingData(false)
      }, 400)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const validateField = (val: string) => {
    if (val === '') return 'Campo obrigatório'
    const num = Number(val)
    if (isNaN(num)) return 'Campo obrigatório'
    if (num < 0) return 'Deve ser maior ou igual a 0'
    if (!Number.isInteger(num)) return 'Deve ser um número inteiro'
    return null
  }

  const prefError = validateField(preferencial)
  const normalError = validateField(normal)
  const passeError = validateField(passe)

  const isValid =
    !prefError &&
    !normalError &&
    !passeError &&
    preferencial !== '' &&
    normal !== '' &&
    passe !== ''

  const handleConfirm = async () => {
    if (!event || !isValid) return
    setIsSubmitting(true)
    try {
      await onConfirm(event.id, {
        atendimentoPreferencial: Number(preferencial),
        atendimentoNormal: Number(normal),
        atendimentoPasse: Number(passe),
        status: 'fechado',
      })
      toast.success('Evento fechado com sucesso', {
        icon: <Check className="h-5 w-5 text-green-500" />,
        style: { color: '#22c55e' },
      })
      onClose()
    } catch (error) {
      toast.error('Erro ao fechar evento. Tente novamente.', {
        icon: <X className="h-5 w-5 text-red-500" />,
        style: { color: '#ef4444' },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Estatísticas do Evento</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Preencha os dados de atendimento para fechar o evento oficialmente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {isLoadingData ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3 max-w-[250px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3 max-w-[250px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3 max-w-[250px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="pref" className="font-medium text-slate-700">
                  Quantidade de Atendimento Preferencial
                </Label>
                <Input
                  id="pref"
                  type="number"
                  min="0"
                  step="1"
                  value={preferencial}
                  onChange={(e) => setPreferencial(e.target.value)}
                  className={prefError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="Ex: 5"
                />
                {prefError && <p className="text-red-500 text-xs font-medium mt-1">{prefError}</p>}
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="normal" className="font-medium text-slate-700">
                  Quantidade de Atendimento Normal
                </Label>
                <Input
                  id="normal"
                  type="number"
                  min="0"
                  step="1"
                  value={normal}
                  onChange={(e) => setNormal(e.target.value)}
                  className={normalError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="Ex: 20"
                />
                {normalError && (
                  <p className="text-red-500 text-xs font-medium mt-1">{normalError}</p>
                )}
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="passe" className="font-medium text-slate-700">
                  Quantidade de Atendimento Passe
                </Label>
                <Input
                  id="passe"
                  type="number"
                  min="0"
                  step="1"
                  value={passe}
                  onChange={(e) => setPasse(e.target.value)}
                  className={passeError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  placeholder="Ex: 15"
                />
                {passeError && (
                  <p className="text-red-500 text-xs font-medium mt-1">{passeError}</p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting || isLoadingData}
            className={`w-full sm:w-auto transition-colors ${isValid ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
