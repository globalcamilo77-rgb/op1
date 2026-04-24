'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import {
  AlertTriangle,
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  Pencil,
  Plug,
  QrCode,
  RotateCcw,
  Save,
  Send,
  Trash2,
  Wallet,
  XCircle,
  Zap,
} from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'
import {
  DEFAULT_PIX,
  ManualPixCharge,
  PixKeyType,
  PixSettings,
  usePixStore,
} from '@/lib/pix-store'
import { generatePixPayload, generateTxid } from '@/lib/pix-payload'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import {
  createGatewayPix,
  fetchGatewayConfig,
  GatewayChargeNormalized,
} from '@/lib/pix-gateway'

type Tab = 'config' | 'cobrancas' | 'nova'

const inputClass =
  'px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground'

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso?: string) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const STATUS_LABEL: Record<ManualPixCharge['status'], { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  paid: { label: 'Pago', className: 'bg-green-100 text-green-800 border-green-200' },
  expired: { label: 'Expirado', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700 border-red-200' },
}

export default function AdminPixPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const pix = usePixStore()
  const whatsappContact = useWhatsAppStore((state) => state.getContactForCurrentWindow())

  const [tab, setTab] = useState<Tab>('config')
  const [draft, setDraft] = useState<PixSettings>(() => extractSettings(pix))
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [previewQr, setPreviewQr] = useState<string>('')
  const [showGatewayKey, setShowGatewayKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<
    | { ok: true; charge: GatewayChargeNormalized }
    | { ok: false; error: string; raw?: unknown }
    | null
  >(null)

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  useEffect(() => {
    setDraft(extractSettings(pix))
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchGatewayConfig().then((cfg) => {
      pix.update({
        gatewayHasServerKey: cfg.hasServerKey,
      })
      setDraft((prev) => ({
        ...prev,
        gatewayHasServerKey: cfg.hasServerKey,
      }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const previewPayload = useMemo(() => {
    if (!draft.pixKey && !draft.staticPayload) return ''
    if (draft.staticPayload.trim()) return draft.staticPayload.trim()
    return generatePixPayload({
      pixKey: draft.pixKey,
      beneficiaryName: draft.beneficiaryName,
      beneficiaryCity: draft.beneficiaryCity,
      amount: 0,
      txid: 'DEMO',
      description: 'Preview',
    })
  }, [
    draft.pixKey,
    draft.beneficiaryName,
    draft.beneficiaryCity,
    draft.staticPayload,
  ])

  useEffect(() => {
    if (!previewPayload) {
      setPreviewQr('')
      return
    }
    let cancelled = false
    QRCode.toDataURL(previewPayload, { margin: 1, width: 280 })
      .then((url) => {
        if (!cancelled) setPreviewQr(url)
      })
      .catch(() => {
        if (!cancelled) setPreviewQr('')
      })
    return () => {
      cancelled = true
    }
  }, [previewPayload])

  if (user?.role !== 'superadmin' || !hydrated) {
    return null
  }

  const setField = <K extends keyof PixSettings>(key: K, value: PixSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    pix.update(draft)
    setSavedAt(Date.now())
    window.setTimeout(() => setSavedAt(null), 2000)
  }

  const handleResetDefaults = () => {
    if (!window.confirm('Restaurar todas as configuracoes padrao de PIX?')) return
    pix.reset()
    setDraft(DEFAULT_PIX)
  }

  const handleTestGateway = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await createGatewayPix({
      amountCents: 100,
      description: 'Teste de integracao AlfaConstrução',
      externalReference: `test-${Date.now()}`,
      client: { name: 'Teste Integracao', email: 'teste@alfaconstrucao.com.br' },
    })
    if (result.ok) {
      setTestResult({ ok: true, charge: result.data })
    } else {
      setTestResult({ ok: false, error: result.error, raw: result.raw })
    }
    setTesting(false)
  }

  return (
    <>
      <AdminTopbar title="PIX - configuracao e cobrancas" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-border mb-6">
          {[
            { id: 'config' as Tab, label: 'Configuracao', icon: Wallet },
            { id: 'cobrancas' as Tab, label: `Cobrancas (${pix.charges.length})`, icon: Banknote },
            { id: 'nova' as Tab, label: 'Nova cobranca manual', icon: QrCode },
          ].map((t) => {
            const active = tab === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-[var(--orange-primary)] text-[var(--orange-primary)]'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>

        {tab === 'config' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
              <div className="bg-[#fff7e6] border border-[#ffc107] p-4 rounded flex items-start gap-3">
                <QrCode className="text-[var(--orange-primary)] mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-foreground">PIX no checkout</p>
                  <p className="text-sm text-muted-foreground">
                    Configure aqui a chave PIX usada no checkout e nas cobrancas manuais. O QR Code
                    e o "copia e cola" sao gerados automaticamente no padrao oficial do Banco Central.
                  </p>
                </div>
              </div>

              <section>
                <h2 className="text-base font-semibold text-foreground mb-3">Status e desconto</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="PIX ativo" hint="Liga/desliga PIX em todo o site">
                    <select
                      className={inputClass}
                      value={draft.enabled ? 'yes' : 'no'}
                      onChange={(e) => setField('enabled', e.target.value === 'yes')}
                    >
                      <option value="yes">Ativo</option>
                      <option value="no">Desativado</option>
                    </select>
                  </Field>
                  <Field label="Mostrar no checkout" hint="Exibe a opcao PIX na tela de pagamento">
                    <select
                      className={inputClass}
                      value={draft.showOnCheckout ? 'yes' : 'no'}
                      onChange={(e) => setField('showOnCheckout', e.target.value === 'yes')}
                    >
                      <option value="yes">Sim</option>
                      <option value="no">Nao</option>
                    </select>
                  </Field>
                  <Field label="Desconto PIX (%)" hint="Desconto aplicado quando cliente escolhe PIX">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      className={inputClass}
                      value={draft.discountPercent}
                      onChange={(e) => setField('discountPercent', Number(e.target.value) || 0)}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground mb-3">Chave PIX</h2>
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                  <Field label="Tipo da chave">
                    <select
                      className={inputClass}
                      value={draft.pixKeyType}
                      onChange={(e) => setField('pixKeyType', e.target.value as PixKeyType)}
                    >
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                      <option value="email">E-mail</option>
                      <option value="phone">Telefone (+55...)</option>
                      <option value="random">Chave aleatoria</option>
                    </select>
                  </Field>
                  <Field label="Chave PIX" hint={keyHint(draft.pixKeyType)}>
                    <input
                      className={inputClass}
                      value={draft.pixKey}
                      placeholder={keyPlaceholder(draft.pixKeyType)}
                      onChange={(e) => setField('pixKey', e.target.value.trim())}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground mb-3">
                  Dados do beneficiario
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Nome / Razao social" hint="Max 25 caracteres">
                    <input
                      className={inputClass}
                      value={draft.beneficiaryName}
                      maxLength={25}
                      onChange={(e) => setField('beneficiaryName', e.target.value)}
                    />
                  </Field>
                  <Field label="Cidade" hint="Max 15 caracteres">
                    <input
                      className={inputClass}
                      value={draft.beneficiaryCity}
                      maxLength={15}
                      onChange={(e) => setField('beneficiaryCity', e.target.value)}
                    />
                  </Field>
                  <Field label="Banco (opcional)" hint="Aparece no resumo do pagamento">
                    <input
                      className={inputClass}
                      value={draft.bankName}
                      placeholder="Itau / Bradesco / Nubank..."
                      onChange={(e) => setField('bankName', e.target.value)}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Plug size={18} className="text-[var(--orange-primary)]" />
                    Gateway de pagamento (Koliseu)
                  </h2>
                  {draft.gatewayHasServerKey && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      <CheckCircle2 size={12} /> Chave configurada no servidor
                    </span>
                  )}
                </div>

                <div className="rounded border border-[#0066cc]/20 bg-[#e8f2ff] p-3 text-xs text-[#0b4d8d] mb-4 flex gap-2">
                  <Zap size={14} className="mt-0.5 shrink-0" />
                  <div>
                    Com o gateway ligado, cada pedido gera um PIX <strong>real</strong> na Koliseu
                    com webhook de confirmacao. O desconto e o QR sao mostrados instantaneamente no
                    checkout. Sem gateway, usamos o PIX estatico gerado a partir da sua chave.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Field label="Gateway ativo" hint="Liga/desliga o Koliseu. Se desligado, usa PIX estatico">
                    <select
                      className={inputClass}
                      value={draft.gatewayEnabled ? 'yes' : 'no'}
                      onChange={(e) => setField('gatewayEnabled', e.target.value === 'yes')}
                    >
                      <option value="yes">Ativo</option>
                      <option value="no">Desativado</option>
                    </select>
                  </Field>
                  <Field label="Provider">
                    <select
                      className={inputClass}
                      value={draft.gatewayProvider}
                      onChange={(e) =>
                        setField('gatewayProvider', e.target.value as PixSettings['gatewayProvider'])
                      }
                    >
                      <option value="koliseu">Koliseu Cloud</option>
                      <option value="none">Nenhum (PIX estatico)</option>
                    </select>
                  </Field>
                  <Field
                    label="Base URL"
                    hint="Endpoint da API. Padrao: https://www.koliseu.cloud/api/v1"
                  >
                    <input
                      className={inputClass}
                      value={draft.gatewayBaseUrl}
                      placeholder="https://www.koliseu.cloud/api/v1"
                      onChange={(e) => setField('gatewayBaseUrl', e.target.value)}
                    />
                  </Field>
                </div>

                <Field
                  label="API Key (x-api-key)"
                  hint={
                    draft.gatewayHasServerKey
                      ? 'Voce ja tem uma chave no servidor. Deixe em branco para usar a do servidor ou cole uma para sobrescrever.'
                      : 'Cole aqui a chave que comeca com "ksl_". Ela e armazenada apenas neste navegador; prefira colocar em .env.local (KOLISEU_API_KEY).'
                  }
                >
                  <div className="flex gap-2">
                    <input
                      className={`${inputClass} flex-1 font-mono text-xs`}
                      type={showGatewayKey ? 'text' : 'password'}
                      value={draft.gatewayApiKey}
                      placeholder={
                        draft.gatewayHasServerKey
                          ? 'Usando a chave do .env.local (deixe em branco)'
                          : 'ksl_...'
                      }
                      onChange={(e) => setField('gatewayApiKey', e.target.value.trim())}
                    />
                    <button
                      type="button"
                      onClick={() => setShowGatewayKey((v) => !v)}
                      className="px-3 py-2 rounded border border-border hover:bg-secondary text-muted-foreground"
                      title={showGatewayKey ? 'Ocultar' : 'Mostrar'}
                    >
                      {showGatewayKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTestGateway}
                    disabled={testing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-secondary hover:bg-muted text-sm font-semibold border border-border disabled:opacity-50"
                  >
                    {testing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Testando...
                      </>
                    ) : (
                      <>
                        <Plug size={14} /> Testar conexao (R$ 1,00)
                      </>
                    )}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Cria uma cobranca de teste sem impacto. Se tudo funcionar, aparece o QR abaixo.
                  </span>
                </div>

                {testResult && (
                  <div
                    className={`mt-4 rounded-md border p-3 text-xs ${
                      testResult.ok
                        ? 'border-green-300 bg-green-50 text-green-900'
                        : 'border-red-300 bg-red-50 text-red-900'
                    }`}
                  >
                    {testResult.ok ? (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" />
                        <div className="space-y-1">
                          <div className="font-semibold">Conexao OK!</div>
                          <div>ID do pagamento: <span className="font-mono">{testResult.charge.id ?? '-'}</span></div>
                          <div>Status: <span className="font-mono">{testResult.charge.status ?? '-'}</span></div>
                          {testResult.charge.qrCode && (
                            <details className="mt-1">
                              <summary className="cursor-pointer">Ver copia-e-cola</summary>
                              <pre className="mt-1 whitespace-pre-wrap break-all bg-white p-2 rounded border border-green-200 font-mono text-[10px]">
                                {testResult.charge.qrCode}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
                        <div className="space-y-1 flex-1">
                          <div className="font-semibold">Falha: {testResult.error}</div>
                          {testResult.raw !== undefined && (
                            <details className="mt-1">
                              <summary className="cursor-pointer">Resposta bruta da API</summary>
                              <pre className="mt-1 whitespace-pre-wrap break-all bg-white p-2 rounded border border-red-200 font-mono text-[10px]">
                                {JSON.stringify(testResult.raw, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-base font-semibold text-foreground mb-3">Mensagens</h2>
                <div className="grid grid-cols-1 gap-4">
                  <Field
                    label="Instrucoes para o cliente"
                    hint="Aparece abaixo do QR Code (ex: 'envie o comprovante...')"
                  >
                    <textarea
                      className={`${inputClass} min-h-[80px]`}
                      value={draft.instructions}
                      onChange={(e) => setField('instructions', e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Payload manual (opcional)"
                    hint="Cole aqui um copia-e-cola gerado pelo seu banco para sobrescrever o gerado automatico"
                  >
                    <textarea
                      className={`${inputClass} min-h-[80px] font-mono text-xs`}
                      value={draft.staticPayload}
                      onChange={(e) => setField('staticPayload', e.target.value)}
                      placeholder="00020126580014br.gov.bcb.pix..."
                    />
                  </Field>
                  <Field
                    label="URL de QR Code customizado (opcional)"
                    hint="Imagem de QR Code ja gerado (sobrescreve o QR gerado automaticamente)"
                  >
                    <input
                      className={inputClass}
                      value={draft.customQrUrl}
                      placeholder="https://..."
                      onChange={(e) => setField('customQrUrl', e.target.value)}
                    />
                  </Field>
                  <Field
                    label="Botao 'enviar comprovante' via WhatsApp"
                    hint={
                      whatsappContact
                        ? `Numero atual da rotacao: ${whatsappContact.number}`
                        : 'Configure um numero em /admin/whatsapp'
                    }
                  >
                    <select
                      className={inputClass}
                      value={draft.whatsappConfirmEnabled ? 'yes' : 'no'}
                      onChange={(e) =>
                        setField('whatsappConfirmEnabled', e.target.value === 'yes')
                      }
                    >
                      <option value="yes">Ativo</option>
                      <option value="no">Desativado</option>
                    </select>
                  </Field>
                </div>
              </section>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold"
                >
                  <Save size={16} />
                  Salvar configuracoes
                </button>
                <button
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <RotateCcw size={16} />
                  Restaurar padrao
                </button>
                {savedAt && (
                  <span className="text-sm text-green-700 inline-flex items-center gap-1">
                    <CheckCircle2 size={16} /> Salvo!
                  </span>
                )}
              </div>
            </div>

            <aside className="bg-card p-5 rounded-lg shadow-sm space-y-4 h-fit lg:sticky lg:top-6">
              <div className="text-sm font-semibold text-foreground">Preview do QR Code</div>
              <div className="w-full aspect-square bg-white rounded-md border border-border flex items-center justify-center overflow-hidden">
                {draft.customQrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.customQrUrl}
                    alt="QR Preview"
                    className="w-full h-full object-contain"
                  />
                ) : previewQr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewQr} alt="QR Preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground text-center px-4">
                    Preencha a chave PIX para ver o QR Code
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Este e um preview com valor zero. No checkout o valor real e injetado automaticamente.
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Copia e cola
                </div>
                <textarea
                  readOnly
                  className={`${inputClass} font-mono text-[10px] w-full min-h-[100px]`}
                  value={previewPayload || '(nenhum payload gerado)'}
                />
              </div>
            </aside>
          </div>
        )}

        {tab === 'cobrancas' && <ChargesList />}
        {tab === 'nova' && <NewChargeForm onCreated={() => setTab('cobrancas')} />}
      </div>
    </>
  )
}

function ChargesList() {
  const charges = usePixStore((s) => s.charges)
  const markPaid = usePixStore((s) => s.markPaid)
  const markCancelled = usePixStore((s) => s.markCancelled)
  const remove = usePixStore((s) => s.removeCharge)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (charges.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-10 text-center text-sm text-muted-foreground">
        Nenhuma cobranca manual registrada. Crie uma em <strong>Nova cobranca manual</strong>.
      </div>
    )
  }

  const handleCopy = async (id: string, payload: string) => {
    try {
      await navigator.clipboard.writeText(payload)
    } catch {}
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-xs uppercase text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Data</th>
            <th className="text-left px-4 py-3">Descricao</th>
            <th className="text-left px-4 py-3">Cliente</th>
            <th className="text-right px-4 py-3">Valor</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {charges.map((c) => {
            const status = STATUS_LABEL[c.status]
            return (
              <tr key={c.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{c.description || '-'}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.txid}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">{c.customerName || '-'}</div>
                  {c.customerPhone && (
                    <div className="text-xs text-muted-foreground">{c.customerPhone}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold">{currency(c.amount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${status.className}`}
                  >
                    {status.label}
                  </span>
                  {c.paidAt && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Pago em {formatDate(c.paidAt)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleCopy(c.id, c.payload)}
                      title="Copiar copia-e-cola"
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      {copiedId === c.id ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <SendWhatsappButton charge={c} />
                    {c.status === 'pending' && (
                      <>
                        <button
                          onClick={() => markPaid(c.id)}
                          title="Marcar como pago"
                          className="p-1.5 rounded hover:bg-green-50 text-green-600"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <button
                          onClick={() => markCancelled(c.id)}
                          title="Cancelar"
                          className="p-1.5 rounded hover:bg-red-50 text-red-600"
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Remover esta cobranca?')) remove(c.id)
                      }}
                      title="Excluir"
                      className="p-1.5 rounded hover:bg-red-50 text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SendWhatsappButton({ charge }: { charge: ManualPixCharge }) {
  const whatsappContact = useWhatsAppStore((state) => state.getContactForCurrentWindow())
  if (!charge.customerPhone) return null
  const target = charge.customerPhone.replace(/\D/g, '')
  const text = encodeURIComponent(
    `Ola${charge.customerName ? `, ${charge.customerName}` : ''}! Segue o PIX de ${currency(
      charge.amount,
    )} referente a ${charge.description || 'seu pedido'}.\n\nCopia e cola:\n${charge.payload}`,
  )
  const href = `https://wa.me/${target}?text=${text}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={`Enviar PIX via WhatsApp ${whatsappContact?.label ?? ''}`}
      className="p-1.5 rounded hover:bg-green-50 text-[#25D366]"
    >
      <Send size={14} />
    </a>
  )
}

function NewChargeForm({ onCreated }: { onCreated: () => void }) {
  const pix = usePixStore()
  const addCharge = usePixStore((s) => s.addCharge)
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerDocument, setCustomerDocument] = useState('')
  const [orderId, setOrderId] = useState('')
  const [notes, setNotes] = useState('')
  const [previewQr, setPreviewQr] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const useGateway =
    pix.gatewayEnabled &&
    pix.gatewayProvider !== 'none' &&
    (pix.gatewayApiKey.trim() !== '' || pix.gatewayHasServerKey)

  const txid = useMemo(() => generateTxid('OB'), [amount, description])

  const payload = useMemo(() => {
    if (!pix.pixKey) return ''
    if (amount <= 0) return ''
    return generatePixPayload({
      pixKey: pix.pixKey,
      beneficiaryName: pix.beneficiaryName,
      beneficiaryCity: pix.beneficiaryCity,
      amount,
      txid,
      description: description.slice(0, 25),
    })
  }, [pix.pixKey, pix.beneficiaryName, pix.beneficiaryCity, amount, description, txid])

  useEffect(() => {
    if (!payload) {
      setPreviewQr('')
      return
    }
    let cancelled = false
    QRCode.toDataURL(payload, { margin: 1, width: 280 })
      .then((url) => {
        if (!cancelled) setPreviewQr(url)
      })
      .catch(() => {
        if (!cancelled) setPreviewQr('')
      })
    return () => {
      cancelled = true
    }
  }, [payload])

  const handleSubmit = async () => {
    setError('')
    if (amount <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }
    if (!useGateway && !pix.pixKey) {
      setError(
        'Configure a chave PIX ou habilite o gateway Koliseu em Configuracao antes de criar cobrancas.',
      )
      return
    }

    setSubmitting(true)

    let finalPayload = payload
    let gatewayData: GatewayChargeNormalized | null = null

    if (useGateway) {
      const result = await createGatewayPix({
        amountCents: Math.round(amount * 100),
        description: description || `Cobranca manual ${txid}`,
        externalReference: orderId || txid,
        client: {
          name: customerName || undefined,
          email: customerEmail || undefined,
          phone: customerPhone || undefined,
          document: customerDocument || undefined,
        },
      })
      if (!result.ok) {
        setSubmitting(false)
        setError(
          `Falha no gateway: ${result.error}. ${
            pix.pixKey ? 'Desative o gateway para usar PIX estatico.' : ''
          }`,
        )
        return
      }
      gatewayData = result.data
      if (result.data.qrCode) {
        finalPayload = result.data.qrCode
      }
    }

    if (!finalPayload) {
      setSubmitting(false)
      setError('Nao foi possivel gerar o codigo PIX. Revise os dados.')
      return
    }

    addCharge({
      amount,
      description,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
      customerDocument: customerDocument || undefined,
      orderId: orderId || undefined,
      txid,
      payload: finalPayload,
      notes: notes || undefined,
      gatewayProvider: useGateway ? 'koliseu' : 'none',
      gatewayPaymentId: gatewayData?.id,
      gatewayQrImage: gatewayData?.qrCodeImage,
      gatewayStatus: gatewayData?.status,
      gatewayRaw: gatewayData?.raw,
    })
    setAmount(0)
    setDescription('')
    setCustomerName('')
    setCustomerPhone('')
    setCustomerEmail('')
    setCustomerDocument('')
    setOrderId('')
    setNotes('')
    setSubmitting(false)
    onCreated()
  }

  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    if (!payload) return
    try {
      await navigator.clipboard.writeText(payload)
    } catch {}
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
      <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
        <div className="bg-[#e8f2ff] border border-[#0066cc]/20 p-4 rounded flex items-start gap-3">
          <QrCode className="text-[#0066cc] mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              Gerar PIX manual
              {useGateway ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold uppercase">
                  <Zap size={10} /> Koliseu (real)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase">
                  PIX estatico
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {useGateway
                ? 'A cobranca sera criada na Koliseu Cloud em tempo real (webhook de confirmacao automatico).'
                : 'Sera usada a chave PIX configurada localmente. Para PIX com confirmacao automatica, ative o gateway Koliseu em Configuracao.'}
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Valor e descricao</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Valor (R$)" hint="Use ponto para separar centavos (ex: 199.90)">
              <input
                type="number"
                min={0.01}
                step={0.01}
                className={inputClass}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                placeholder="0.00"
              />
            </Field>
            <Field label="Descricao (max 25 chars)" hint="Ex: Pedido 1234 - Argamassa">
              <input
                className={inputClass}
                maxLength={40}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field label="ID do pedido (opcional)">
              <input
                className={inputClass}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="#1234"
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Cliente (opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Nome">
              <input
                className={inputClass}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Field>
            <Field label="WhatsApp / Telefone" hint="Permite enviar o PIX direto pelo WhatsApp">
              <input
                className={inputClass}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                className={inputClass}
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="CPF/CNPJ" hint={useGateway ? 'Alguns gateways exigem documento do pagador' : 'Opcional'}>
              <input
                className={inputClass}
                value={customerDocument}
                onChange={(e) => setCustomerDocument(e.target.value)}
                placeholder="000.000.000-00"
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Anotacoes internas (opcional)">
              <textarea
                className={`${inputClass} min-h-[70px]`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </div>
        </section>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Criando...
              </>
            ) : (
              <>
                <Pencil size={16} />
                Criar cobranca{useGateway ? ' (Koliseu)' : ''}
              </>
            )}
          </button>
          <button
            onClick={handleCopy}
            disabled={!payload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-600" /> Copiado
              </>
            ) : (
              <>
                <Copy size={16} /> Copiar codigo
              </>
            )}
          </button>
          {customerPhone && payload && (
            <a
              href={`https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Ola${customerName ? `, ${customerName}` : ''}! Segue o PIX de ${currency(
                  amount,
                )} referente a ${description || 'sua compra'}.\n\nCopia e cola:\n${payload}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#25D366] hover:bg-[#20b858] text-white text-sm font-semibold"
            >
              <MessageCircle size={16} />
              Enviar pelo WhatsApp
            </a>
          )}
        </div>
      </div>

      <aside className="bg-card p-5 rounded-lg shadow-sm space-y-4 h-fit lg:sticky lg:top-6">
        <div className="text-sm font-semibold text-foreground">Preview da cobranca</div>
        <div className="w-full aspect-square bg-white rounded-md border border-border flex items-center justify-center overflow-hidden">
          {previewQr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewQr} alt="QR Preview" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground text-center px-4">
              Informe o valor para gerar o QR
            </span>
          )}
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Valor</div>
          <div className="text-2xl font-bold">{currency(amount)}</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">{txid}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
            Copia e cola
          </div>
          <textarea
            readOnly
            className={`${inputClass} font-mono text-[10px] w-full min-h-[100px]`}
            value={payload || '(preencha o valor)'}
          />
        </div>
      </aside>
    </div>
  )
}

function extractSettings(state: PixSettings): PixSettings {
  return {
    enabled: state.enabled,
    pixKey: state.pixKey,
    pixKeyType: state.pixKeyType,
    beneficiaryName: state.beneficiaryName,
    beneficiaryCity: state.beneficiaryCity,
    bankName: state.bankName,
    discountPercent: state.discountPercent,
    expirationMinutes: state.expirationMinutes,
    instructions: state.instructions,
    customQrUrl: state.customQrUrl,
    staticPayload: state.staticPayload,
    showOnCheckout: state.showOnCheckout,
    whatsappConfirmEnabled: state.whatsappConfirmEnabled,
    gatewayProvider: state.gatewayProvider,
    gatewayEnabled: state.gatewayEnabled,
    gatewayApiKey: state.gatewayApiKey,
    gatewayBaseUrl: state.gatewayBaseUrl,
    gatewayHasServerKey: state.gatewayHasServerKey,
  }
}

function keyHint(type: PixKeyType): string {
  switch (type) {
    case 'cpf':
      return 'Somente numeros (ex: 12345678909)'
    case 'cnpj':
      return 'Somente numeros (ex: 12345678000199)'
    case 'email':
      return 'E-mail cadastrado no seu banco'
    case 'phone':
      return 'Formato +5511999999999'
    case 'random':
      return 'Chave aleatoria gerada no seu banco (UUID)'
  }
}

function keyPlaceholder(type: PixKeyType): string {
  switch (type) {
    case 'cpf':
      return '12345678909'
    case 'cnpj':
      return '01637895000132'
    case 'email':
      return 'pix@alfaconstrucao.com.br'
    case 'phone':
      return '+5511999999999'
    case 'random':
      return '000-000-000-000-000...'
  }
}
