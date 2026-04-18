import { useState, useEffect, useCallback } from 'react'
import { Copy, RefreshCcw, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import pb from '@/lib/pocketbase/client'
import { GiraEvent } from '@/hooks/use-events'

interface EventSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  event: GiraEvent | null
  groupId: string
}

export function EventSummaryModal({ isOpen, onClose, event, groupId }: EventSummaryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [data, setData] = useState<{
    presentes: any[]
    ausentes: any[]
    emLicenca: any[]
    stats: any
  } | null>(null)

  const isMobile = useIsMobile()
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    if (!event || !isOpen) return
    setLoading(true)
    setError(false)
    try {
      const [presencas, allMediuns, allLicencas] = await Promise.all([
        pb.collection('presenca').getFullList({ filter: `evento_id = "${event.id}"` }),
        pb.collection('mediuns').getFullList({ filter: `grupo_id = "${groupId}"` }),
        pb
          .collection('licencas_mediuns')
          .getFullList({ filter: `medium_id.grupo_id = "${groupId}"` }),
      ])

      const evDate = event.date
      const licencaByMediumId = new Map()
      allLicencas.forEach((l) => {
        const start = l.data_inicio.split(' ')[0]
        const end = l.data_fim.split(' ')[0]
        if (evDate >= start && evDate <= end) {
          licencaByMediumId.set(l.medium_id, l)
        }
      })

      const presentes: any[] = []
      const ausentes: any[] = []
      const emLicenca: any[] = []

      presencas.forEach((p) => {
        const m = allMediuns.find((x) => x.id === p.medium_id)
        if (m) {
          if (p.presente) {
            presentes.push(m)
          } else {
            ausentes.push(m)
          }
        }
      })

      allMediuns.forEach((m) => {
        if (licencaByMediumId.has(m.id)) {
          emLicenca.push({ medium: m, licenca: licencaByMediumId.get(m.id) })
        }
      })

      presentes.sort((a, b) => a.nome.localeCompare(b.nome))
      ausentes.sort((a, b) => a.nome.localeCompare(b.nome))
      emLicenca.sort((a, b) => a.medium.nome.localeCompare(b.medium.nome))

      setData({
        presentes,
        ausentes,
        emLicenca,
        stats: {
          presentes: presentes.length,
          ausentes: ausentes.length,
          licenca: emLicenca.length,
        },
      })
    } catch (e) {
      console.error(e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [event, groupId, isOpen])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatDate = (d: string) => (d ? d.split(' ')[0].split('-').reverse().join('/') : '')

  const handleCopy = () => {
    if (!event || !data) return
    const evDate = formatDate(event.date)
    let text = `---\n📋 RESUMO DO EVENTO\n\nEvento: ${event.name}\nData: ${evDate}\nHora: ${event.time}\nLocal: ${event.location}\n\n`
    text += `📊 ESTATÍSTICAS\nTotal de Participantes: ${data.stats.presentes}\nAusentes: ${data.stats.ausentes}\nEm Licença: ${data.stats.licenca}\n\n`
    text +=
      `❌ AUSENTES\n` +
      (data.ausentes.length ? data.ausentes.map((a) => a.nome).join('\n') : 'Nenhum ausente') +
      `\n\n`
    text +=
      `🔴 EM LICENÇA\n` +
      (data.emLicenca.length
        ? data.emLicenca
            .map(
              (l) =>
                `${l.medium.nome} | ${formatDate(l.licenca.data_inicio)} - ${formatDate(l.licenca.data_fim)} | ${l.licenca.justificativa || 'Sem justificativa'}`,
            )
            .join('\n')
        : 'Nenhum em licença') +
      `\n\n---`

    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copiado para área de transferência!',
        description: 'O resumo foi copiado e está pronto para ser colado no WhatsApp.',
      })
    })
  }

  const renderContent = () => {
    if (loading)
      return (
        <div className="space-y-4 p-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    if (error)
      return (
        <div className="p-8 text-center space-y-4">
          <p className="text-red-600 font-medium">Erro ao carregar dados.</p>
          <Button onClick={loadData} variant="outline">
            <RefreshCcw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      )
    if (!data || !event)
      return <div className="p-8 text-center text-muted-foreground">Nenhum dado disponível</div>

    return (
      <div className="p-6 pt-2 space-y-6 overflow-y-auto max-h-[75vh]">
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <h3 className="font-bold text-purple-900 text-lg mb-2">{event.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-purple-800">
            <div>
              <span className="font-semibold">Data:</span> {formatDate(event.date)}
            </div>
            <div>
              <span className="font-semibold">Hora:</span> {event.time}
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Local:</span> {event.location}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
            <div className="text-2xl font-bold text-emerald-700">{data.stats.presentes}</div>
            <div className="text-[10px] sm:text-xs text-emerald-600 font-medium uppercase tracking-wider mt-1">
              Participantes
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 border border-red-100 text-center">
            <div className="text-2xl font-bold text-red-700">{data.stats.ausentes}</div>
            <div className="text-[10px] sm:text-xs text-red-600 font-medium uppercase tracking-wider mt-1">
              Ausentes
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
            <div className="text-2xl font-bold text-amber-700">{data.stats.licenca}</div>
            <div className="text-[10px] sm:text-xs text-amber-600 font-medium uppercase tracking-wider mt-1">
              Em Licença
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-red-900 border-b border-red-100 pb-1">❌ Ausentes</h4>
          {data.ausentes.length ? (
            <ul className="space-y-1">
              {data.ausentes.map((a) => (
                <li
                  key={a.id}
                  className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-md border"
                >
                  {a.nome}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhum ausente</p>
          )}
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-amber-900 border-b border-amber-100 pb-1">🔴 Em Licença</h4>
          {data.emLicenca.length ? (
            <ul className="space-y-2">
              {data.emLicenca.map((l) => (
                <li
                  key={l.medium.id}
                  className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-md border flex flex-col"
                >
                  <span className="font-semibold text-slate-900">{l.medium.nome}</span>
                  <span className="text-xs text-slate-500 mt-1">
                    {formatDate(l.licenca.data_inicio)} - {formatDate(l.licenca.data_fim)}
                  </span>
                  <span className="text-xs text-slate-600 mt-1 italic">
                    Motivo: {l.licenca.justificativa || 'Sem justificativa'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhum em licença</p>
          )}
        </div>
        <Button onClick={handleCopy} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white">
          <Copy className="w-4 h-4 mr-2" /> Copiar para WhatsApp
        </Button>
      </div>
    )
  }

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="text-purple-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" /> Resumo do Evento
            </DrawerTitle>
          </DrawerHeader>
          {renderContent()}
        </DrawerContent>
      </Drawer>
    )
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-purple-900 flex items-center text-xl">
            <FileText className="w-6 h-6 mr-2" /> Resumo do Evento
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
