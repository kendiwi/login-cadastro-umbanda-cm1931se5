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
import { Calendar, MapPin, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useOfflineSync } from '@/hooks/use-offline-sync'
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
  const {
    isOnline,
    pendingChanges,
    isSyncing,
    savingIds,
    savePresence,
    triggerSync,
    manualSyncRequired,
  } = useOfflineSync(event?.id)

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
    const prev = attendance[mediumId]
    setAttendance((a) => ({ ...a, [mediumId]: present }))
    savePresence(mediumId, present, () => {
      setAttendance((a) => ({ ...a, [mediumId]: prev || false }))
    })
  }

  const TitleContent = () => (
    <div className="flex items-center flex-wrap gap-2 pr-8">
      <span className="truncate">{event.name} - Lista</span>
      <Badge
        variant="outline"
        className={isClosed ? 'bg-slate-100 text-slate-700' : 'bg-purple-100 text-purple-700'}
      >
        {event.status.toUpperCase()}
      </Badge>
      {!isOnline && (
        <Badge variant="destructive" className="flex items-center gap-1 whitespace-nowrap">
          <WifiOff className="w-3 h-3" /> Offline
        </Badge>
      )}
      {pendingChanges.length > 0 && (
        <Badge variant="destructive" className="flex items-center gap-1 whitespace-nowrap">
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {pendingChanges.length} alteraç{pendingChanges.length !== 1 ? 'ões' : 'ão'} pendente
          {pendingChanges.length !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
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
          const eventDateStr = event.date.split(' ')[0]
          const mStartDate = m.data_inicio_atividades ? m.data_inicio_atividades.split(' ')[0] : ''
          const notActiveYet = mStartDate && eventDateStr < mStartDate

          return (
            <div
              key={m.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border shadow-sm transition-all duration-300 gap-3',
                isEmLicenca || notActiveYet
                  ? 'bg-slate-50 border-slate-200'
                  : savingIds.has(m.id)
                    ? 'bg-purple-50/50 border-purple-200 ring-1 ring-purple-100'
                    : 'bg-white border-purple-50 hover:border-purple-200',
              )}
            >
              <div
                className={cn(
                  'flex items-center gap-3 overflow-hidden min-w-0',
                  notActiveYet && 'opacity-50',
                )}
              >
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
                    {isEmLicenca && !notActiveYet && (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10 whitespace-nowrap">
                        🔴 Em Licença
                      </span>
                    )}
                    {notActiveYet && (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 whitespace-nowrap">
                        Médium ativo desde {mStartDate.split('-').reverse().join('/')}
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
                    'text-sm font-medium transition-colors',
                    savingIds.has(m.id)
                      ? 'text-purple-500'
                      : attendance[m.id] && !isEmLicenca
                        ? 'text-emerald-600'
                        : 'text-slate-400',
                  )}
                >
                  {savingIds.has(m.id) ? 'Salvando...' : attendance[m.id] ? 'Presente' : 'Ausente'}
                </span>
                <div className="flex items-center gap-2">
                  {savingIds.has(m.id) && (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  )}
                  <Switch
                    checked={!!attendance[m.id]}
                    onCheckedChange={(c) => handleToggle(m.id, c)}
                    disabled={isClosed || isEmLicenca || notActiveYet || savingIds.has(m.id)}
                    className={cn(
                      'data-[state=checked]:bg-emerald-500 transition-opacity',
                      savingIds.has(m.id) && 'opacity-50',
                    )}
                  />
                </div>
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
      {!isClosed && isOnline && pendingChanges.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
          <Button
            variant="secondary"
            onClick={triggerSync}
            disabled={isSyncing}
            className="w-full sm:w-auto bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sincronizar manualmente
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
            <DrawerTitle className="text-xl text-purple-900">
              <TitleContent />
            </DrawerTitle>
            <div className="text-sm text-muted-foreground flex flex-col sm:flex-row gap-1 sm:gap-4 mt-4">
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
          <DialogTitle className="text-xl text-purple-900">
            <TitleContent />
          </DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-4 mt-4">
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
