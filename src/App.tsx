import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import Index from './pages/Index'
import DashboardLayout from './pages/dashboard/DashboardLayout'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="h-[100dvh] w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}
import DashboardHome from './pages/dashboard/Home'
import Groups from './pages/dashboard/Groups'
import GroupDetails from './pages/dashboard/GroupDetails'
import RequestAccess from './pages/dashboard/RequestAccess'
import Requests from './pages/dashboard/Requests'
import Profile from './pages/dashboard/Profile'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="grupos" element={<Groups />} />
              <Route path="grupos/:id" element={<GroupDetails />} />
              <Route path="solicitar-acesso" element={<RequestAccess />} />
              <Route path="solicitacoes" element={<Requests />} />
              <Route path="perfil" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
