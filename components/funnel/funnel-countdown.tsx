'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface FunnelCountdownProps {
  hours?: number
  label?: string
  className?: string
}

export function FunnelCountdown({
  hours = 6,
  label = 'Termina em',
  className = '',
}: FunnelCountdownProps) {
  const [deadline] = useState(() => Date.now() + hours * 60 * 60 * 1000)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const diff = Math.max(0, deadline - now)
  const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold">
        {label}
      </span>
      <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-white text-sm font-extrabold tracking-widest border border-white/10">
        <Clock size={14} />
        {h}:{m}:{s}
      </div>
    </div>
  )
}
