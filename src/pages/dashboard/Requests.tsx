import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, UserPlus } from 'lucide-react'

export default function Requests() {
  const mockedRequests = [
    { id: 1, name: 'João Silva', group: 'Grupo Luz Divina', date: 'Hoje' },
    { id: 2, name: 'Maria Souza', group: 'Grupo Espíritos da Floresta', date: 'Ontem' },
  ]

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-primary">Solicitações de Acesso</h1>
        <p className="text-muted-foreground mt-2">Gerencie quem deseja entrar nos seus grupos.</p>
      </div>

      <div className="space-y-4">
        {mockedRequests.map((req) => (
          <Card key={req.id} className="border-secondary/20 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 sm:items-center">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2 text-primary font-serif">
                  <UserPlus className="w-5 h-5 text-secondary" />
                  {req.name}
                </CardTitle>
                <CardDescription>
                  Deseja entrar em: <span className="font-medium text-foreground">{req.group}</span>
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground pt-1 sm:pt-0">{req.date}</div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <X className="w-4 h-4 mr-1" />
                  Recusar
                </Button>
                <Button
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Aprovar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
