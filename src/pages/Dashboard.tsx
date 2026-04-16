import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Sun } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen flex flex-col relative z-10 animate-fade-in">
      <header className="w-full border-b border-secondary/20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-serif text-xl font-semibold">
            <Sun className="w-6 h-6 text-secondary" />
            <span>Portal Espiritual</span>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4 animate-slide-up">
            Bem-vindo(a), {user.name || user.email.split('@')[0]}!
          </h1>
          <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />

          <div
            className="bg-white/80 backdrop-blur-sm border border-secondary/20 rounded-2xl p-8 shadow-lg mt-12 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <p className="text-lg text-muted-foreground leading-relaxed font-serif italic">
              "Que a luz divina ilumine seus caminhos e traga paz, sabedoria e proteção para a sua
              jornada."
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
