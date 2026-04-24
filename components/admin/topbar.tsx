'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Crown, Bell } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

interface TopbarProps {
  title: string
}

export function AdminTopbar({ title }: TopbarProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="bg-background border-b border-border px-6 py-4 flex justify-between items-center gap-4">
      <h1 className="text-lg font-bold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <button
          className="relative w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          title="Notificações"
        >
          <Bell size={16} className="text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--orange-primary)] rounded-full" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[var(--orange-primary)] text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {isSuperAdmin && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <Crown size={9} className="text-amber-900" />
              </div>
            )}
          </div>

          <div className="text-sm hidden sm:block">
            <div className="text-foreground font-medium leading-tight">{user?.name || 'Usuário'}</div>
            <div className="text-muted-foreground text-xs leading-tight flex items-center gap-1">
              {isSuperAdmin ? (
                <>
                  <Crown size={10} className="text-amber-500" />
                  <span className="text-amber-600 font-medium">SuperAdmin</span>
                </>
              ) : (
                'Administrador'
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </div>
  )
}
