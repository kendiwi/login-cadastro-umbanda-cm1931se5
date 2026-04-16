import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function Requests() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: 'João Batista',
      email: 'joao.batista@email.com',
      date: '15/05/2026',
      group: 'Terreiro Luz Divina',
    },
    {
      id: 2,
      name: 'Mariana Silva',
      email: 'mariana.s@email.com',
      date: '14/05/2026',
      group: 'Terreiro Luz Divina',
    },
    {
      id: 3,
      name: 'Carlos Eduardo',
      email: 'cadu.edu@email.com',
      date: '12/05/2026',
      group: 'Terreiro Luz Divina',
    },
  ])

  const handleApprove = (id: number, name: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    toast.success('Solicitação Aprovada', {
      description: `${name} agora é membro do grupo.`,
    })
  }

  const handleDeny = (id: number, name: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    toast.error('Solicitação Recusada', {
      description: `A entrada de ${name} foi negada.`,
    })
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-purple-900">Solicitações de Acesso</h1>
        <p className="text-slate-600 mt-2">
          Gerencie quem deseja participar dos grupos que você administra.
        </p>
      </div>

      <Card className="border-purple-200/60 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-purple-50/50 border-b border-purple-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-900 font-serif">
            <Users className="w-5 h-5 text-yellow-600" />
            Pendentes
            <Badge className="bg-purple-900 hover:bg-purple-800 ml-2">{requests.length}</Badge>
          </CardTitle>
          <CardDescription className="text-slate-600">
            Revisão de novos membros para aprovação.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhuma solicitação pendente no momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-purple-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-purple-900">
                      Nome do Solicitante
                    </TableHead>
                    <TableHead className="font-semibold text-purple-900">Email</TableHead>
                    <TableHead className="font-semibold text-purple-900 hidden md:table-cell">
                      Grupo
                    </TableHead>
                    <TableHead className="font-semibold text-purple-900">
                      Data da Solicitação
                    </TableHead>
                    <TableHead className="text-right font-semibold text-purple-900">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow
                      key={req.id}
                      className="border-purple-100 hover:bg-purple-50/50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-900">{req.name}</TableCell>
                      <TableCell className="text-slate-600">{req.email}</TableCell>
                      <TableCell className="text-slate-600 hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className="border-purple-200 text-purple-700 bg-purple-50"
                        >
                          {req.group}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">{req.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeny(req.id, req.name)}
                          >
                            <X className="w-4 h-4 mr-1 sm:mr-0 lg:mr-1" />
                            <span className="hidden lg:inline">Negar</span>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(req.id, req.name)}
                          >
                            <Check className="w-4 h-4 mr-1 sm:mr-0 lg:mr-1" />
                            <span className="hidden lg:inline">Aprovar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
