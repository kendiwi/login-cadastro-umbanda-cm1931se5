import { useMemo } from 'react'
import { useEvents } from '@/hooks/use-events'
import { useGroupingLists } from '@/hooks/use-grouping-lists'
import { Medium } from '@/hooks/use-mediuns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, AlertTriangle, CalendarDays, Users } from 'lucide-react'

export function RelatoriosTab({ groupId, mediuns }: { groupId: string; mediuns: Medium[] }) {
  const { events } = useEvents(groupId)
  const { lists } = useGroupingLists(groupId)

  const closedEvents = useMemo(() => events.filter((e) => e.status === 'fechado'), [events])

  const mediumStats = useMemo(() => {
    return mediuns
      .map((medium) => {
        let totalEvents = 0
        let presencas = 0

        closedEvents.forEach((ev) => {
          const isGlobalEvent = !ev.listId
          const list = lists.find((l) => l.id === ev.listId)
          const isInList = list ? list.mediumIds.includes(medium.id) : false

          if (isGlobalEvent || isInList) {
            totalEvents++
            if (ev.attendance?.[medium.id]) {
              presencas++
            }
          }
        })

        const faltas = totalEvents - presencas
        const percentual = totalEvents > 0 ? (presencas / totalEvents) * 100 : 0

        return {
          ...medium,
          totalEvents,
          presencas,
          faltas,
          percentual,
        }
      })
      .sort((a, b) => b.percentual - a.percentual || b.presencas - a.presencas)
  }, [mediuns, closedEvents, lists])

  const topPresentes = useMemo(() => {
    return [...mediumStats]
      .filter((m) => m.totalEvents > 0)
      .sort((a, b) => b.percentual - a.percentual || b.presencas - a.presencas)
      .slice(0, 3)
  }, [mediumStats])

  const topFaltantes = useMemo(() => {
    return [...mediumStats]
      .filter((m) => m.totalEvents > 0)
      .sort((a, b) => a.percentual - b.percentual || b.faltas - a.faltas)
      .slice(0, 3)
  }, [mediumStats])

  const eventStats = useMemo(() => {
    return closedEvents
      .map((ev) => {
        const isGlobalEvent = !ev.listId
        const list = lists.find((l) => l.id === ev.listId)
        const expectedMediuns = isGlobalEvent
          ? mediuns.map((m) => m.id)
          : list
            ? list.mediumIds
            : []
        const totalEsperados = expectedMediuns.length

        let presentes = 0
        expectedMediuns.forEach((mId) => {
          if (ev.attendance?.[mId]) presentes++
        })

        const ausentes = totalEsperados - presentes
        const percentual = totalEsperados > 0 ? (presentes / totalEsperados) * 100 : 0

        return {
          ...ev,
          totalEsperados,
          presentes,
          ausentes,
          percentual,
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [closedEvents, lists, mediuns])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-purple-900">Relatórios e Estatísticas</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe a assiduidade e os dados consolidados do terreiro.
          </p>
        </div>
      </div>

      <Tabs defaultValue="por-medium" className="w-full">
        <TabsList className="mb-4 bg-purple-50/50 text-purple-900 border border-purple-100">
          <TabsTrigger
            value="por-medium"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
          >
            Por Médium
          </TabsTrigger>
          <TabsTrigger
            value="por-evento"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
          >
            Por Evento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="por-medium" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-emerald-100 bg-emerald-50/30 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-800 flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-emerald-600" /> Top 3 Mais Presentes
                </CardTitle>
                <CardDescription>Médiuns com maior assiduidade.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPresentes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Dados insuficientes.</p>
                  ) : (
                    topPresentes.map((m, i) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700 w-4">{i + 1}º</span>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={m.foto} />
                            <AvatarFallback>{m.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm truncate max-w-[120px]">
                            {m.nome}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {m.percentual.toFixed(0)}%
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-100 bg-rose-50/30 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-rose-800 flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-600" /> Top 3 Mais Faltantes
                </CardTitle>
                <CardDescription>Médiuns com maior número de faltas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topFaltantes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Dados insuficientes.</p>
                  ) : (
                    topFaltantes.map((m, i) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-rose-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-700 w-4">{i + 1}º</span>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={m.foto} />
                            <AvatarFallback>{m.nome.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm truncate max-w-[120px]">
                            {m.nome}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-rose-50 text-rose-700 border-rose-200"
                        >
                          {m.faltas} faltas
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-purple-100 shadow-sm">
            <CardHeader className="bg-purple-50/40 border-b border-purple-50">
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" /> Relatório Geral de Médiuns
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-purple-50/20">
                    <TableRow>
                      <TableHead className="font-semibold text-purple-900">Médium</TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center hidden md:table-cell">
                        Eventos Esperados
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center">
                        Presenças
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center hidden sm:table-cell">
                        Faltas
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-right">
                        Assiduidade
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mediumStats.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-[120px]">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={m.foto} />
                              <AvatarFallback>{m.nome.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium whitespace-nowrap">{m.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          {m.totalEvents}
                        </TableCell>
                        <TableCell className="text-center text-emerald-600 font-medium">
                          {m.presencas}
                        </TableCell>
                        <TableCell className="text-center text-rose-600 font-medium hidden sm:table-cell">
                          {m.faltas}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              m.percentual >= 75
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : m.percentual >= 50
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }
                          >
                            {m.percentual.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {mediumStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum dado disponível.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="por-evento">
          <Card className="border-purple-100 shadow-sm">
            <CardHeader className="bg-purple-50/40 border-b border-purple-50">
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-600" /> Histórico de Eventos Realizados
              </CardTitle>
              <CardDescription>Eventos com status "fechado".</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-purple-50/20">
                    <TableRow>
                      <TableHead className="font-semibold text-purple-900 whitespace-nowrap">
                        Data / Local
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center hidden md:table-cell">
                        Total Esperados
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center">
                        Presentes
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center hidden sm:table-cell">
                        Ausentes
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-right">
                        Comparecimento
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventStats.map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell>
                          <div className="font-medium text-purple-900 whitespace-nowrap">
                            {ev.date.split('-').reverse().join('/')}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {ev.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          {ev.totalEsperados}
                        </TableCell>
                        <TableCell className="text-center text-emerald-600 font-medium">
                          {ev.presentes}
                        </TableCell>
                        <TableCell className="text-center text-rose-600 font-medium hidden sm:table-cell">
                          {ev.ausentes}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              ev.percentual >= 75
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ev.percentual >= 50
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                            }
                          >
                            {ev.percentual.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {eventStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum evento fechado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
