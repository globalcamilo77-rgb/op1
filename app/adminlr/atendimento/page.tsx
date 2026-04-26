'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { MapPin, MessageCircle, Shield, ShieldCheck, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IpBlocksPanel } from '@/components/admin/ip-blocks-panel'
import { IpAllowlistPanel } from '@/components/admin/ip-allowlist-panel'

type Tab = 'cidades' | 'whatsapp' | 'bloqueios' | 'protegidos'

export default function AtendimentoPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('cidades')

  useEffect(() => {
    if (user && user.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  if (!user || user.role !== 'superadmin') {
    return null
  }

  const tabs: { id: Tab; label: string; icon: typeof MapPin; description: string }[] = [
    {
      id: 'cidades',
      label: 'Cidades & LPs',
      icon: MapPin,
      description: 'Páginas regionais com hero e contatos próprios',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Globais',
      icon: MessageCircle,
      description: 'Contatos rotativos exibidos quando o cliente não está em uma LP de cidade',
    },
    {
      id: 'bloqueios',
      label: 'IPs Bloqueados',
      icon: Shield,
      description: 'IPs barrados após PIX confirmado (timer 1h) ou bloqueados manualmente',
    },
    {
      id: 'protegidos',
      label: 'IPs Protegidos',
      icon: ShieldCheck,
      description: 'Camuflagem: IPs imunes a qualquer bloqueio (operador, loja física, suporte)',
    },
  ]

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Atendimento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tudo que envolve o contato com o cliente: cidades atendidas, números de WhatsApp e bloqueios de IP.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                active
                  ? 'border-[var(--orange-primary)] text-[var(--orange-primary)]'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon size={16} />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="text-xs text-muted-foreground -mt-2">
        {tabs.find((t) => t.id === tab)?.description}
      </div>

      {tab === 'cidades' && <CidadesShortcut />}
      {tab === 'whatsapp' && <WhatsAppShortcut />}
      {tab === 'bloqueios' && <IpBlocksPanel />}
      {tab === 'protegidos' && <IpAllowlistPanel />}
    </div>
  )
}

function CidadesShortcut() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-orange-100 dark:bg-orange-950 p-2">
          <MapPin className="text-[var(--orange-primary)]" size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Cidades e Landing Pages regionais</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-prose">
            Cada cidade ativa gera uma página pública em <code className="px-1 py-0.5 bg-muted rounded text-xs">/cidade/[slug]</code> com a mesma estrutura visual da loja, mas hero, copy e contatos focados naquela cidade ou estado.
          </p>
        </div>
      </div>
      <Link
        href="/adminlr/cidades"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--orange-primary)] hover:underline"
      >
        Abrir gerenciador completo de cidades <ArrowRight size={14} />
      </Link>
    </div>
  )
}

function WhatsAppShortcut() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-emerald-100 dark:bg-emerald-950 p-2">
          <MessageCircle className="text-emerald-600 dark:text-emerald-400" size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">WhatsApp globais</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-prose">
            Números exibidos no botão flutuante e no rodapé quando o cliente <strong>não</strong> está numa página de cidade. Use rotação por cliques para distribuir conversas entre vários atendentes.
          </p>
        </div>
      </div>
      <Link
        href="/adminlr/whatsapp"
        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        Abrir gerenciador completo de WhatsApp <ArrowRight size={14} />
      </Link>
    </div>
  )
}
