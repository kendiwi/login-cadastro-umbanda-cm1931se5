import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { GiraEvent } from '@/hooks/use-events'
import { Medium } from '@/hooks/use-mediuns'
import { GroupingList } from '@/hooks/use-grouping-lists'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin } from 'lucide-react'

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  event: GiraEvent | null
  list: GroupingList | null
  mediuns: Medium[]
  onSave: (eventId: string, attendance: Record<string, boolean>, closeEvent: boolean) => void
}

export function AttendanceModal({
  isOpen,
  onClose,
  event,
  list,
  mediuns,
  onSave,
}: AttendanceModalProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen && event) {
      setAttendance(event.attendance || {})
    }
  }, [isOpen, event])

  if (!event || !list) return null

  const isClosed = event.status === 'fechado'
  const expectedMediuns = mediuns.filter((m) => list.mediumIds.includes(m.id))

  const handleToggle = (mediumId: string, present: boolean) => {
    if (isClosed) return
    setAttendance((prev) => ({ ...prev, [mediumId]: present }))
  }

  const handleSave = (closeEvent: boolean) => {
    onSave(event.id, attendance, closeEvent)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-900 flex items-center justify-between">
            <span>Lista de Presença</span>
            <Badge
              variant="outline"
              className={isClosed ? 'bg-slate-100 text-slate-700' : 'bg-purple-100 text-purple-700'}
            >
              {event.status.toUpperCase()}
            </Badge>
          </DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {event.date.split('-').reverse().join('/')} às{' '}
              {event.time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {event.location}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          <div className="bg-purple-50 rounded-lg p-3 mb-4 flex justify-between items-center text-sm border border-purple-100">
            <span className="font-medium text-purple-900">
              Médiuns Esperados ({expectedMediuns.length})
            </span>
            <span className="text-purple-700">Lista: {list.name}</span>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {expectedMediuns.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-purple-50 bg-white shadow-sm hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-purple-100">
                      <AvatarImage src={m.foto} />
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {m.nome.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-purple-900">{m.nome}</p>
                      <p className="text-xs text-muted-foreground">{m.contato || 'Sem contato'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${attendance[m.id] ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                      {attendance[m.id] ? 'Presente' : 'Ausente'}
                    </span>
                    <Switch
                      checked={!!attendance[m.id]}
                      onCheckedChange={(c) => handleToggle(m.id, c)}
                      disabled={isClosed}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>
              ))}
              {expectedMediuns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum médium associado a esta lista.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="sm:justify-between border-t border-purple-100 pt-4 mt-auto">
          <Button variant="outline" onClick={onClose}>
            {isClosed ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isClosed && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleSave(false)}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700"
              >
                Salvar Presença
              </Button>
              <Button
                onClick={() => handleSave(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Fechar Evento
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
