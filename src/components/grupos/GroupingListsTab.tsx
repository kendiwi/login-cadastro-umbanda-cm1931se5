import { useState } from 'react'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useGroupingLists, GroupingList } from '@/hooks/use-grouping-lists'
import { Medium } from '@/hooks/use-mediuns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'

export function GroupingListsTab({
  groupId,
  canManage,
  mediuns,
}: {
  groupId: string
  canManage: boolean
  mediuns: Medium[]
}) {
  const { lists, addList, updateList, deleteList } = useGroupingLists(groupId)
  const [isOpen, setIsOpen] = useState(false)
  const [editingList, setEditingList] = useState<GroupingList | null>(null)

  const [name, setName] = useState('')
  const [selectedMediums, setSelectedMediums] = useState<string[]>([])

  const openModal = (list?: GroupingList) => {
    if (list) {
      setEditingList(list)
      setName(list.name)
      setSelectedMediums(list.mediumIds)
    } else {
      setEditingList(null)
      setName('')
      setSelectedMediums([])
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!name) return
    try {
      if (editingList) {
        await updateList(editingList.id, { name, mediumIds: selectedMediums })
      } else {
        await addList({ name, mediumIds: selectedMediums })
      }
      setIsOpen(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-purple-900">Listas de Agrupamento</h2>
          <p className="text-sm text-muted-foreground">
            Organize seus médiuns em linhas de trabalho.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => openModal()}
            className="bg-purple-600 hover:bg-purple-700 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Lista
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <Card
            key={list.id}
            className="border-purple-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3 bg-purple-50/50 rounded-t-xl">
              <CardTitle className="text-lg text-purple-900">{list.name}</CardTitle>
              <CardDescription>
                {list.mediumIds.length} {list.mediumIds.length === 1 ? 'médium' : 'médiuns'}
              </CardDescription>
            </CardHeader>
            {canManage && (
              <CardContent className="flex justify-end gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal(list)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Edit className="w-4 h-4 mr-1" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteList(list.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Remover
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
        {lists.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-purple-100 shadow-sm text-muted-foreground">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-300" />
            </div>
            <p className="font-medium text-purple-900">Nenhuma lista criada ainda.</p>
            {canManage && (
              <p className="text-sm mt-1">
                Clique em "Nova Lista" para começar a organizar seus médiuns.
              </p>
            )}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-purple-900">
              {editingList ? 'Editar Lista' : 'Nova Lista'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Lista</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Caboclos, Pretos Velhos..."
              />
            </div>
            <div className="space-y-2">
              <Label>Selecione os Médiuns</Label>
              <div className="border border-purple-100 rounded-md overflow-hidden bg-slate-50">
                <ScrollArea className="h-[200px] p-4">
                  {mediuns.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center space-x-3 mb-3 p-2 rounded-md hover:bg-purple-100/50 transition-colors"
                    >
                      <Checkbox
                        id={m.id}
                        checked={selectedMediums.includes(m.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMediums([...selectedMediums, m.id])
                          } else {
                            setSelectedMediums(selectedMediums.filter((id) => id !== m.id))
                          }
                        }}
                      />
                      <label
                        htmlFor={m.id}
                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                      >
                        {m.nome}
                      </label>
                    </div>
                  ))}
                  {mediuns.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum médium cadastrado neste grupo.
                    </p>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
