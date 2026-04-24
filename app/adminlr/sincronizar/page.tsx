'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import {
  AlertTriangle,
  Check,
  Cloud,
  CloudDownload,
  CloudUpload,
  Database,
  Loader2,
  RefreshCw,
  X,
  Zap,
} from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'
import { useProductsStore } from '@/lib/products-store'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { useAppearanceStore } from '@/lib/appearance-store'
import { useAnalyticsStore } from '@/lib/analytics-store'
import { isSupabaseConfigured } from '@/lib/supabase'
import { listProducts, upsertProducts } from '@/lib/supabase-products'
import {
  listWhatsAppContacts,
  upsertWhatsAppContacts,
  fetchWhatsAppSettings,
  upsertWhatsAppSettings,
} from '@/lib/supabase-whatsapp'
import { fetchAppearance, upsertAppearance } from '@/lib/supabase-appearance'
import {
  pushAnalyticsEventsBulk,
  fetchAnalyticsEvents,
  upsertAdSpends,
  fetchAdSpends,
} from '@/lib/supabase-analytics'

type Status = 'idle' | 'loading' | 'ok' | 'error'

interface EntityStatus {
  status: Status
  message?: string
  remoteCount?: number
}

const ENTITY_KEYS = ['products', 'whatsapp', 'appearance', 'analytics', 'spends'] as const
type EntityKey = (typeof ENTITY_KEYS)[number]

const ENTITY_LABELS: Record<EntityKey, string> = {
  products: 'Produtos',
  whatsapp: 'WhatsApp (contatos + mensagem)',
  appearance: 'Aparencia / branding',
  analytics: 'Eventos de analytics',
  spends: 'Investimentos (ad spend)',
}

function formatError(error: unknown): string {
  const err = error as { message?: string; code?: string }
  if (err?.code === 'PGRST205' || /Could not find the table/i.test(err?.message ?? '')) {
    return 'Tabela inexistente. Rode os SQLs em supabase/migrations.'
  }
  if (err?.code === '42501' || /row-level security|permission denied/i.test(err?.message ?? '')) {
    return 'RLS bloqueou. Rode 0002_allow_anon_writes.sql.'
  }
  return err?.message ?? 'Erro desconhecido.'
}

