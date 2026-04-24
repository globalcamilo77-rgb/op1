'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useShallow } from 'zustand/react/shallow'
import {
  AlertTriangle,
  Check,
  CreditCard,
  FileText,
  Info,
  QrCode,
  RotateCcw,
  Save,
  Wallet,
} from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'
import {
  DEFAULT_PAYMENT_METHODS,
  PaymentMethodId,
  PaymentMethodsSettings,
  usePaymentMethodsStore,
} from '@/lib/payment-methods-store'
import { usePixStore } from '@/lib/pix-store'

const inputClass =
  'px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground w-full'

const METHOD_META: Record<
  PaymentMethodId,
  { icon: React.ReactNode; defaultTitle: string; hint: string }
> = {
  pix: {
    icon: <QrCode size={18} />,
    defaultTitle: 'PIX',
    hint: 'Aprovacao imediata. Configure a chave/gateway em SuperAdmin > PIX.',
  },
  credit: {
    icon: <CreditCard size={18} />,
    defaultTitle: 'Cartao de credito',
    hint: 'Pagamento parcelado. Hoje o checkout captura os dados, mas nao processa transacao automaticamente.',
  },
  boleto: {
    icon: <FileText size={18} />,
    defaultTitle: 'Boleto',
    hint: 'Aprovacao em 1 dia util. Boleto manual - envio via e-mail apos confirmacao.',
  },
}

