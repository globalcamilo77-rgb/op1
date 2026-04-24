'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { ExternalLink, Palette, RotateCcw, Save } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/topbar'
import { useAuthStore } from '@/lib/store'
import {
  AppearanceSettings,
  DEFAULT_APPEARANCE,
  useAppearanceStore,
} from '@/lib/appearance-store'

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

const inputClass =
  'px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground'

export default function AdminAparenciaPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const settings = useAppearanceStore(
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
  const update = useAppearanceStore((state) => state.update)
  const reset = useAppearanceStore((state) => state.reset)

  const [draft, setDraft] = useState<AppearanceSettings>(settings)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDraft(settings)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      router.push('/adminlr')
    }
  }, [user, router])

  if (user?.role !== 'superadmin') {
    return null
  }

  const setField = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    update(draft)
    setSavedAt(Date.now())
    window.setTimeout(() => setSavedAt(null), 2200)
  }

  const handleReset = () => {
    if (!window.confirm('Restaurar a aparencia padrao? Todas as personalizacoes serao perdidas.')) {
      return
    }
    reset()
    setDraft(DEFAULT_APPEARANCE)
  }

  if (!hydrated) {
    return null
  }

  return (
    <>
      <AdminTopbar title="Aparencia do site" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="bg-card p-6 rounded-lg shadow-sm space-y-6">
            <div className="bg-[#fff7e6] border border-[#ffc107] p-4 rounded flex items-start gap-3">
              <Palette className="text-[var(--orange-primary)] mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-foreground">Personalize a vitrine</p>
                <p className="text-sm text-muted-foreground">
                  Edite o nome da marca, cores principais, banner de aviso, textos da home e dados do
                  rodape. As mudancas se aplicam em toda a loja apos salvar.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">Identidade da marca</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nome principal" hint="Aparece no topo do site">
                  <input
                    className={inputClass}
                    value={draft.brandName}
                    onChange={(event) => setField('brandName', event.target.value)}
                  />
                </Field>
                <Field label="Destaque" hint="Parte colorida do nome (ex: 'Construção')">
                  <input
                    className={inputClass}
                    value={draft.brandHighlight}
                    onChange={(event) => setField('brandHighlight', event.target.value)}
                  />
                </Field>
                <Field label="Sufixo / slogan curto" hint="Texto pequeno depois do nome">
                  <input
                    className={inputClass}
                    value={draft.brandSuffix}
                    onChange={(event) => setField('brandSuffix', event.target.value)}
                  />
                </Field>
                <Field
                  label="URL do logo"
                  hint="Padrao: /logo.png (arquivo local). Pode ser URL externa (ex: https://...)"
                >
                  <input
                    className={inputClass}
                    value={draft.logoUrl}
                    placeholder="/logo.png"
                    onChange={(event) => setField('logoUrl', event.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">Cores principais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Cor primaria" hint="Botoes, links e destaques">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draft.primaryColor}
                      onChange={(event) => setField('primaryColor', event.target.value)}
                      className="w-12 h-10 rounded border border-border cursor-pointer"
                    />
                    <input
                      className={`${inputClass} flex-1`}
                      value={draft.primaryColor}
                      onChange={(event) => setField('primaryColor', event.target.value)}
                    />
                  </div>
                </Field>
                <Field label="Cor primaria escura" hint="Hover dos botoes">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draft.primaryDarkColor}
                      onChange={(event) => setField('primaryDarkColor', event.target.value)}
                      className="w-12 h-10 rounded border border-border cursor-pointer"
                    />
                    <input
                      className={`${inputClass} flex-1`}
                      value={draft.primaryDarkColor}
                      onChange={(event) => setField('primaryDarkColor', event.target.value)}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">Barra de aviso (topo)</h2>
              <Field label="Mostrar barra de aviso">
                <label className="inline-flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={draft.notificationBarEnabled}
                    onChange={(event) => setField('notificationBarEnabled', event.target.checked)}
                  />
                  {draft.notificationBarEnabled ? 'Ativada' : 'Desativada'}
                </label>
              </Field>
              <Field label="Mensagem">
                <textarea
                  rows={2}
                  className={inputClass}
                  value={draft.notificationBarText}
                  onChange={(event) => setField('notificationBarText', event.target.value)}
                />
              </Field>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">
                Secao &quot;Produtos em destaque&quot;
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Eyebrow (texto pequeno)">
                  <input
                    className={inputClass}
                    value={draft.featuredEyebrow}
                    onChange={(event) => setField('featuredEyebrow', event.target.value)}
                  />
                </Field>
                <Field label="Titulo da secao">
                  <input
                    className={inputClass}
                    value={draft.featuredTitle}
                    onChange={(event) => setField('featuredTitle', event.target.value)}
                  />
                </Field>
              </div>
              <Field label="Subtitulo">
                <input
                  className={inputClass}
                  value={draft.featuredSubtitle}
                  onChange={(event) => setField('featuredSubtitle', event.target.value)}
                />
              </Field>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">Rodape e contato</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nome da empresa">
                  <input
                    className={inputClass}
                    value={draft.footerCompany}
                    onChange={(event) => setField('footerCompany', event.target.value)}
                  />
                </Field>
                <Field label="Telefone (televendas)" hint="Ex: 0800 333 6722">
                  <input
                    className={inputClass}
                    value={draft.footerPhone}
                    onChange={(event) => setField('footerPhone', event.target.value)}
                  />
                </Field>
                <Field label="WhatsApp" hint="Apenas numeros, com DDI/DDD (ex: 5511999999999)">
                  <input
                    className={inputClass}
                    value={draft.footerWhatsapp}
                    onChange={(event) => setField('footerWhatsapp', event.target.value)}
                  />
                </Field>
                <Field label="E-mail de contato">
                  <input
                    type="email"
                    className={inputClass}
                    value={draft.footerEmail}
                    onChange={(event) => setField('footerEmail', event.target.value)}
                  />
                </Field>
              </div>
              <Field label="Texto de copyright" hint="Use Enter para quebrar linhas">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={draft.footerCopyright}
                  onChange={(event) => setField('footerCopyright', event.target.value)}
                />
              </Field>
            </section>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors"
              >
                <Save size={16} />
                Salvar alteracoes
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded text-sm font-medium hover:bg-secondary transition-colors"
              >
                <RotateCcw size={16} />
                Restaurar padrao
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[#0066cc] hover:underline ml-auto"
              >
                <ExternalLink size={14} />
                Abrir loja em nova aba
              </a>
              {savedAt && (
                <span className="text-sm text-green-700 font-medium">Alteracoes salvas!</span>
              )}
            </div>
          </div>

          <aside className="bg-card rounded-lg shadow-sm overflow-hidden xl:sticky xl:top-6 xl:self-start">
            <div className="px-4 py-3 border-b border-border bg-secondary">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Preview rapido
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                As alteracoes ja aparecem aqui. Clique em &quot;Salvar&quot; para aplicar na loja.
              </p>
            </div>

            <div className="p-4 space-y-4">
              {draft.notificationBarEnabled && (
                <div className="bg-[#fff3cd] border border-[#ffc107] px-3 py-2 text-xs text-foreground rounded">
                  {draft.notificationBarText || 'Barra de aviso vazia'}
                </div>
              )}

              <div className="border border-border rounded p-3 flex items-center gap-2">
                {draft.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                ) : (
                  <span className="text-lg font-bold text-foreground">
                    {draft.brandName}
                    <span style={{ color: draft.primaryColor }}>{draft.brandHighlight}</span>
                    <span className="text-sm font-normal">{draft.brandSuffix}</span>
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: draft.primaryColor }}>
                  {draft.featuredEyebrow}
                </p>
                <h3 className="text-lg font-bold text-foreground leading-tight">{draft.featuredTitle}</h3>
                <p className="text-xs text-muted-foreground">{draft.featuredSubtitle}</p>
              </div>

              <button
                type="button"
                style={{ backgroundColor: draft.primaryColor }}
                className="w-full inline-flex items-center justify-center text-white text-sm font-semibold px-4 py-2 rounded"
              >
                Botao primario
              </button>
              <button
                type="button"
                style={{ backgroundColor: draft.primaryDarkColor }}
                className="w-full inline-flex items-center justify-center text-white text-sm font-semibold px-4 py-2 rounded"
              >
                Botao primario (hover)
              </button>

              <div className="bg-[var(--graphite)] text-white rounded p-3 text-xs space-y-1">
                <p className="font-bold">{draft.footerCompany}</p>
                <p className="text-white/70">Tel: {draft.footerPhone}</p>
                <p className="text-white/70">WhatsApp: {draft.footerWhatsapp}</p>
                <p className="text-white/70">{draft.footerEmail}</p>
                <p className="text-white/50 text-[10px] whitespace-pre-line pt-1 border-t border-white/10 mt-2">
                  {draft.footerCopyright}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
