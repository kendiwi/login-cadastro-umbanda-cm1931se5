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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

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

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState('')
  const [listType, setListType] = useState<'specific' | 'all'>('all')
  const [status, setStatus] = useState<'planejado' | 'em andamento' | 'fechado'>('planejado')
  const isMobile = useIsMobile()

  const openModal = (ev?: GiraEvent) => {
    if (ev) {
      setEditingEvent(ev)
      setName(ev.name)
      setDate(ev.date)
      setTime(ev.time)
      setLocation(ev.location)
      setDescription(ev.description)
      setListId(ev.listId || '')
      setListType(ev.listId ? 'specific' : 'all')
      setStatus(ev.status)
    } else {
      setEditingEvent(null)
      setName('')
      setDate('')
      setTime('')
      setLocation('')
      setDescription('')
      setListId('')
      setListType('all')
      setStatus('planejado')
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!name || !date || !time || !location) return
    if (listType === 'specific' && !listId) return

    const eventData = {
      name,
      date,
      time,
      location,
      description,
      listId: listType === 'specific' ? listId : '',
      status,
    }
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

  const formContent = (
    <div className="grid gap-4 py-4 px-4 sm:px-0 overflow-y-auto min-h-0 flex-1">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Evento</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Festa de Iemanjá, Gira de Caboclos..."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Hora</Label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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
      <div className="space-y-3">
        <Label>Participantes</Label>
        <RadioGroup
          value={listType}
          onValueChange={(val: any) => setListType(val)}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="r-all" />
            <Label htmlFor="r-all" className="cursor-pointer font-normal">
              Todos os Médiuns
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific" id="r-specific" />
            <Label htmlFor="r-specific" className="cursor-pointer font-normal">
              Lista Específica
            </Label>
          </div>
        </RadioGroup>
      </div>

      {listType === 'specific' && (
        <div className="space-y-2 animate-fade-in-up">
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
      )}
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
  )

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
        <div className="mb-3 sm:mb-0 w-full sm:w-auto">
          <h2 className="text-xl font-bold text-purple-900">Eventos de Gira</h2>
          <p className="text-sm text-muted-foreground">
            Agende e gerencie os trabalhos do terreiro.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => openModal()}
            className="bg-purple-600 hover:bg-purple-700 shadow-md w-full sm:w-auto mt-3 sm:mt-0"
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
              <TableHead className="font-semibold text-purple-900 whitespace-nowrap">
                Evento
              </TableHead>
              <TableHead className="font-semibold text-purple-900 hidden md:table-cell">
                Local
              </TableHead>
              <TableHead className="font-semibold text-purple-900 text-center hidden sm:table-cell">
                Participantes
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
                <TableCell className="whitespace-nowrap">
                  <div className="font-bold text-purple-900">{ev.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" /> {ev.date.split('-').reverse().join('/')}{' '}
                    às {ev.time}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 md:hidden">{ev.location}</div>
                </TableCell>
                <TableCell className="text-slate-700 hidden md:table-cell">{ev.location}</TableCell>
                <TableCell className="text-center font-medium text-slate-700 hidden sm:table-cell">
                  {ev.listId ? (
                    <div className="flex flex-col items-center">
                      <span
                        className="text-xs text-slate-500 mb-1 max-w-[120px] truncate"
                        title={lists.find((l) => l.id === ev.listId)?.name}
                      >
                        {lists.find((l) => l.id === ev.listId)?.name || 'Lista removida'}
                      </span>
                      <Badge variant="outline" className="bg-slate-50">
                        {getExpectedCount(ev.listId)} esperados
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-purple-700 mb-1">
                        Todos os Médiuns
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {mediuns.length} esperados
                      </Badge>
                    </div>
                  )}
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

      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-purple-900">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </DrawerTitle>
            </DrawerHeader>
            {formContent}
            <DrawerFooter className="pt-2">
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={handleSave}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={
                    !name || !date || !time || !location || (listType === 'specific' && !listId)
                  }
                >
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">
                  Cancelar
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-purple-900">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
            </DialogHeader>
            {formContent}
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
                disabled={
                  !name || !date || !time || !location || (listType === 'specific' && !listId)
                }
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AttendanceModal
        isOpen={!!attendanceEvent}
        onClose={() => setAttendanceEvent(null)}
        event={attendanceEvent}
        list={
          attendanceEvent
            ? attendanceEvent.listId
              ? lists.find((l) => l.id === attendanceEvent.listId) || null
              : ({
                  id: 'all',
                  name: 'Todos os Médiuns',
                  mediumIds: mediuns.map((m) => m.id),
                } as any)
            : null
        }
        mediuns={mediuns}
        isOwner={isOwner}
        onSave={handleSaveAttendance}
      />
    </div>
  )
}
