import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function CreateGroup() {
  return (
    <div className="space-y-6 animate-slide-up max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-primary">Criar Novo Grupo</h1>
        <p className="text-muted-foreground mt-2">
          Inicie uma nova jornada espiritual com sua comunidade.
        </p>
      </div>

      <Card className="border-secondary/20 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-serif text-primary">Detalhes do Grupo</CardTitle>
          <CardDescription>
            Preencha as informações básicas para criar um novo terreiro ou grupo de estudos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo</Label>
            <Input id="name" placeholder="Ex: Terreiro Pai Joaquim" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o propósito deste grupo..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Criar Grupo
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
