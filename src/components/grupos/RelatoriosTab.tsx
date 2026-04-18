import { useMemo, useState, useEffect } from 'react'
import { useEvents } from '@/hooks/use-events'
import { useGroupingLists } from '@/hooks/use-grouping-lists'
import { Medium } from '@/hooks/use-mediuns'
import { getLicencasByGroup, LicencaMedium } from '@/services/licencas'
import { useRealtime } from '@/hooks/use-realtime'
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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Trophy,
  AlertTriangle,
  CalendarDays,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  CalendarX2,
  RefreshCcw,
  LayoutDashboard,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, BarChart, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const TrendIndicator = ({
  value,
  invertColors = false,
}: {
  value: number | null
  invertColors?: boolean
}) => {
  if (value === null) return <Minus className="w-4 h-4 text-slate-400" />

  if (value > 10) {
    return <ArrowUp className={`w-4 h-4 ${invertColors ? 'text-rose-500' : 'text-emerald-500'}`} />
  }
  if (value < -10) {
    return (
      <ArrowDown className={`w-4 h-4 ${invertColors ? 'text-emerald-500' : 'text-rose-500'}`} />
    )
  }

  return <div className="w-4 h-1.5 bg-amber-400 rounded-sm" />
}

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-purple-100 shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-4 bg-purple-100" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-16 bg-purple-100" />
              <Skeleton className="h-8 w-8 rounded-full bg-purple-100" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {[1, 2].map((i) => (
        <Card key={i} className="border-purple-100 shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48 mb-2 bg-purple-100" />
            <Skeleton className="h-4 w-64 bg-purple-100" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full bg-purple-50/50 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

export function RelatoriosTab({ groupId, mediuns }: { groupId: string; mediuns: Medium[] }) {
  const { events, isLoading, error } = useEvents(groupId)
  const { lists } = useGroupingLists(groupId)

  const [licencas, setLicencas] = useState<LicencaMedium[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const loadLicencas = async () => {
    try {
      const data = await getLicencasByGroup(groupId)
      setLicencas(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadLicencas()
  }, [groupId])

  useRealtime('licencas_mediuns', () => {
    loadLicencas()
  })

  const closedEvents = useMemo(() => events.filter((e) => e.status === 'fechado'), [events])

  const mediumStats = useMemo(() => {
    return mediuns
      .map((medium) => {
        let totalEvents = 0
        let presencas = 0
        let licencasCount = 0

        const mediumLicencas = licencas.filter((l) => l.medium_id === medium.id)

        closedEvents.forEach((ev) => {
          const isGlobalEvent = !ev.listId
          const list = lists.find((l) => l.id === ev.listId)
          const isInList = list ? list.mediumIds.includes(medium.id) : false

          if (isGlobalEvent || isInList) {
            totalEvents++

            const evDateStr = ev.date.split(' ')[0]
            const isOnLeave = mediumLicencas.some((l) => {
              const startStr = l.data_inicio.split(' ')[0]
              const endStr = l.data_fim.split(' ')[0]
              return evDateStr >= startStr && evDateStr <= endStr
            })

            if (ev.attendance?.[medium.id]) {
              presencas++
            } else if (isOnLeave) {
              licencasCount++
            }
          }
        })

        const eventosAvaliados = totalEvents - licencasCount
        const faltas = eventosAvaliados - presencas
        const percentual = eventosAvaliados > 0 ? (presencas / eventosAvaliados) * 100 : null

        return {
          ...medium,
          totalEvents,
          presencas,
          faltas,
          licencasCount,
          percentual,
          eventosAvaliados,
        }
      })
      .sort((a, b) => (b.percentual ?? 0) - (a.percentual ?? 0) || b.presencas - a.presencas)
  }, [mediuns, closedEvents, lists, licencas])

  const topPresentes = useMemo(() => {
    return [...mediumStats]
      .filter((m) => m.eventosAvaliados > 0)
      .sort((a, b) => (b.percentual ?? 0) - (a.percentual ?? 0) || b.presencas - a.presencas)
      .slice(0, 3)
  }, [mediumStats])

  const topFaltantes = useMemo(() => {
    return [...mediumStats]
      .filter((m) => m.eventosAvaliados > 0)
      .sort((a, b) => (a.percentual ?? 0) - (b.percentual ?? 0) || b.faltas - a.faltas)
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

        let totalEsperados = 0
        let presentes = 0
        let licencasCount = 0
        const ausentesList: Medium[] = []
        const licencasList: Medium[] = []

        const evDateStr = ev.date.split(' ')[0]

        expectedMediuns.forEach((mId) => {
          totalEsperados++

          const medium = mediuns.find((m) => m.id === mId)
          if (!medium) return

          const mediumLicencas = licencas.filter((l) => l.medium_id === mId)
          const isOnLeave = mediumLicencas.some((l) => {
            const startStr = l.data_inicio.split(' ')[0]
            const endStr = l.data_fim.split(' ')[0]
            return evDateStr >= startStr && evDateStr <= endStr
          })

          if (ev.attendance?.[mId]) {
            presentes++
          } else if (isOnLeave) {
            licencasCount++
            licencasList.push(medium)
          } else {
            ausentesList.push(medium)
          }
        })

        ausentesList.sort((a, b) => a.nome.localeCompare(b.nome))
        licencasList.sort((a, b) => a.nome.localeCompare(b.nome))

        const avaliaveis = totalEsperados - licencasCount
        const ausentes = avaliaveis - presentes
        const percentual = avaliaveis > 0 ? (presentes / avaliaveis) * 100 : null

        return {
          ...ev,
          totalEsperados,
          presentes,
          ausentes,
          licencasCount,
          percentual,
          ausentesList,
          licencasList,
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [closedEvents, lists, mediuns, licencas])

  const chartData = useMemo(() => {
    return eventStats.map((ev) => {
      const [year, month, day] = ev.date.split('-')
      return {
        ...ev,
        formattedDate: `${day}/${month}/${year}`,
      }
    })
  }, [eventStats])

  const chart1Config = {
    presentes: { label: 'Participantes', color: '#9333ea' },
    percentual: { label: 'Assiduidade (%)', color: '#10b981' },
  }

  const chart2Config = {
    ausentes: { label: 'Ausentes', color: '#ef4444' },
    licencasCount: { label: 'Em Licença', color: '#9ca3af' },
  }

  const renderDashboardContent = () => {
    if (isLoading) return <DashboardSkeleton />

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Ocorreu um erro ao carregar os dados</h3>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Tentar Novamente
          </Button>
        </div>
      )
    }

    if (events.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-purple-100 rounded-xl bg-purple-50/30 animate-fade-in-up">
          <CalendarX2 className="w-12 h-12 text-purple-300 mb-4" />
          <h3 className="text-xl font-bold text-purple-900 mb-2">Nenhum evento registrado</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Você precisa registrar eventos e realizar a chamada para visualizar o painel analítico.
          </p>
          <Button
            onClick={() => {
              const eventosTab = document.querySelector('[value="eventos"]') as HTMLElement
              if (eventosTab) eventosTab.click()
            }}
          >
            Criar Evento
          </Button>
        </div>
      )
    }

    const totalEvents = events.length
    const numClosed = eventStats.length

    const avgPresentes = numClosed ? eventStats.reduce((a, c) => a + c.presentes, 0) / numClosed : 0
    const avgAusentes = numClosed ? eventStats.reduce((a, c) => a + c.ausentes, 0) / numClosed : 0
    const avgLicencas = numClosed
      ? eventStats.reduce((a, c) => a + c.licencasCount, 0) / numClosed
      : 0

    const latestEvent = eventStats[0]
    const prevEvent = eventStats[1]

    const getVariation = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const trendPresentes =
      latestEvent && prevEvent ? getVariation(latestEvent.presentes, prevEvent.presentes) : null
    const trendAusentes =
      latestEvent && prevEvent ? getVariation(latestEvent.ausentes, prevEvent.ausentes) : null
    const trendLicencas =
      latestEvent && prevEvent
        ? getVariation(latestEvent.licencasCount, prevEvent.licencasCount)
        : null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
          <Card className="border-purple-100 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500">Total de Eventos</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-900">{totalEvents}</span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50">
                    <Minus className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500">Média de Participantes</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-900">
                    {avgPresentes.toFixed(1)}
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50">
                    <TrendIndicator value={trendPresentes} />
                  </div>
                </div>
                {trendPresentes !== null && (
                  <span className="text-xs text-slate-400 mt-2">vs último evento</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500">Média de Ausentes</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-900">
                    {avgAusentes.toFixed(1)}
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50">
                    <TrendIndicator value={trendAusentes} invertColors />
                  </div>
                </div>
                {trendAusentes !== null && (
                  <span className="text-xs text-slate-400 mt-2">vs último evento</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500">Média de Licenças</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-900">
                    {avgLicencas.toFixed(1)}
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50">
                    <TrendIndicator value={trendLicencas} invertColors />
                  </div>
                </div>
                {trendLicencas !== null && (
                  <span className="text-xs text-slate-400 mt-2">vs último evento</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {numClosed > 0 && (
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <Card className="border-purple-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-900 text-lg">
                  Assiduidade e Participação
                </CardTitle>
                <CardDescription>Evolução de presenças e % de comparecimento</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chart1Config} className="h-[300px] w-full">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="formattedDate"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      stroke="#64748b"
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke={chart1Config.presentes.color}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={chart1Config.percentual.color}
                      domain={[0, 100]}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar
                      yAxisId="left"
                      name={chart1Config.presentes.label}
                      dataKey="presentes"
                      fill={chart1Config.presentes.color}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Line
                      yAxisId="right"
                      name={chart1Config.percentual.label}
                      dataKey="percentual"
                      type="monotone"
                      stroke={chart1Config.percentual.color}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-purple-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-900 text-lg">Ausências e Licenças</CardTitle>
                <CardDescription>Proporção de faltas e membros licenciados</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chart2Config} className="h-[300px] w-full">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="formattedDate"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      stroke="#64748b"
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar
                      name={chart2Config.ausentes.label}
                      dataKey="ausentes"
                      stackId="a"
                      fill={chart2Config.ausentes.color}
                      radius={[0, 0, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      name={chart2Config.licencasCount.label}
                      dataKey="licencasCount"
                      stackId="a"
                      fill={chart2Config.licencasCount.color}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-purple-900">Relatórios e Estatísticas</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe a assiduidade e os dados consolidados do terreiro.
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4 bg-purple-50/50 text-purple-900 border border-purple-100 flex flex-wrap h-auto p-1">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm flex items-center gap-2 flex-1 sm:flex-none"
          >
            <LayoutDashboard className="w-4 h-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="por-medium"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm flex items-center gap-2 flex-1 sm:flex-none"
          >
            <Users className="w-4 h-4" /> Por Médium
          </TabsTrigger>
          <TabsTrigger
            value="por-evento"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm flex items-center gap-2 flex-1 sm:flex-none"
          >
            <CalendarDays className="w-4 h-4" /> Por Evento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="focus-visible:outline-none">
          {renderDashboardContent()}
        </TabsContent>

        <TabsContent value="por-medium" className="space-y-6 focus-visible:outline-none">
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
                          {(m.percentual ?? 0).toFixed(0)}%
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
              <CardDescription>Total de Médiuns: {mediuns.length}</CardDescription>
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
                      <TableHead className="font-semibold text-purple-900 text-center">
                        Licenças
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center hidden sm:table-cell">
                        Faltas
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-right">
                        Assiduidade (%)
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
                        <TableCell className="text-center text-amber-600 font-medium">
                          {m.licencasCount}
                        </TableCell>
                        <TableCell className="text-center text-rose-600 font-medium hidden sm:table-cell">
                          {m.faltas}
                        </TableCell>
                        <TableCell className="text-right">
                          {m.percentual === null ? (
                            <span className="text-muted-foreground font-medium text-sm">N/A</span>
                          ) : (
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
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {mediumStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

        <TabsContent value="por-evento" className="focus-visible:outline-none">
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
                        Evento
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center hidden md:table-cell">
                        Total Esperados
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center">
                        Presentes
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center">
                        Licenças
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-center hidden sm:table-cell">
                        Ausentes
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900 text-right">
                        Comparecimento (%)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventStats.map((ev) => (
                      <TableRow
                        key={ev.id}
                        className="cursor-pointer hover:bg-purple-50/30 transition-colors"
                        onClick={() => setSelectedEventId(ev.id)}
                      >
                        <TableCell>
                          <div className="font-bold text-purple-900 whitespace-nowrap">
                            {ev.name}
                          </div>
                          <div className="font-medium text-slate-700 whitespace-nowrap text-sm mt-1">
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
                        <TableCell className="text-center text-amber-600 font-medium">
                          {ev.licencasCount}
                        </TableCell>
                        <TableCell className="text-center text-rose-600 font-medium hidden sm:table-cell">
                          {ev.ausentes}
                        </TableCell>
                        <TableCell className="text-right">
                          {ev.percentual === null ? (
                            <span className="text-muted-foreground font-medium text-sm">N/A</span>
                          ) : (
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
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {eventStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

      {(() => {
        const selectedEventData = eventStats.find((ev) => ev.id === selectedEventId)
        return (
          <Dialog
            open={!!selectedEventId}
            onOpenChange={(open) => !open && setSelectedEventId(null)}
          >
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-purple-900 text-xl">
                  {selectedEventData?.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedEventData && selectedEventData.date.split('-').reverse().join('/')} -{' '}
                  {selectedEventData?.location}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <Card className="border-rose-100 shadow-sm">
                  <CardHeader className="bg-rose-50/50 pb-3 border-b border-rose-50">
                    <CardTitle className="text-rose-800 text-base flex items-center justify-between">
                      <span>Ausentes</span>
                      <Badge
                        variant="outline"
                        className="bg-rose-100 text-rose-700 border-rose-200"
                      >
                        {selectedEventData?.ausentesList.length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                      {!selectedEventData?.ausentesList.length ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum médium ausente
                        </p>
                      ) : (
                        selectedEventData.ausentesList.map((m) => (
                          <div key={m.id} className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={m.foto} />
                              <AvatarFallback className="bg-rose-100 text-rose-700">
                                {m.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-700 truncate">
                              {m.nome}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-100 shadow-sm">
                  <CardHeader className="bg-amber-50/50 pb-3 border-b border-amber-50">
                    <CardTitle className="text-amber-800 text-base flex items-center justify-between">
                      <span>Em Licença</span>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-700 border-amber-200"
                      >
                        {selectedEventData?.licencasList.length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
                      {!selectedEventData?.licencasList.length ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma licença registrada para este evento.
                        </p>
                      ) : (
                        selectedEventData.licencasList.map((m) => (
                          <div key={m.id} className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={m.foto} />
                              <AvatarFallback className="bg-amber-100 text-amber-700">
                                {m.nome.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-700 truncate">
                              {m.nome}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )
      })()}
    </div>
  )
}