export default function AdminSincronizarPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const products = useProductsStore((state) => state.products)
  const setProducts = (next: typeof products) => useProductsStore.setState({ products: next })

  const whatsapp = useWhatsAppStore(
    useShallow((state) => ({
      contacts: state.contacts,
      defaultMessage: state.defaultMessage,
      rotationIntervalMinutes: state.rotationIntervalMinutes,
    })),
  )

  const appearance = useAppearanceStore(
    useShallow((state) => ({
      brandName: state.brandName,
      brandHighlight: state.brandHighlight,
      brandSuffix: state.brandSuffix,
      logoUrl: state.logoUrl,
      primaryColor: state.primaryColor,
      primaryDarkColor: state.primaryDarkColor,
      notificationBarEnabled: state.notificationBarEnabled,
      notificationBarText: state.notificationBarText,
      featuredEyebrow: state.featuredEyebrow,
      featuredTitle: state.featuredTitle,
      featuredSubtitle: state.featuredSubtitle,
      footerCompany: state.footerCompany,
      footerCopyright: state.footerCopyright,
      footerPhone: state.footerPhone,
      footerWhatsapp: state.footerWhatsapp,
      footerEmail: state.footerEmail,
    })),
  )
  const updateAppearance = useAppearanceStore((state) => state.update)

  const events = useAnalyticsStore((state) => state.events)
  const spends = useAnalyticsStore((state) => state.spends)

  const [statuses, setStatuses] = useState<Record<EntityKey, EntityStatus>>({
    products: { status: 'idle' },
    whatsapp: { status: 'idle' },
    appearance: { status: 'idle' },
    analytics: { status: 'idle' },
    spends: { status: 'idle' },
  })
  const [hydrated, setHydrated] = useState(false)
  const supabaseReady = isSupabaseConfigured()

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  if (user?.role !== 'superadmin' || !hydrated) return null

  const setStatus = (key: EntityKey, patch: Partial<EntityStatus>) => {
    setStatuses((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  const checkRemoteCounts = async () => {
    if (!supabaseReady) return
    const checks: Record<EntityKey, () => Promise<EntityStatus>> = {
      products: async () => {
        try {
          const remote = await listProducts()
          return { status: 'ok', remoteCount: remote.length }
        } catch (error) {
          return { status: 'error', message: formatError(error) }
        }
      },
      whatsapp: async () => {
        try {
          const contacts = await listWhatsAppContacts()
          await fetchWhatsAppSettings()
          return { status: 'ok', remoteCount: contacts.length }
        } catch (error) {
          return { status: 'error', message: formatError(error) }
        }
      },
      appearance: async () => {
        try {
          const remote = await fetchAppearance()
          return { status: 'ok', remoteCount: remote ? 1 : 0 }
        } catch (error) {
          return { status: 'error', message: formatError(error) }
        }
      },
      analytics: async () => {
        try {
          const remote = await fetchAnalyticsEvents()
          return { status: 'ok', remoteCount: remote.length }
        } catch (error) {
          return { status: 'error', message: formatError(error) }
        }
      },
      spends: async () => {
        try {
          const remote = await fetchAdSpends()
          return { status: 'ok', remoteCount: remote.length }
        } catch (error) {
          return { status: 'error', message: formatError(error) }
        }
      },
    }

    for (const key of ENTITY_KEYS) {
      setStatus(key, { status: 'loading', message: 'Verificando...' })
      const result = await checks[key]()
      setStatus(key, result)
    }
  }

  const pushEntity = async (key: EntityKey) => {
    setStatus(key, { status: 'loading', message: 'Enviando...' })
    try {
      switch (key) {
        case 'products':
          await upsertProducts(products)
          setStatus('products', {
            status: 'ok',
            message: `Enviados ${products.length} produtos.`,
            remoteCount: products.length,
          })
          break
        case 'whatsapp':
          await upsertWhatsAppContacts(whatsapp.contacts)
          await upsertWhatsAppSettings({
            defaultMessage: whatsapp.defaultMessage,
            rotationIntervalMinutes: whatsapp.rotationIntervalMinutes,
          })
          setStatus('whatsapp', {
            status: 'ok',
            message: `Enviados ${whatsapp.contacts.length} contatos + configuracao.`,
            remoteCount: whatsapp.contacts.length,
          })
          break
        case 'appearance':
          await upsertAppearance(appearance)
          setStatus('appearance', { status: 'ok', message: 'Aparencia salva no Supabase.', remoteCount: 1 })
          break
        case 'analytics':
          await pushAnalyticsEventsBulk(events)
          setStatus('analytics', {
            status: 'ok',
            message: `Enviados ${events.length} eventos.`,
            remoteCount: events.length,
          })
          break
        case 'spends':
          await upsertAdSpends(spends)
          setStatus('spends', {
            status: 'ok',
            message: `Enviados ${spends.length} registros de investimento.`,
            remoteCount: spends.length,
          })
          break
      }
    } catch (error) {
      console.error(error)
      setStatus(key, { status: 'error', message: formatError(error) })
    }
  }

  const pullEntity = async (key: EntityKey) => {
    setStatus(key, { status: 'loading', message: 'Baixando...' })
    try {
      switch (key) {
        case 'products': {
          const remote = await listProducts()
          setProducts(remote)
          setStatus('products', {
            status: 'ok',
            message: `Baixados ${remote.length} produtos do Supabase.`,
            remoteCount: remote.length,
          })
          break
        }
        case 'whatsapp': {
          const contacts = await listWhatsAppContacts()
          const settings = await fetchWhatsAppSettings()
          useWhatsAppStore.setState({
            contacts,
            ...(settings ?? {}),
          })
          setStatus('whatsapp', {
            status: 'ok',
            message: `Baixados ${contacts.length} contatos${settings ? ' + configuracao' : ''}.`,
            remoteCount: contacts.length,
          })
          break
        }
        case 'appearance': {
          const remote = await fetchAppearance()
          if (remote) {
            updateAppearance(remote)
            setStatus('appearance', {
              status: 'ok',
              message: 'Aparencia restaurada do Supabase.',
              remoteCount: 1,
            })
          } else {
            setStatus('appearance', {
              status: 'ok',
              message: 'Sem aparencia salva no Supabase ainda.',
              remoteCount: 0,
            })
          }
          break
        }
        case 'analytics': {
          const remote = await fetchAnalyticsEvents()
          useAnalyticsStore.setState({ events: remote })
          setStatus('analytics', {
            status: 'ok',
            message: `Baixados ${remote.length} eventos.`,
            remoteCount: remote.length,
          })
          break
        }
        case 'spends': {
          const remote = await fetchAdSpends()
          useAnalyticsStore.setState({ spends: remote })
          setStatus('spends', {
            status: 'ok',
            message: `Baixados ${remote.length} investimentos.`,
            remoteCount: remote.length,
          })
          break
        }
      }
    } catch (error) {
      console.error(error)
      setStatus(key, { status: 'error', message: formatError(error) })
    }
  }

  const pushAll = async () => {
    for (const key of ENTITY_KEYS) {
      // eslint-disable-next-line no-await-in-loop
      await pushEntity(key)
    }
  }

  const pullAll = async () => {
    for (const key of ENTITY_KEYS) {
      // eslint-disable-next-line no-await-in-loop
      await pullEntity(key)
    }
  }

  const localCounts: Record<EntityKey, number> = {
    products: products.length,
    whatsapp: whatsapp.contacts.length,
    appearance: 1,
    analytics: events.length,
    spends: spends.length,
  }

  return (
    <>
      <AdminTopbar title="Sincronizar com Supabase" />
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            supabaseReady ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <Cloud size={20} className={supabaseReady ? 'text-green-700' : 'text-yellow-700'} />
          <div className="flex-1">
            <p
              className={`text-sm font-semibold ${
                supabaseReady ? 'text-green-800' : 'text-yellow-800'
              }`}
            >
              {supabaseReady ? 'Supabase conectado' : 'Supabase nao configurado'}
            </p>
            <p
              className={`text-xs ${supabaseReady ? 'text-green-700' : 'text-yellow-700'}`}
            >
              {supabaseReady
                ? 'Use os botoes abaixo para subir tudo ou baixar de volta. Eventos de analytics e pedidos novos sao enviados automaticamente.'
                : 'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.'}
            </p>
          </div>
        </div>

        {supabaseReady && (
          <div className="bg-card p-5 rounded-lg shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-base font-semibold inline-flex items-center gap-2">
                  <Database size={16} /> Acoes globais
                </h2>
                <p className="text-xs text-muted-foreground">
                  Suba ou baixe TODOS os dados do projeto de uma so vez.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={checkRemoteCounts}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded border border-border hover:bg-secondary"
                >
                  <RefreshCw size={14} /> Checar status
                </button>
                <button
                  onClick={pullAll}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded bg-secondary text-secondary-foreground hover:bg-muted"
                >
                  <CloudDownload size={14} /> Baixar tudo
                </button>
                <button
                  onClick={pushAll}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded bg-[var(--orange-primary)] text-white font-semibold hover:bg-[var(--orange-dark)]"
                >
                  <CloudUpload size={14} /> Subir tudo
                </button>
              </div>
            </div>
          </div>
        )}

        {supabaseReady && (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-xs text-muted-foreground">
                  <th className="text-left py-3 px-4">Entidade</th>
                  <th className="text-right py-3 px-2">Local</th>
                  <th className="text-right py-3 px-2">Remoto</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {ENTITY_KEYS.map((key) => {
                  const s = statuses[key]
                  return (
                    <tr key={key} className="border-t border-border align-top">
                      <td className="py-3 px-4 font-medium">{ENTITY_LABELS[key]}</td>
                      <td className="py-3 px-2 text-right tabular-nums">{localCounts[key]}</td>
                      <td className="py-3 px-2 text-right tabular-nums">
                        {s.remoteCount === undefined ? '-' : s.remoteCount}
                      </td>
                      <td className="py-3 px-4">
                        {s.status === 'idle' && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-gray-400" /> Aguardando
                          </span>
                        )}
                        {s.status === 'loading' && (
                          <span className="inline-flex items-center gap-1 text-blue-700">
                            <Loader2 size={12} className="animate-spin" /> {s.message}
                          </span>
                        )}
                        {s.status === 'ok' && (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <Check size={12} /> {s.message}
                          </span>
                        )}
                        {s.status === 'error' && (
                          <span className="inline-flex items-center gap-1 text-red-700">
                            <X size={12} /> {s.message}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex gap-2 justify-end">
                          <button
                            onClick={() => pullEntity(key)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded border border-border hover:bg-secondary"
                          >
                            <CloudDownload size={12} /> Baixar
                          </button>
                          <button
                            onClick={() => pushEntity(key)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded bg-[var(--orange-primary)] text-white hover:bg-[var(--orange-dark)]"
                          >
                            <CloudUpload size={12} /> Subir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-[#fff7e6] border border-[#ffc107] p-4 rounded-lg flex gap-3">
          <AlertTriangle className="text-yellow-700 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-yellow-900">Pre-requisito (so na primeira vez)</p>
            <p className="text-yellow-900 mt-1">
              Abra{' '}
              <a
                href="https://supabase.com/dashboard/project/_/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Supabase &gt; SQL Editor
              </a>
              , cole o conteudo do arquivo abaixo e clique em{' '}
              <strong>RUN</strong>. E idempotente (pode rodar quantas vezes quiser).
            </p>
            <div className="mt-2 bg-yellow-100 rounded px-3 py-2 font-mono text-xs text-yellow-900">
              supabase/setup-completo.sql
            </div>
            <p className="text-yellow-900 mt-2 text-xs">
              Cria todas as tabelas (products, whatsapp, orders, analytics_events, ad_spends,
              appearance_settings, service_areas), habilita RLS e ja libera escrita anon para o
              admin local.
            </p>
          </div>
        </div>

        <div className="bg-card p-5 rounded-lg shadow-sm">
          <h3 className="text-base font-semibold inline-flex items-center gap-2">
            <Zap size={16} /> Auto-sync ativo
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Check size={14} className="text-green-700 mt-0.5" />
              Cada evento de analytics (page_view, add_to_cart, lead, purchase) eh enviado em tempo real.
            </li>
            <li className="flex gap-2">
              <Check size={14} className="text-green-700 mt-0.5" />
              Pedidos confirmados no checkout sao gravados em <strong>orders</strong> +
              <strong> order_items</strong> automaticamente.
            </li>
            <li className="flex gap-2">
              <Check size={14} className="text-green-700 mt-0.5" />
              Produtos, WhatsApp, aparencia e investimentos sao manuais (use os botoes acima).
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
