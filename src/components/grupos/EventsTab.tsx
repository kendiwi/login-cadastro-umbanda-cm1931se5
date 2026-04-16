import { useState } from 'react'
import { Plus, Edit, Trash2, Calendar, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEvents, GiraEvent } from '@/hooks/use-events'
import { useGroupingLists } from '@/hooks/use-grouping-lists'
import { Medium } from '@/hooks/use-mediuns'
import { AttendanceModal } from './AttendanceModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function EventsTab({
  groupId,
  canManage,
  isOwner,
  mediuns,
}: {
  groupId: string
  canManage: boolean
  isOwner: boolean
  mediuns: Medium[]
}) {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents(groupId)
  const { lists } = useGroupingLists(groupId)

  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<GiraEvent | null>(null)
  const [attendanceEvent, setAttendanceEvent] = useState<GiraEvent | null>(null)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState('')
  const [status, setStatus] = useState<'planejado' | 'em andamento' | 'fechado'>('planejado')

  const openModal = (ev?: GiraEvent) => {
    if (ev) {
      setEditingEvent(ev)
      setDate(ev.date)
      setTime(ev.time)
      setLocation(ev.location)
      setDescription(ev.description)
      setListId(ev.listId)
      setStatus(ev.status)
    } else {
      setEditingEvent(null)
      setDate('')
      setTime('')
      setLocation('')
      setDescription('')
      setListId('')
      setStatus('planejado')
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!date || !time || !location || !listId) return
    const eventData = { date, time, location, description, listId, status }
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
      } else {
        await addEvent(eventData)
      }
      setIsOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  const getExpectedCount = (id: string) => {
    const list = lists.find((l) => l.id === id)
    return list ? list.mediumIds.length : 'Lista removida'
  }

  const handleSaveAttendance = async (
    eventId: string,
    attendance: Record<string, boolean>,
    closeEvent: boolean,
    reopenEvent?: boolean,
  ) => {
    const eventToUpdate = events.find((e) => e.id === eventId)
    if (!eventToUpdate) return
    let newStatus = eventToUpdate.status
    if (closeEvent) newStatus = 'fechado'
    else if (reopenEvent) newStatus = 'em andamento'
    else if (eventToUpdate.status === 'planejado') newStatus = 'em andamento'

    try {
      await updateEvent(eventId, { attendance, status: newStatus as any })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-purple-900">Eventos de Gira</h2>
          <p className="text-sm text-muted-foreground">
            Agende e gerencie os trabalhos do terreiro.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => openModal()}
            className="bg-purple-600 hover:bg-purple-700 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Evento
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-purple-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-purple-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-purple-900">Data e Hora</TableHead>
              <TableHead className="font-semibold text-purple-900">Local</TableHead>
              <TableHead className="font-semibold text-purple-900 text-center">
                Médiuns Esperados
              </TableHead>
              <TableHead className="font-semibold text-purple-900">Status</TableHead>
              {canManage && (
                <TableHead className="text-right font-semibold text-purple-900">Ações</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((ev) => (
              <TableRow key={ev.id} className="hover:bg-purple-50/30">
                <TableCell>
                  <div className="font-medium text-purple-900">
                    {ev.date.split('-').reverse().join('/')}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" /> {ev.time}
                  </div>
                </TableCell>
                <TableCell className="text-slate-700">{ev.location}</TableCell>
                <TableCell className="text-center font-medium text-slate-700">
                  <Badge variant="outline" className="bg-slate-50">
                    {getExpectedCount(ev.listId)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      ev.status === 'fechado'
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : ev.status === 'em andamento'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    }
                  >
                    {ev.status}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttendanceEvent(ev)}
                      className="text-emerald-600 hover:bg-emerald-50 mr-1"
                      title="Lista de Presença"
                    >
                      <UserCheck className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(ev)}
                      className="text-purple-700 hover:bg-purple-50"
                      title="Editar Evento"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEvent(ev.id)}
                      className="text-red-600 hover:bg-red-50 ml-1"
                      title="Excluir Evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Calendar className="w-10 h-10 mb-2 text-purple-200" />
                    <p>Nenhum evento agendado.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Terreiro, Praia, Cachoeira..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="list">Lista de Agrupamento</Label>
              <Select value={listId} onValueChange={setListId}>
                <SelectTrigger id="list">
                  <SelectValue placeholder="Selecione uma lista" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} ({l.mediumIds.length} médiuns)
                    </SelectItem>
                  ))}
                  {lists.length === 0 && (
                    <SelectItem value="disabled" disabled>
                      Nenhuma lista disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(val: any) => setStatus(val)}
                disabled={editingEvent?.status === 'fechado' && !isOwner}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="em andamento">Em Andamento</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes do evento..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!date || !time || !location || !listId}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AttendanceModal
        isOpen={!!attendanceEvent}
        onClose={() => setAttendanceEvent(null)}
        event={attendanceEvent}
        list={attendanceEvent ? lists.find((l) => l.id === attendanceEvent.listId) || null : null}
        mediuns={mediuns}
        isOwner={isOwner}
        onSave={handleSaveAttendance}
      />
    </div>
  )
}
