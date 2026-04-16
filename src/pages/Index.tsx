import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function Index() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative z-10">
      <Card className="w-full max-w-[450px] shadow-2xl border-secondary/30 bg-white/95 backdrop-blur-sm animate-slide-up rounded-2xl overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-secondary">
            <Sparkles className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-serif text-primary">Presença da Umbanda</CardTitle>
          <CardDescription className="text-base">
            Entre na sua conta ou cadastre-se para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger
                value="login"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                Cadastro
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-0 outline-none">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register" className="mt-0 outline-none">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
   