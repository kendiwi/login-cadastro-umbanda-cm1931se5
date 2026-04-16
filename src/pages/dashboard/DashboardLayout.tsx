import { useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { Users, Search, Bell, User, LogOut, Sun } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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

  const getMenuButtonClass = (isActive: boolean) =>
    cn(
      'text-slate-600 hover:text-purple-900 hover:bg-purple-50 transition-colors',
      isActive && 'bg-purple-100 text-purple-900 font-medium',
    )

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r-purple-200">
        <SidebarHeader className="py-6 border-b border-purple-100">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-2 font-serif text-2xl font-bold text-purple-900 hover:opacity-80 transition-opacity"
          >
            <Sun className="w-8 h-8 text-yellow-500" />
            <span>Axé Portal</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="pt-4">
          <SidebarMenu className="px-3 space-y-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard/grupos'}
                className={getMenuButtonClass(location.pathname === '/dashboard/grupos')}
              >
                <Link to="/dashboard/grupos">
                  <Users className="w-5 h-5" />
                  <span className="text-base">Meus Grupos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard/solicitar-acesso'}
                className={getMenuButtonClass(location.pathname === '/dashboard/solicitar-acesso')}
              >
                <Link to="/dashboard/solicitar-acesso">
                  <Search className="w-5 h-5" />
                  <span className="text-base">Solicitar Acesso</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard/solicitacoes'}
                className={getMenuButtonClass(location.pathname === '/dashboard/solicitacoes')}
              >
                <Link to="/dashboard/solicitacoes">
                  <Bell className="w-5 h-5" />
                  <span className="text-base">Solicitações de Acesso</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/dashboard/perfil'}
                className={getMenuButtonClass(location.pathname === '/dashboard/perfil')}
              >
                <Link to="/dashboard/perfil">
                  <User className="w-5 h-5" />
                  <span className="text-base">Perfil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-purple-100">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-base">Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-slate-50 flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-purple-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4">
          <SidebarTrigger className="-ml-1 text-purple-900 hover:text-purple-700 hover:bg-purple-100" />
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
