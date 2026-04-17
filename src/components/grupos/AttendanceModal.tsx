import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { GiraEvent } from '@/hooks/use-events'
import { Medium } from '@/hooks/use-mediuns'
import { GroupingList } from '@/hooks/use-grouping-lists'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  event: GiraEvent | null
  list: GroupingList | null
  mediuns: Medium[]
  isOwner: boolean
  onSave: (
    eventId: string,
    attendance: Record<string, boolean>,
    closeEvent: boolean,
    reopenEvent?: boolean,
  ) => void
}

export function AttendanceModal({
  isOpen,
  onClose,
  event,
  list,
  mediuns,
  isOwner,
  onSave,
}: AttendanceModalProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isOpen && event) {
      setAttendance(event.attendance || {})
    }
  }, [isOpen, event])

  if (!event || !list) return null

  const isClosed = event.status === 'fechado'

  // Filter expected members and sort alphabetically A-Z
  const expectedMediuns = mediuns
    .filter((m) => list.mediumIds.includes(m.id))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  const handleToggle = (mediumId: string, present: boolean) => {
    if (isClosed) return
    setAttendance((prev) => ({ ...prev, [mediumId]: present }))
  }

  const handleSave = (closeEvent: boolean) => {
    onSave(event.id, attendance, closeEvent)
    onClose()
  }

  const TitleContent = () => (
    <>
      <span className="truncate pr-8">{event.name} - Lista</span>
      <Badge
        variant="outline"
        className={isClosed ? 'bg-slate-100 text-slate-700' : 'bg-purple-100 text-purple-700'}
      >
        {event.status.toUpperCase()}
      </Badge>
    </>
  )

  const SubtitleContent = () => (
    <>
      <span className="flex items-center gap-1">
        <Calendar className="w-4 h-4" /> {event.date.split('-').reverse().join('/')} às {event.time}
      </span>
      <span className="flex items-center gap-1">
        <MapPin className="w-4 h-4" /> {event.location}
      </span>
    </>
  )

  const renderList = () => (
    <>
      <div className="bg-purple-50 rounded-lg p-3 mb-4 flex justify-between items-center text-sm border border-purple-100 shrink-0 mx-4 sm:mx-6">
        <span className="font-medium text-purple-900">
          Médiuns Esperados ({expectedMediuns.length})
        </span>
        <span className="text-purple-700 truncate ml-2">Lista: {list.name}</span>
      </div>

      <div className="space-y-3 pb-8 px-4 sm:px-6">
        {expectedMediuns.map((m) => {
          const isEmLicenca = m.licenca === true

          return (
            <div
              key={m.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border shadow-sm transition-colors gap-3',
                isEmLicenca
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-purple-50 hover:border-purple-200',
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden min-w-0">
                <Avatar
                  className={cn(
                    'w-10 h-10 border shrink-0',
                    isEmLicenca ? 'border-slate-200 opacity-80' : 'border-purple-100',
                  )}
                >
                  <AvatarImage src={m.foto} />
                  <AvatarFallback
                    className={cn(
                      isEmLicenca ? 'bg-slate-200 text-slate-500' : 'bg-purple-100 text-purple-700',
                    )}
                  >
                    {m.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p
                      className={cn(
                        'font-medium truncate',
                        isEmLicenca ? 'text-slate-500' : 'text-purple-900',
                      )}
                    >
                      {m.nome}
                    </p>
                    {isEmLicenca && (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10 whitespace-nowrap">
                        🔴 Em Licença
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.contato || 'Sem contato'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    'text-sm font-medium',
                    attendance[m.id] && !isEmLicenca ? 'text-emerald-600' : 'text-slate-400',
                  )}
                >
                  {attendance[m.id] ? 'Presente' : 'Ausente'}
                </span>
                <Switch
                  checked={!!attendance[m.id]}
                  onCheckedChange={(c) => handleToggle(m.id, c)}
                  disabled={isClosed || isEmLicenca}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          )
        })}
        {expectedMediuns.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum médium associado a esta lista.
          </div>
        )}
      </div>
    </>
  )

  const renderFooter = () => (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-0 w-full">
      <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
        {isClosed ? 'Fechar' : 'Cancelar'}
      </Button>
      {!isClosed && (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => handleSave(false)}
            className="w-full sm:w-auto bg-purple-100 hover:bg-purple-200 text-purple-700"
          >
            Salvar Presença
          </Button>
          <Button
            onClick={() => handleSave(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
          >
            Fechar Evento
          </Button>
        </div>
      )}
      {isClosed && isOwner && (
        <Button
          variant="outline"
          onClick={() => {
            onSave(event.id, attendance, false, true)
            onClose()
          }}
          className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          Reabrir Evento
        </Button>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[90dvh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50/30">
          <DrawerHeader className="shrink-0 text-left p-4 pb-4 border-b border-purple-100 bg-white">
            <DrawerTitle className="text-xl text-purple-900 flex items-center justify-between">
              <TitleContent />
            </DrawerTitle>
            <div className="text-sm text-muted-foreground flex flex-col sm:flex-row gap-1 sm:gap-4 mt-2">
              <SubtitleContent />
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto py-4">{renderList()}</div>

          <DrawerFooter className="shrink-0 border-t border-purple-100 bg-white p-4 pb-8 mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {renderFooter()}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90dvh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50/30">
        <DialogHeader className="shrink-0 p-6 pb-4 border-b border-purple-100 bg-white">
          <DialogTitle className="text-xl text-purple-900 flex items-center justify-between pr-8">
            <TitleContent />
          </DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-4 mt-2">
            <SubtitleContent />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">{renderList()}</div>

        <DialogFooter className="shrink-0 p-6 pt-4 border-t border-purple-100 bg-white mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {renderFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
