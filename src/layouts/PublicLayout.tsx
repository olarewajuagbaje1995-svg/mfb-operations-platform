import { Link, Outlet } from 'react-router-dom'
import { useState } from 'react'

export function PublicLayout() {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number; targetId: string }[]>([])

  // Water splash / ripple effect handler on click or hover
  function createRipple(e: React.MouseEvent<HTMLElement>) {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples((prev) => [...prev, { x, y, id, targetId: target.dataset.rippleKey || 'btn' }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 600)
  }

  // Exact mapping matching your App.tsx route table
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Loan Products', path: '/products' },
    { label: 'Apply Now', path: '/apply' },
    { label: 'Track Application', path: '/track' },
    { label: 'Complaints', path: '/complaints' },
  ]

  return (
    <div className="min-h-screen bg-[#F9FBFA] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Banner Disclaimer */}
      <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-center text-[11px] font-medium border-b border-emerald-800 tracking-wide">
        🏛️ Merit Microfinance Bank Nigeria (MFBn) • Secure Digital Operations Portal
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Bank Name */}
          <Link 
            to="/" 
            onClick={createRipple}
            onMouseEnter={createRipple}
            data-ripple-key="logo"
            className="flex items-center gap-3 group relative overflow-hidden py-2 px-3 rounded-2xl hover:bg-emerald-50/50 transition-colors shrink-0"
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform shrink-0">
              M
            </div>
            <div>
              <span className="font-extrabold text-navy-900 text-lg tracking-tight block leading-none">Merit MFBn</span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-1 block">Microfinance Bank</span>
            </div>
            
            {/* Ripple Effect Container for Logo */}
            {ripples.filter(r => r.targetId === 'logo').map(r => (
              <span
                key={r.id}
                className="absolute rounded-full bg-emerald-400/30 pointer-events-none animate-ping"
                style={{
                  left: r.x,
                  top: r.y,
                  width: '60px',
                  height: '60px',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </Link>

          {/* Public Nav Tabs with Water-Splash Ripple Effect */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm font-bold text-slate-700">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={createRipple}
                onMouseEnter={createRipple}
                data-ripple-key={item.label}
                className="relative px-3.5 py-2.5 rounded-2xl hover:bg-emerald-50 hover:text-emerald-800 transition-all duration-200 overflow-hidden group active:scale-95 whitespace-nowrap"
              >
                <span className="relative z-10">{item.label}</span>
                
                {/* Water splash circle ripple animation element */}
                {ripples.filter(r => r.targetId === item.label).map(r => (
                  <span
                    key={r.id}
                    className="absolute rounded-full bg-emerald-500/30 pointer-events-none animate-ping"
                    style={{
                      left: r.x,
                      top: r.y,
                      width: '80px',
                      height: '80px',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </Link>
            ))}
          </nav>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy-950 text-white border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs text-slate-400">© 2026 Merit Microfinance Bank Nigeria. All rights reserved.</p>
        <p className="text-[11px] text-slate-500 max-w-xl mx-auto leading-relaxed">
          Operational control demonstration platform. Built with React, Supabase, and automated n8n workflows.
        </p>
      </footer>
    </div>
  )
}