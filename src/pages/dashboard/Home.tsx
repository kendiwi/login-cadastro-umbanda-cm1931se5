import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertCircle, CalendarClock, ShieldAlert, Sparkles, Activity } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'

export default function DashboardHome() {
  const { user } = useAuth()
  const [licencasHoje, setLicencasHoje] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const fetchLicencas = async () => {
      try {
        const records = await pb.collection('licencas_mediuns').getFullList({
          expand: 'medium_id,medium_id.grupo_id',
          filter: `medium_id.ativo = true || medium_id.ativo = null`,
          sort: 'data_fim',
        })

        const now = new Date()
        now.setHours(0, 0, 0, 0)

        const active = records.filter((r) => {
          const start = new Date(r.data_inicio)
          start.setHours(0, 0, 0, 0)
          const end = new Date(r.data_fim)
          end.setHours(23, 59, 59, 999)
          return now >= start && now <= end
        })

        const myGroups = await pb.collection('grupo_membros').getFullList({
          filter: `user_id = "${user.id}"`,
        })
        const myGroupIds = myGroups.map((g) => g.grupo_id)

        const ownedGroups = await pb.collection('grupos').getFullList({
          filter: `owner_id = "${user.id}"`,
        })
        ownedGroups.forEach((g) => {
          if (!myGroupIds.includes(g.id)) myGroupIds.push(g.id)
        })

        const filtered = active.filter((r) => myGroupIds.includes(r.expand?.medium_id?.grupo_id))
        setLicencasHoje(filtered)
      } catch (e) {
        console.error(e)
      }
    }
    fetchLicencas()
  }, [user])

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-full">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-serif text-primary">Bem-vindo, {user?.name || 'Irmão'}</h1>
          <p className="text-muted-foreground">
            Aqui está o resumo das suas atividades no terreiro.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-amber-200 shadow-sm animate-slide-up">
          <CardHeader className="bg-amber-50/50 pb-4 border-b border-amber-100 rounded-t-xl">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Médiuns em Licença Hoje
            </CardTitle>
            <CardDescription>Membros do corpo mediúnico atualmente afastados</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {licencasHoje.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <CalendarClock className="w-12 h-12 text-amber-200 mb-3" />
                <p>Nenhum médium em licença no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {licencasHoje.map((licenca) => (
                  <div
                    key={licenca.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-amber-100 rounded-lg shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium text-amber-950">
                        {licenca.expand?.medium_id?.nome}
                      </p>
                      <p className="text-xs text-amber-700/80">
                        {licenca.expand?.medium_id?.expand?.grupo_id?.nome}
                      </p>
                    </div>
                    <div className="text-sm bg-amber-100/50 px-3 py-1.5 rounded-md text-amber-800 flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Retorno: {format(new Date(licenca.data_fim), 'dd/MM/yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className="border-purple-200 shadow-sm animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <CardHeader className="bg-purple-50/50 pb-4 border-b border-purple-100 rounded-t-xl">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
              <Activity className="w-5 h-5 text-purple-600" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>Eventos e atualizações do seu grupo</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
              <Sparkles className="w-12 h-12 text-purple-200 mb-3" />
              <p>Explore as abas do menu para gerenciar seus grupos.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
