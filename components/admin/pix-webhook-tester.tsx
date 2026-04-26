'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  ShieldAlert,
  Webhook,
} from 'lucide-react'

type EventType = 'pix_gerado' | 'pix_aprovado'

interface SimulateResponse {
  ok: boolean
  event: EventType
  pixId: string
  orderId: string
  forwardedIp: string
  payloadSent: unknown
  webhookResult: unknown
  webhookError: string | null
}

const inputClass =
  'px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground'

export function PixWebhookTester() {
  const [event, setEvent] = useState<EventType>('pix_aprovado')
  const [amount, setAmount] = useState('100')
  const [customerName, setCustomerName] = useState('Cliente Teste')
  const [customerEmail, setCustomerEmail] = useState('teste@alfaconstrucao.com.br')
  const [customerPhone, setCustomerPhone] = useState('11999999999')
  const [ip, setIp] = useState('')
  const [orderId, setOrderId] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimulateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRun = async () => {
    setRunning(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/pix/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          amount: parseFloat(amount) || 100,
          customerName,
          customerEmail,
          customerPhone,
          ip: ip.trim() || undefined,
          orderId: orderId.trim() || undefined,
        }),
      })
      const data = (await res.json()) as SimulateResponse
      if (!res.ok || !data.ok) {
        setError(data.webhookError || `Erro ${res.status}`)
        setResult(data)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao chamar a API')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--orange-primary)]/10 flex items-center justify-center shrink-0">
            <Webhook size={20} className="text-[var(--orange-primary)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Disparar webhook de teste</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Envia para <code className="text-xs bg-muted px-1 rounded">/api/pix/webhook</code> um payload identico ao da Koliseu, para validar
              <strong className="text-foreground"> bloqueio automatico de IP</strong> (em <code>pix_aprovado</code>),
              registro em <code>pix_webhook_log</code> e disparo do Pushcut.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Tipo de evento</span>
            <select
              className={inputClass}
              value={event}
              onChange={(e) => setEvent(e.target.value as EventType)}
            >
              <option value="pix_gerado">PIX gerado (cliente abriu QR)</option>
              <option value="pix_aprovado">PIX aprovado (pagamento confirmado)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Valor (R$)</span>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Nome do cliente</span>
            <input
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">E-mail do cliente</span>
            <input
              className={inputClass}
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Telefone</span>
            <input
              className={inputClass}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              IP a registrar <span className="text-muted-foreground font-normal">(opcional)</span>
            </span>
            <input
              className={inputClass}
              placeholder="Padrao: o seu IP atual"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-sm font-medium text-foreground">
              Order ID <span className="text-muted-foreground font-normal">(opcional, casa com pedidos reais)</span>
            </span>
            <input
              className={inputClass}
              placeholder="Padrao: order-test-..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </label>
        </div>

        {event === 'pix_aprovado' && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex gap-2 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <div>
              Este teste vai <strong>bloquear o IP informado por 1 hora</strong> em <code>ip_blocks</code>.
              Se o IP for o seu, voce sera redirecionado para <code>/blocked</code> nas rotas publicas.
              Voce pode remover o bloqueio em <strong>Atendimento &gt; IPs Bloqueados</strong>.
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[var(--orange-primary)] text-white text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors disabled:opacity-60"
          >
            {running ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Disparando...
              </>
            ) : (
              <>
                <Send size={14} />
                Disparar webhook
              </>
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            Use os filtros em Relatorios &gt; PIX para auditar.
          </span>
        </div>
      </div>

      {error && !result && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900 flex gap-2 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-200">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-semibold">Falhou</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {result && (
        <div
          className={`rounded-md border p-4 text-sm ${
            result.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-200'
              : 'border-red-300 bg-red-50 text-red-900 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-200'
          }`}
        >
          <div className="flex items-start gap-2 mb-3">
            {result.ok ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <div className="space-y-0.5">
              <div className="font-semibold">
                Webhook {result.ok ? 'enviado e processado' : 'enviado com erro'}
              </div>
              <div className="text-xs">
                Evento: <span className="font-mono">{result.event}</span> · PIX ID:{' '}
                <span className="font-mono">{result.pixId}</span> · IP registrado:{' '}
                <span className="font-mono">{result.forwardedIp}</span>
              </div>
            </div>
          </div>

          <details className="text-xs">
            <summary className="cursor-pointer font-semibold">Payload enviado</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all bg-background p-3 rounded border border-border font-mono text-[11px] text-foreground">
              {JSON.stringify(result.payloadSent, null, 2)}
            </pre>
          </details>
          <details className="text-xs mt-2">
            <summary className="cursor-pointer font-semibold">Resposta do webhook</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all bg-background p-3 rounded border border-border font-mono text-[11px] text-foreground">
              {JSON.stringify(result.webhookResult, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
