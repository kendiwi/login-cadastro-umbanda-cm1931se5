import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative selection:bg-secondary/30 selection:text-primary">
      {/* Decorative background elements providing the Umbanda inspired ambient glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* Subtle texture overlay */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />

      <main className="flex flex-col flex-1 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
