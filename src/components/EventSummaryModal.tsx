import { useEffect } from 'react'
import { FileText, Copy, RefreshCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
    const total = data.presentes + data.ausentes + data.emLicenca
    const percPresent = total > 0 ? Math.round((data.presentes / total) * 100) : 0
    const percAbsent = total > 0 ? Math.round((data.ausentes / total) * 100) : 0
    const percLicense = total > 0 ? Math.round((data.emLicenca / total) * 100) : 0

    let text = `\`\`\`\nRESUMO DO EVENTO\n\n`
    text += `Data: ${evDate}\nHorário: ${data.time}\nLocal: ${data.location}\nCoordenador: ${data.ownerName}\n\n`

    text += `PARTICIPAÇÃO\nPresentes: ${data.presentes}\nAusentes: ${data.ausentes}\nEm Licença: ${data.emLicenca}\nConvidados: ${data.convidados}\n\n`

    text += `TAXA DE PRESENÇA\nPresença: ${percPresent}%\nAusência: ${percAbsent}%\nLicença: ${percLicense}%\n\n`

    if (data.status === 'fechado') {
      const totalAtend =
        data.atendimentoPreferencial + data.atendimentoNormal + data.atendimentoPasse
      text += `ATENDIMENTOS REALIZADOS\nPreferencial: ${data.atendimentoPreferencial}\nNormal: ${data.atendimentoNormal}\nPasse: ${data.atendimentoPasse}\nTotal: ${totalAtend}\n\n`
    }

    if (data.description) {
      text += `OBSERVAÇÕES\n${data.description}\n\n`
    }

    text += `\`\`\``

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copiado para a área de transferência',
      })
    })
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3 p-4 bg-slate-50 rounded-lg m-6">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-8 text-center space-y-4">
          <p className="text-red-600 font-medium">Erro ao carregar relatório. Tente novamente.</p>
          <Button onClick={fetchSummary} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      )
    }

    if (!data) {
      return <div className="p-8 text-center text-muted-foreground">Evento sem dados</div>
    }

    const total = data.presentes + data.ausentes + data.emLicenca
    const percPresent = total > 0 ? Math.round((data.presentes / total) * 100) : 0
    const percAbsent = total > 0 ? Math.round((data.ausentes / total) * 100) : 0
    const percLicense = total > 0 ? Math.round((data.emLicenca / total) * 100) : 0
    const totalAtend = data.atendimentoPreferencial + data.atendimentoNormal + data.atendimentoPasse

    return (
      <div className="p-6 overflow-y-auto max-h-[70vh] bg-white space-y-3">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-bold text-slate-800 mb-3 text-sm">RESUMO DO EVENTO</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-800">
            <div>
              <span className="font-semibold">Data:</span> {formatDate(data.date)}
            </div>
            <div>
              <span className="font-semibold">Horário:</span> {data.time}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Local:</span> {data.location}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Coordenador:</span> {data.ownerName}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-bold text-slate-800 mb-3 text-sm">PARTICIPAÇÃO</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="w-[20px] inline-block text-left">✅</span> Presentes
              </span>
              <span className="font-bold text-blue-600">{data.presentes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="w-[20px] inline-block text-left">❌</span> Ausentes
              </span>
              <span className="font-bold text-blue-600">{data.ausentes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="w-[20px] inline-block text-left">📋</span> Em Licença
              </span>
              <span className="font-bold text-blue-600">{data.emLicenca}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <span className="w-[20px] inline-block text-left">🎫</span> Convidados
              </span>
              <span className="font-bold text-blue-600">{data.convidados}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-bold text-slate-800 mb-3 text-sm">TAXA DE PRESENÇA</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Presença</span>
                <span className="font-bold text-blue-600">{percPresent}%</span>
              </div>
              <Progress value={percPresent} className="h-2 bg-slate-200 [&>div]:bg-blue-600" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Ausência</span>
                <span className="font-bold text-blue-600">{percAbsent}%</span>
              </div>
              <Progress value={percAbsent} className="h-2 bg-slate-200 [&>div]:bg-blue-600" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Licença</span>
                <span className="font-bold text-blue-600">{percLicense}%</span>
              </div>
              <Progress value={percLicense} className="h-2 bg-slate-200 [&>div]:bg-blue-600" />
            </div>
          </div>
        </div>

        {data.status === 'fechado' && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">ATENDIMENTOS REALIZADOS</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="w-[20px] inline-block text-left">👑</span> Preferencial
                </span>
                <span className="font-bold text-blue-600">{data.atendimentoPreferencial}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="w-[20px] inline-block text-left">🤝</span> Normal
                </span>
                <span className="font-bold text-blue-600">{data.atendimentoNormal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <span className="w-[20px] inline-block text-left">🎁</span> Passe
                </span>
                <span className="font-bold text-blue-600">{data.atendimentoPasse}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                <span className="flex items-center font-semibold text-slate-900">
                  <span className="w-[20px] inline-block text-left">💫</span> Total
                </span>
                <span className="font-bold text-blue-600">{totalAtend}</span>
              </div>
            </div>
          </div>
        )}

        {data.description && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">OBSERVAÇÕES</h4>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{data.description}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] sm:w-[500px] sm:max-w-[500px] p-0 overflow-hidden data-[state=open]:duration-200 data-[state=closed]:duration-150">
        <DialogHeader className="p-6 pb-4 border-b bg-white">
          <DialogTitle className="text-slate-900 flex items-center font-bold text-xl">
            <FileText className="w-6 h-6 mr-2" /> Resumo do Evento
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
        {data && (
          <div className="p-4 border-t flex justify-end space-x-2 bg-white">
            <Button
              onClick={handleCopy}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full sm:w-auto"
            >
              <Copy className="w-4 h-4 mr-2" /> Copiar para WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
