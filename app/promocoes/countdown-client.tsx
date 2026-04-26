'use client'

import { useEffect, useState } from 'react'

/**
 * Cronometro client-side de 6h. Reseta a cada montagem (cada visita
 * ve o promo "ativo" pelas proximas 6h, gerando senso de urgencia).
 */
export function CountdownClient() {
  const [deadline] = useState(() => Date.now() + 6 * 60 * 60 * 1000)
  const [now, setNow] = useState(deadline)

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const diff = Math.max(0, deadline - now)
  const hours = String(Math.floor(diff / 3600000)).padStart(2, '0')
  const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="mt-3 flex items-end gap-2 font-mono">
      <Cell value={hours} label="h" />
      <span className="text-3xl font-bold text-white/40">:</span>
      <Cell value={minutes} label="m" />
      <span className="text-3xl font-bold text-white/40">:</span>
      <Cell value={seconds} label="s" />
    </div>
  )
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="bg-black/30 rounded-md py-3 text-4xl font-extrabold tracking-tight">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-white/60 mt-1">{label}</div>
    </div>
  )
}
