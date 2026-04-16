import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function RequestAccess() {
  const [searchQuery, setSearchQuery] = useState('')
  const [requestedIds, setRequestedIds] = useState<number[]>([])

  const allGroups = [
    {
      id: 10,
      name: 'Terreiro de Umbanda Caboclo Sete Flechas',
      location: 'São Paulo, SP',
      desc: 'Sessões de cura e desenvolvimento mediúnico.',
    },
    {
      id: 11,
      name: 'Centro Espírita Fé, Esperança e Caridade',
      location: 'Rio de Janeiro, RJ',
      desc: 'Estudos aprofundados e caridade.',
    },
    {
      id: 12,
      name: 'Tenda de Umbanda Vó Maria',
      location: 'Belo Horizonte, MG',
      desc: 'Atendimentos semanais e giras de preto velho.',
    },
    {
      id: 13,
      name: 'Ilê Axé Orixá Menino',
      location: 'Salvador, BA',
      desc: 'Tradições de raiz e respeito aos ancestrais.',
    },
  ]

  const filteredGroups = allGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRequest = (id: number) => {
    setRequestedIds((prev) => [...prev, id])
    toast.success('Solicitação de acesso enviada com sucesso!', {
      description: 'Aguarde a aprovação do dirigente do grupo.',
    })
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif font-bold text-purple-900">Encontrar Comunidades</h1>
        <p className="text-slate-600">
          Pesquise por terreiros e grupos de estudo para solicitar sua participação.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 w-5 h-5" />
        <Input
          placeholder="Buscar por nome ou cidade..."
          className="pl-10 h-12 text-lg border-purple-200 focus-visible:ring-purple-900 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 mt-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-purple-100">
            Nenhum grupo encontrado com os termos de busca.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="border-purple-200/60 bg-white hover:border-purple-300 transition-colors"
            >
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-serif text-purple-900">{group.name}</CardTitle>
                  <CardDescription className="text-slate-700">{group.desc}</CardDescription>
                  <div className="flex items-center text-sm text-slate-500 pt-1">
                    <MapPin className="w-4 h-4 mr-1 text-yellow-600" />
                    {group.location}
                  </div>
                </div>

                <Button
                  onClick={() => handleRequest(group.id)}
                  disabled={requestedIds.includes(group.id)}
                  className={cn(
                    'w-full sm:w-auto',
                    requestedIds.includes(group.id)
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-purple-100 text-purple-900 hover:bg-purple-200 font-medium border border-purple-200',
                  )}
                  variant={requestedIds.includes(group.id) ? 'outline' : 'default'}
                >
                  {requestedIds.includes(group.id) ? (
                    'Solicitação Pendente'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Solicitar Acesso
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