export default function AdminPagamentosPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const settings = usePaymentMethodsStore(
    useShallow((state) => ({
      pix: state.pix,
      credit: state.credit,
      boleto: state.boleto,
      defaultMethod: state.defaultMethod,
    })),
  )
  const update = usePaymentMethodsStore((state) => state.update)
  const reset = usePaymentMethodsStore((state) => state.reset)

  const pixEnabledInStore = usePixStore((state) => state.enabled)
  const pixShowOnCheckout = usePixStore((state) => state.showOnCheckout)

  const [hydrated, setHydrated] = useState(false)
  const [draft, setDraft] = useState<PaymentMethodsSettings>(settings)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    setDraft(settings)
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user && user.role !== 'superadmin') router.push('/adminlr')
  }, [user, router])

  const enabledCount = useMemo(
    () => (['pix', 'credit', 'boleto'] as PaymentMethodId[]).filter((m) => draft[m].enabled).length,
    [draft],
  )

  if (user?.role !== 'superadmin') return null
  if (!hydrated) return null

  const handleSave = () => {
    if (enabledCount === 0) {
      window.alert('Voce precisa deixar pelo menos uma forma de pagamento ativa.')
      return
    }
    let patched = { ...draft }
    if (!patched[patched.defaultMethod].enabled) {
      const fallback = (['pix', 'credit', 'boleto'] as PaymentMethodId[]).find(
        (m) => patched[m].enabled,
      )!
      patched = { ...patched, defaultMethod: fallback }
    }
    update(patched)
    setDraft(patched)
    setSavedAt(Date.now())
    window.setTimeout(() => setSavedAt(null), 2500)
  }

  const handleReset = () => {
    if (!window.confirm('Restaurar configuracao padrao?')) return
    reset()
    setDraft(DEFAULT_PAYMENT_METHODS)
  }

  const toggleMethod = (method: PaymentMethodId, enabled: boolean) => {
    setDraft((prev) => ({ ...prev, [method]: { ...prev[method], enabled } }))
  }

  const setLabel = (method: PaymentMethodId, label: string) => {
    setDraft((prev) => ({ ...prev, [method]: { ...prev[method], label } }))
  }

  const setSubtitle = (method: PaymentMethodId, subtitle: string) => {
    setDraft((prev) => ({ ...prev, [method]: { ...prev[method], subtitle } }))
  }

  const pixBlockedByPixStore = draft.pix.enabled && (!pixEnabledInStore || !pixShowOnCheckout)

  return (
    <>
      <AdminTopbar title="Formas de pagamento" />
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="bg-[#fff7e6] border border-[#ffc107] p-4 rounded-lg flex items-start gap-3">
          <Wallet className="text-[var(--orange-primary)] mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              Escolha o que aparece no checkout
            </p>
            <p className="text-muted-foreground mt-1">
              Ative, renomeie ou esconda cada metodo. O checkout mostra apenas os ativos e ja
              seleciona o metodo padrao quando o cliente abre a pagina.
            </p>
          </div>
        </div>

        {enabledCount === 0 && (
          <div className="bg-red-50 border border-red-300 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-red-700 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-red-800">
                Nenhum metodo ativo. O checkout vai ficar quebrado.
              </p>
              <p className="text-red-700 mt-1">
                Ative pelo menos um antes de salvar.
              </p>
            </div>
          </div>
        )}

        {pixBlockedByPixStore && (
          <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-yellow-700 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900">
                PIX ativado aqui, mas desabilitado nas configuracoes detalhadas.
              </p>
              <p className="text-yellow-900 mt-1">
                Vai em{' '}
                <Link href="/adminlr/pix" className="underline font-semibold">
                  SuperAdmin &gt; PIX
                </Link>{' '}
                e confirme que &quot;Ativo&quot; e &quot;Mostrar no checkout&quot; estao ligados.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {(['pix', 'credit', 'boleto'] as PaymentMethodId[]).map((method) => {
            const config = draft[method]
            const meta = METHOD_META[method]
            return (
              <div
                key={method}
                className={`bg-card rounded-lg shadow-sm border-2 transition-colors ${
                  config.enabled ? 'border-[var(--orange-primary)]/40' : 'border-border'
                }`}
              >
                <div className="p-5 flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      config.enabled
                        ? 'bg-[var(--orange-primary)]/10 text-[var(--orange-primary)]'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="text-base font-semibold flex items-center gap-2">
                          {meta.defaultTitle}
                          {draft.defaultMethod === method && config.enabled && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--orange-primary)] text-white">
                              Padrao
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Info size={12} />
                          {meta.hint}
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="text-sm font-medium">
                          {config.enabled ? 'Ativo' : 'Inativo'}
                        </span>
                        <span
                          className={`relative inline-block w-11 h-6 rounded-full transition-colors ${
                            config.enabled ? 'bg-[var(--orange-primary)]' : 'bg-muted'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(event) => toggleMethod(method, event.target.checked)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              config.enabled ? 'translate-x-5' : ''
                            }`}
                          />
                        </span>
                      </label>
                    </div>

                    {config.enabled && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Titulo (mostrado ao cliente)
                          </label>
                          <input
                            className={inputClass}
                            value={config.label}
                            onChange={(event) => setLabel(method, event.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Subtitulo (chamariz curto)
                          </label>
                          <input
                            className={inputClass}
                            value={config.subtitle}
                            onChange={(event) => setSubtitle(method, event.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name="defaultMethod"
                              checked={draft.defaultMethod === method}
                              onChange={() =>
                                setDraft((prev) => ({ ...prev, defaultMethod: method }))
                              }
                            />
                            Usar como padrao no checkout
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-card p-5 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Preview do checkout
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['pix', 'credit', 'boleto'] as PaymentMethodId[])
              .filter((m) => draft[m].enabled)
              .map((method) => {
                const config = draft[method]
                const meta = METHOD_META[method]
                return (
                  <div
                    key={method}
                    className={`rounded-md border px-4 py-3 text-sm text-left ${
                      draft.defaultMethod === method
                        ? 'border-[var(--orange-primary)] bg-[var(--orange-primary)]/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {meta.icon}
                      {config.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {config.subtitle}
                    </div>
                  </div>
                )
              })}
            {enabledCount === 0 && (
              <p className="text-sm text-muted-foreground italic md:col-span-3">
                Nenhum metodo ativo - preview vazio.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
          <button
            onClick={handleSave}
            disabled={enabledCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded text-sm font-semibold"
          >
            <Save size={16} />
            Salvar alteracoes
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded text-sm font-medium hover:bg-secondary"
          >
            <RotateCcw size={16} />
            Restaurar padrao
          </button>
          {savedAt && (
            <span className="text-sm text-green-700 font-medium inline-flex items-center gap-1">
              <Check size={14} /> Salvo
            </span>
          )}
        </div>
      </div>
    </>
  )
}
