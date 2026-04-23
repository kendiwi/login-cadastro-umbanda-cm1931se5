import { useEffect } from 'react'
import { FileText, Copy, RefreshCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useEventSummary } from '@/hooks/use-event-summary'

interface EventSummaryModalProps {
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export function EventSummaryModal({ eventId, isOpen, onClose }: EventSummaryModalProps) {
  const { data, loading, error, fetchSummary } = useEventSummary(eventId)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && eventId) {
      fetchSummary()
    }
  }, [isOpen, eventId, fetchSummary])

  const formatDate = (d: string) => {
    if (!d) return ''
    const datePart = d.split(' ')[0]
    return datePart.split('-').reverse().join('/')
  }

  const handleCopy = () => {
    if (!data) return
    const evDate = formatDate(data.date)

    let text = `RESUMO DO EVENTO\n\nData: ${evDate}\nHora: ${data.time}\nLocal: ${data.location}\nCoordenador: ${data.ownerName}\n\n`

    text += `PARTICIPACAO\nTotal Presente: ${data.presentes}\nTotal Ausente: ${data.ausentes}\nTotal em Licenca: ${data.emLicenca}\nTotal Convidados: ${data.convidados}\n\n`

    const percPresent = data.total > 0 ? Math.round((data.presentes / data.total) * 100) : 0
    const percAbsent = data.total > 0 ? Math.round((data.ausentes / data.total) * 100) : 0
    const percLicense = data.total > 0 ? Math.round((data.emLicenca / data.total) * 100) : 0

    text += `TAXA DE PRESENCA\nPresenca: ${percPresent}%\nAusencia: ${percAbsent}%\nLicenca: ${percLicense}%\n\n`

    if (data.status === 'fechado') {
      const totalAtend =
        data.atendimentoPreferencial + data.atendimentoNormal + data.atendimentoPasse
      text += `ATENDIMENTOS REALIZADOS\nPreferencial: ${data.atendimentoPreferencial}\nNormal: ${data.atendimentoNormal}\nPasse: ${data.atendimentoPasse}\nTotal: ${totalAtend}\n\n`
    }

    if (data.description) {
      text += `OBSERVACOES\n${data.description}\n`
    }

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copiado para área de transferência!',
        description: 'O resumo foi copiado e está pronto para ser colado no WhatsApp.',
      })
    })
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-8 text-center space-y-4">
          <p className="text-red-600 font-medium">Erro ao carregar relatorio. Tente novamente.</p>
          <Button onClick={fetchSummary} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      )
    }

    if (!data) {
      return <div className="p-8 text-center text-muted-foreground">Evento sem dados</div>
    }

    const percPresent = data.total > 0 ? Math.round((data.presentes / data.total) * 100) : 0
    const percAbsent = data.total > 0 ? Math.round((data.ausentes / data.total) * 100) : 0
    const percLicense = data.total > 0 ? Math.round((data.emLicenca / data.total) * 100) : 0
    const totalAtend = data.atendimentoPreferencial + data.atendimentoNormal + data.atendimentoPasse

    return (
      <div className="p-6 pt-2 space-y-6 overflow-y-auto max-h-[75vh]">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg mb-2">RESUMO DO EVENTO</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-800">
            <div>
              <span className="font-semibold">Data:</span> {formatDate(data.date)}
            </div>
            <div>
              <span className="font-semibold">Hora:</span> {data.time}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Local:</span> {data.location}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Coordenador:</span> {data.ownerName}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 border-b pb-1">PARTICIPAÇÃO</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between bg-slate-50 p-2 rounded text-slate-800 border">
              <span>Total Presente ✅</span> <span className="font-bold">{data.presentes}</span>
            </div>
            <div className="flex justify-between bg-slate-50 p-2 rounded text-slate-800 border">
              <span>Total Ausente ❌</span> <span className="font-bold">{data.ausentes}</span>
            </div>
            <div className="flex justify-between bg-slate-50 p-2 rounded text-slate-800 border">
              <span>Total em Licença 📋</span> <span className="font-bold">{data.emLicenca}</span>
            </div>
            <div className="flex justify-between bg-slate-50 p-2 rounded text-slate-800 border">
              <span>Total Convidados 🎫</span> <span className="font-bold">{data.convidados}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 border-b pb-1">TAXA DE PRESENÇA</h4>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-slate-50 p-2 rounded border">
              <div className="text-muted-foreground text-xs">Presença</div>
              <div className="font-bold text-slate-800">{percPresent}%</div>
            </div>
            <div className="bg-slate-50 p-2 rounded border">
              <div className="text-muted-foreground text-xs">Ausência</div>
              <div className="font-bold text-slate-800">{percAbsent}%</div>
            </div>
            <div className="bg-slate-50 p-2 rounded border">
              <div className="text-muted-foreground text-xs">Licença</div>
              <div className="font-bold text-slate-800">{percLicense}%</div>
            </div>
          </div>
        </div>

        {data.status === 'fechado' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 border-b pb-1">ATENDIMENTOS REALIZADOS</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 border rounded bg-slate-50 text-slate-800">
                <span>Preferencial 👑</span>{' '}
                <span className="font-bold">{data.atendimentoPreferencial}</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-slate-50 text-slate-800">
                <span>Normal 🤝</span> <span className="font-bold">{data.atendimentoNormal}</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-slate-50 text-slate-800">
                <span>Passe 🎁</span> <span className="font-bold">{data.atendimentoPasse}</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-slate-100 text-slate-900">
                <span>Total 💫</span> <span className="font-bold">{totalAtend}</span>
              </div>
            </div>
          </div>
        )}

        {data.description && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 border-b pb-1">OBSERVAÇÕES</h4>
            <div className="text-sm bg-slate-50 p-3 rounded border text-slate-700 whitespace-pre-wrap">
              {data.description}
            </div>
          </div>
        )}

        <Button onClick={handleCopy} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white">
          <Copy className="w-4 h-4 mr-2" /> Copiar para WhatsApp
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:max-w-[400px] p-0 overflow-hidden animate-in fade-in duration-200">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-slate-900 flex items-center text-xl">
            <FileText className="w-6 h-6 mr-2" /> Resumo do Evento
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
