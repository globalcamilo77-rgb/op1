import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  value: string | number
  change?: string
  icon?: LucideIcon
  className?: string
}

function parseTrend(change?: string): 'up' | 'down' | 'neutral' {
  if (!change) return 'neutral'
  if (change.startsWith('+')) return 'up'
  if (change.startsWith('-')) return 'down'
  return 'neutral'
}

export function DashboardCard({ title, value, change, icon: Icon, className }: DashboardCardProps) {
  const trend = parseTrend(change)

  return (
    <div
      className={cn(
        'bg-card p-5 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {title}
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-[var(--orange-primary)]/10 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-[var(--orange-primary)]" />
          </div>
        )}
      </div>

      <div className="text-3xl font-bold text-foreground mb-2">{value}</div>

      {change && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trend === 'up' && 'text-green-600',
            trend === 'down' && 'text-red-500',
            trend === 'neutral' && 'text-muted-foreground'
          )}
        >
          {trend === 'up' && <TrendingUp size={13} />}
          {trend === 'down' && <TrendingDown size={13} />}
          {trend === 'neutral' && <Minus size={13} />}
          <span>{trend === 'neutral' ? change : `${change} este mês`}</span>
        </div>
      )}
    </div>
  )
}
