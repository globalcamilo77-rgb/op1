'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderOpen,
  Users,
  Store,
  UserCog,
  Settings,
  BarChart3,
  HardDrive,
  MessageCircle,
  Palette,
  TrendingUp,
  Images,
  Cloud,
  QrCode,
  MapPin,
  Wallet,
  Plug,
  Filter,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const adminLinks = [
  { href: '/adminlr', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/adminlr/pedidos', label: 'Pedidos', icon: Package },
  { href: '/adminlr/produtos', label: 'Produtos', icon: ShoppingBag },
  { href: '/adminlr/categorias', label: 'Categorias', icon: FolderOpen },
  { href: '/adminlr/clientes', label: 'Clientes', icon: Users },
  { href: '/adminlr/lojistas', label: 'Lojistas', icon: Store },
  { href: '/adminlr/usuarios', label: 'Usuarios', icon: UserCog },
]

const superAdminLinks = [
  { href: '/adminlr/sistema', label: 'Sistema', icon: Settings },
  { href: '/adminlr/aparencia', label: 'Aparencia', icon: Palette },
  { href: '/adminlr/imagens', label: 'Imagens IA', icon: Images },
  { href: '/adminlr/marketing', label: 'Marketing', icon: TrendingUp },
  { href: '/adminlr/cidades', label: 'Cidades (LPs)', icon: MapPin },
  { href: '/adminlr/funis', label: 'Funis', icon: Filter },
  { href: '/adminlr/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/adminlr/pagamentos', label: 'Pagamentos', icon: Wallet },
  { href: '/adminlr/pix', label: 'PIX', icon: QrCode },
  { href: '/adminlr/sincronizar', label: 'Sincronizar', icon: Cloud },
  { href: '/adminlr/integracoes', label: 'Integracoes', icon: Plug },
  { href: '/adminlr/relatorios', label: 'Relatorios', icon: BarChart3 },
  { href: '/adminlr/backup', label: 'Backup', icon: HardDrive },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'

  const isActive = (href: string) => {
    if (href === '/adminlr') {
      return pathname === '/adminlr'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-[250px] bg-sidebar text-sidebar-foreground p-5 overflow-y-auto flex-shrink-0">
      <Link
        href="/adminlr"
        className="flex items-center gap-3 mb-6 pb-4 border-b border-sidebar-border"
      >
        <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="AlfaConstrução" className="h-8 w-auto object-contain" />
        </div>
        <div className="text-base font-bold leading-tight">
          Alfa<span className="text-[var(--orange-primary)]">Construção</span>
          <div className="text-[10px] font-normal text-sidebar-foreground/50 uppercase tracking-wider mt-0.5">
            Painel administrativo
          </div>
        </div>
      </Link>

      <nav>
        <ul className="flex flex-col gap-3">
          {adminLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors',
                  isActive(link.href)
                    ? 'bg-[var(--orange-primary)] text-white'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {isSuperAdmin && (
          <>
            <div className="mt-6 pt-4 border-t border-sidebar-border">
              <div className="text-xs text-sidebar-foreground/50 uppercase font-bold mb-3">
                SuperAdmin
              </div>
              <ul className="flex flex-col gap-3">
                {superAdminLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors',
                        isActive(link.href)
                          ? 'bg-[var(--orange-primary)] text-white'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <link.icon size={18} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}
