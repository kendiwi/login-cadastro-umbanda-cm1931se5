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
import { Check, X, Info } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
      <DialogContent className="w-[90%] sm:w-[400px] sm:max-w-[400px] p-4 sm:p-6 mx-auto rounded-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">Finalizar Evento</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Registre as métricas de atendimento
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="pref" className="font-medium text-slate-700">
                    Quantidade de Atendimento Preferencial
                  </Label>
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Atendimento prioritário para médiuns com restrições</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                {prefError && <p className="text-red-500 text-xs font-medium">{prefError}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="normal" className="font-medium text-slate-700">
                    Quantidade de Atendimento Normal
                  </Label>
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Atendimento padrão para médiuns regulares</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                {normalError && <p className="text-red-500 text-xs font-medium">{normalError}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="passe" className="font-medium text-slate-700">
                    Quantidade de Atendimento Passe
                  </Label>
                  <Tooltip>
                    <TooltipTrigger type="button" tabIndex={-1}>
                      <Info className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Atendimento para visitantes ou médiuns convidados</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                {passeError && <p className="text-red-500 text-xs font-medium">{passeError}</p>}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting || isLoadingData}
            className={`w-full sm:w-auto font-medium transition-colors ${
              isValid
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-600/50 text-white cursor-not-allowed'
            }`}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
