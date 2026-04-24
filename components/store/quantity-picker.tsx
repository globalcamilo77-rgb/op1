'use client'

import { Minus, Plus } from 'lucide-react'

interface QuantityPickerProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 999,
  className = '',
}: QuantityPickerProps) {
  const setSafe = (next: number) => {
    if (Number.isNaN(next)) return
    onChange(Math.min(max, Math.max(min, Math.floor(next))))
  }

  return (
    <div
      className={`inline-flex items-center border border-border rounded overflow-hidden ${className}`}
    >
      <button
        type="button"
        onClick={() => setSafe(value - 1)}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
        className="w-8 h-9 flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => setSafe(Number(event.target.value))}
        className="w-12 h-9 text-sm text-center bg-background outline-none border-x border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => setSafe(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className="w-8 h-9 flex items-center justify-center text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
