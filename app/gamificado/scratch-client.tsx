'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Gift, Sparkles } from 'lucide-react'

const PRIZES = [
  { label: '5% OFF no PIX', code: 'PIX5', accent: 'text-[var(--orange-primary)]' },
  { label: '10% OFF + Frete grátis', code: 'OBRA10', accent: 'text-emerald-600' },
  { label: '15% OFF na primeira compra', code: 'NOVO15', accent: 'text-rose-600' },
]

/**
 * Cartao de raspadinha. Renderiza um canvas cinza por cima do "premio"
 * e remove pixels conforme o cliente arrasta o dedo / mouse. Ao revelar
 * 35% da area, considera "raspado" e libera o CTA pra loja.
 */
export function ScratchClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [prize] = useState(() => PRIZES[Math.floor(Math.random() * PRIZES.length)])
  const drawingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = Math.max(1, Math.floor(width * dpr))
    canvas.height = Math.max(1, Math.floor(height * dpr))
    ctx.scale(dpr, dpr)

    // Fundo metalico
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#9ca3af')
    gradient.addColorStop(0.5, '#cbd5e1')
    gradient.addColorStop(1, '#9ca3af')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Texto convidativo
    ctx.fillStyle = '#1f2937'
    ctx.font = '600 16px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Toque e arraste para raspar', width / 2, height / 2 - 10)
    ctx.font = '500 13px system-ui, sans-serif'
    ctx.fillStyle = '#374151'
    ctx.fillText('seu desconto está aqui dentro', width / 2, height / 2 + 12)
  }, [])

  function pointFromEvent(event: PointerEvent | React.PointerEvent) {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function scratchAt(x: number, y: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 26, 0, Math.PI * 2)
    ctx.fill()
  }

  function checkReveal() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvas
    const data = ctx.getImageData(0, 0, width, height).data
    let cleared = 0
    const stride = 32 // amostragem
    for (let i = 3; i < data.length; i += stride * 4) {
      if (data[i] === 0) cleared += 1
    }
    const total = data.length / (stride * 4)
    if (cleared / total > 0.35) {
      setRevealed(true)
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = true
    const point = pointFromEvent(event)
    if (point) scratchAt(point.x, point.y)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const point = pointFromEvent(event)
    if (point) scratchAt(point.x, point.y)
  }
  function handlePointerUp() {
    if (!drawingRef.current) return
    drawingRef.current = false
    checkReveal()
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl shadow-black/5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
        <Gift size={14} /> Seu cartão de desconto
      </div>

      <div className="relative aspect-[16/9] mt-3 rounded-xl overflow-hidden bg-secondary">
        {/* Conteudo "premiado" sob o canvas */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <Sparkles size={20} className="text-[var(--orange-primary)] mb-2" />
          <div className={`text-2xl md:text-3xl font-extrabold ${prize.accent}`}>{prize.label}</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            cupom <span className="font-mono font-bold">{prize.code}</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Cartao de raspadinha. Arraste o dedo ou o mouse para revelar seu desconto."
        />
      </div>

      <Link
        href={`/loja?utm_source=site&utm_medium=funnel&utm_campaign=gamificado&cupom=${encodeURIComponent(
          prize.code,
        )}`}
        aria-disabled={!revealed}
        className={`mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md font-bold text-sm transition-all ${
          revealed
            ? 'bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white shadow-lg shadow-[var(--orange-primary)]/30 hover:-translate-y-0.5'
            : 'bg-secondary text-muted-foreground pointer-events-none'
        }`}
      >
        {revealed ? (
          <>
            Usar cupom na loja
            <ArrowRight size={16} />
          </>
        ) : (
          'Raspe o cartao para liberar'
        )}
      </Link>
    </div>
  )
}
