import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function Groups() {
  const mockedGroups = [
    { id: 1, name: 'Grupo Luz Divina', members: 42, role: 'Membro' },
    { id: 2, name: 'Grupo Espíritos da Floresta', members: 15, role: 'Administrador' },
  ]

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-primary">Meus Grupos</h1>
        <p className="text-muted-foreground mt-2">Gerencie os grupos dos quais você participa.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mockedGroups.map((group) => (
          <Card
            key={group.id}
            className="border-secondary/20 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-primary font-serif">
                <Users className="w-5 h-5 text-secondary" />
                {group.name}
              </CardTitle>
              <CardDescription>Papel: {group.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{group.members} membros ativos</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
