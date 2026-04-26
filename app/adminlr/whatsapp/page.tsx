'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, MessageCircle, Plus, Trash2 } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'
import { useWhatsAppStore } from '@/lib/whatsapp-store'

export default function AdminWhatsAppPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    contacts,
    defaultMessage,
    rotationIntervalMinutes,
    addContact,
    updateContact,
    removeContact,
    setDefaultMessage,
    setRotationIntervalMinutes,
    loadFromSupabase,
    syncAllToSupabase,
  } = useWhatsAppStore()

  const [label, setLabel] = useState('')
  const [number, setNumber] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    loadFromSupabase()
  }, [loadFromSupabase])

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  // Sync debounced toda vez que contacts mudam
  useEffect(() => {
    if (!hydrated) return
    const timeoutId = window.setTimeout(() => {
      syncAllToSupabase()
    }, 600)
    return () => window.clearTimeout(timeoutId)
  }, [contacts, hydrated, syncAllToSupabase])

  if (user?.role !== 'superadmin') {
    return null
  }

  const onAddNumber = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!label.trim() || !number.trim()) {
      return
    }

    addContact({
      label: label.trim(),
      number: number.trim(),
      active: true,
    })

    setLabel('')
    setNumber('')
  }

  const onTestWhatsApp = (phone: string) => {
    const encodedMessage = encodeURIComponent(defaultMessage)
    const url = `https://wa.me/${phone}?text=${encodedMessage}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <AdminTopbar title="WhatsApp Rotativo" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
          <div className="bg-green-50 border border-green-200 p-4 rounded flex items-start gap-3">
            <MessageCircle className="text-green-600 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-green-800">Distribuicao automatica de atendimento</p>
              <p className="text-sm text-green-700">
                O numero muda automaticamente de acordo com o tempo de rotacao configurado.
              </p>
            </div>
          </div>

          <form onSubmit={onAddNumber} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Nome interno (ex: Comercial 2)"
              className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
            />
            <input
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="Numero com DDI e DDD (ex: 5511999999999)"
              className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </form>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Mensagem padrao enviada no WhatsApp</label>
            <textarea
              value={defaultMessage}
              onChange={(event) => setDefaultMessage(event.target.value)}
              rows={3}
              className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5 max-w-xs">
            <label className="text-sm font-medium text-foreground">Tempo de rotacao (minutos)</label>
            <input
              type="number"
              min={1}
              value={rotationIntervalMinutes}
              onChange={(event) => setRotationIntervalMinutes(Number(event.target.value))}
              className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Exemplo: 15 = a cada 15 minutos o sistema troca para o proximo numero ativo.
            </p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1.2fr_1fr_auto_auto] gap-3 px-4 py-3 bg-secondary text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Nome</span>
              <span>Numero</span>
              <span>Status</span>
              <span>Acoes</span>
            </div>

            {contacts.length === 0 && (
              <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum numero cadastrado.</div>
            )}

            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="grid grid-cols-[1.2fr_1fr_auto_auto] gap-3 px-4 py-3 border-t border-border items-center"
              >
                <span className="text-sm font-medium text-foreground">{contact.label}</span>
                <span className="text-sm text-muted-foreground">{contact.number}</span>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={contact.active}
                    onChange={(event) => updateContact(contact.id, { active: event.target.checked })}
                  />
                  {contact.active ? 'Ativo' : 'Inativo'}
                </label>
                <div className="inline-flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onTestWhatsApp(contact.number)}
                    className="inline-flex items-center gap-1 text-sm text-[#0066cc] hover:text-[#0052a3]"
                  >
                    <ExternalLink size={14} />
                    Testar
                  </button>
                  <button
                    type="button"
                    onClick={() => removeContact(contact.id)}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
