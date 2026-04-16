import { useAuth } from '@/hooks/use-auth'

export default function DashboardHome() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up text-center mt-12">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">
        Bem-vindo, {user.name || user.email.split('@')[0]}!
      </h1>
      <p className="text-lg text-muted-foreground">Selecione uma opção no menu para começar.</p>
      <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
      <div className="bg-white/80 backdrop-blur-sm border border-secondary/20 rounded-2xl p-8 shadow-lg mt-12 inline-block max-w-xl">
        <p className="text-lg text-muted-foreground leading-relaxed font-serif italic text-center">
          "Que a luz divina ilumine seus caminhos e traga paz, sabedoria e proteção para a sua
          jornada."
        </p>
      </div>
    </div>
  )
}
