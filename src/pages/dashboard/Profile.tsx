import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Profile() {
  const { user } = useAuth()

  if (!user) return null

  const initials = user.name
    ? user.name.substring(0, 2).toUpperCase()
    : user.email.substring(0, 2).toUpperCase()

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-primary">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">Gerencie suas informações pessoais.</p>
      </div>

      <Card className="border-secondary/20 bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-secondary">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-serif">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-serif text-primary">Informações Pessoais</CardTitle>
            <CardDescription>Atualize como você é visto na plataforma.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" defaultValue={user.name || ''} placeholder="Seu nome completo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user.email}
              disabled
              className="bg-muted opacity-50"
            />
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
