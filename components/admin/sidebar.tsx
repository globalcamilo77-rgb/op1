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
  Headphones,
  Palette,
  TrendingUp,
  Images,
  QrCode,
  Wallet,
  Filter,
  Trophy,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
  icon: LucideIcon
  superAdmin?: boolean
}

interface NavGroup {
  label: string
  items: NavLink[]
  superAdmin?: boolean
}

// Grupos visiveis para todos os admins
const baseGroups: NavGroup[] = [
  {
    label: 'Operacao',
    items: [
      { href: '/adminlr', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/adminlr/pedidos', label: 'Pedidos', icon: Package },
      { href: '/adminlr/clientes', label: 'Clientes', icon: Users },
      { href: '/adminlr/ranking', label: 'Ranking', icon: Trophy },
    ],
  },
  {
    label: 'Catalogo',
    items: [
      { href: '/adminlr/produtos', label: 'Produtos', icon: ShoppingBag },
      { href: '/adminlr/categorias', label: 'Categorias', icon: FolderOpen },
    ],
  },
]

// Grupos exclusivos do superadmin
const superAdminGroups: NavGroup[] = [
  {
    label: 'Atendimento',
    items: [
      { href: '/adminlr/atendimento', label: 'Cidades, WhatsApp & IPs', icon: Headphones },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/adminlr/marketing', label: 'Marketing', icon: TrendingUp },
      { href: '/adminlr/funis', label: 'Funis', icon: Filter },
      { href: '/adminlr/imagens', label: 'Imagens IA', icon: Images },
      { href: '/adminlr/aparencia', label: 'Aparencia', icon: Palette },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/adminlr/pix', label: 'PIX', icon: QrCode },
      { href: '/adminlr/pagamentos', label: 'Pagamentos', icon: Wallet },
    ],
  },
  {
    label: 'Administrativo',
    items: [
      { href: '/adminlr/sistema', label: 'Sistema', icon: Settings },
      { href: '/adminlr/lojistas', label: 'Lojistas', icon: Store },
      { href: '/adminlr/usuarios', label: 'Usuarios', icon: UserCog },
      { href: '/adminlr/seguranca', label: 'Seguranca', icon: Shield },
      { href: '/adminlr/relatorios', label: 'Relatorios', icon: BarChart3 },
      { href: '/adminlr/backup', label: 'Backup', icon: HardDrive },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'

  const isActive = (href: string) => {
    if (href === '/adminlr') {
      return pathname === '/adminlr'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const renderItem = (link: NavLink) => (
    <li key={link.href}>
      <Link
        href={link.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors',
          isActive(link.href)
            ? 'bg-[var(--orange-primary)] text-white'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        )}
      >
        <link.icon size={18} />
        <span className="truncate">{link.label}</span>
      </Link>
    </li>
  )

  const renderGroup = (group: NavGroup, isFirst: boolean) => (
    <div key={group.label} className={cn(!isFirst && 'mt-6 pt-4 border-t border-sidebar-border')}>
      <div className="text-[10px] text-sidebar-foreground/50 uppercase font-bold tracking-wider mb-3">
        {group.label}
      </div>
      <ul className="flex flex-col gap-1.5">{group.items.map(renderItem)}</ul>
    </div>
  )

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
        {baseGroups.map((group, idx) => renderGroup(group, idx === 0))}
        {isSuperAdmin && superAdminGroups.map((group) => renderGroup(group, false))}
      </nav>
    </aside>
  )
}
