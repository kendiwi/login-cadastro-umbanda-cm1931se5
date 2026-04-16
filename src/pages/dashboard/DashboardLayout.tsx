import { useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { Users, PlusCircle, Bell, User, LogOut, Sun } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'

export default function DashboardLayout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r-secondary/20">
        <SidebarHeader className="py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-2 font-serif text-xl font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <Sun className="w-6 h-6 text-secondary" />
            <span>Portal Espiritual</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-2 space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard/grupos'}
                className="hover:text-primary hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <Link to="/dashboard/grupos">
                  <Users className="w-4 h-4" />
                  <span>Meus Grupos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard/criar-grupo'}
                className="hover:text-primary hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <Link to="/dashboard/criar-grupo">
                  <PlusCircle className="w-4 h-4" />
                  <span>Criar Novo Grupo</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard/solicitacoes'}
                className="hover:text-primary hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <Link to="/dashboard/solicitacoes">
                  <Bell className="w-4 h-4" />
                  <span>Solicitações de Acesso</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard/perfil'}
                className="hover:text-primary hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
              >
                <Link to="/dashboard/perfil">
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-transparent flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-secondary/20 bg-white/50 backdrop-blur-md sticky top-0 z-50 px-4">
          <SidebarTrigger className="-ml-1 text-primary hover:text-primary hover:bg-primary/10" />
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
