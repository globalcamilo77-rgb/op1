'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  MapPin, 
  MessageCircle, 
  Tag, 
  RefreshCw, 
  Save, 
  Plus, 
  Trash2, 
  Check,
  X,
  Upload,
  Download
} from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

type Tab = 'settings' | 'regions' | 'whatsapp' | 'offers'

interface SiteSettings {
  id?: string
  site_id: string
  site_name: string
  logo_url: string
  telefone_principal: string
  whatsapp_principal: string
  endereco_empresa: string
  email_contato: string
}

interface Region {
  id?: string
  site_id: string
  name: string
  active: boolean
  order_index: number
}

interface WhatsAppNumber {
  id?: string
  site_id: string
  number: string
  label: string
  active: boolean
  click_count: number
  order_index: number
  peso_distribuicao: number
  state_code: string
  rotation_interval_minutes: number
  is_forced: boolean
}

interface SiteOffer {
  id?: string
  site_id: string
  title: string
  description: string
  badge: string
  price_current: number
  price_original: number
  active: boolean
  order_index: number
}



const SITE_ID = 'alfaconstrucao'

export default function IntegracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('settings')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Data states
  const [settings, setSettings] = useState<SiteSettings>({
    site_id: SITE_ID,
    site_name: 'AlfaConstrucao',
    logo_url: '',
    telefone_principal: '',
    whatsapp_principal: '',
    endereco_empresa: '',
    email_contato: ''
  })
  const [regions, setRegions] = useState<Region[]>([])
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsAppNumber[]>([])
  const [offers, setOffers] = useState<SiteOffer[]>([])
  

  const supabase = getSupabase()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase nao configurado' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      switch (activeTab) {
        case 'settings':
          const { data: settingsData } = await supabase
            .from('site_settings')
            .select('*')
            .eq('site_id', SITE_ID)
            .single()
          if (settingsData) setSettings(settingsData)
          break
        case 'regions':
          const { data: regionsData } = await supabase
            .from('regions')
            .select('*')
            .eq('site_id', SITE_ID)
            .order('order_index')
          if (regionsData) setRegions(regionsData)
          break
        case 'whatsapp':
          const { data: whatsappData } = await supabase
            .from('whatsapp_numbers')
            .select('*')
            .eq('site_id', SITE_ID)
            .order('order_index')
          if (whatsappData) setWhatsappNumbers(whatsappData)
          break
        case 'offers':
          const { data: offersData } = await supabase
            .from('site_offers')
            .select('*')
            .eq('site_id', SITE_ID)
            .order('order_index')
          if (offersData) setOffers(offersData)
          break
        
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar dados' })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ ...settings, site_id: SITE_ID }, { onConflict: 'site_id' })
      if (error) throw error
      setMessage({ type: 'success', text: 'Configuracoes salvas com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configuracoes' })
    } finally {
      setSaving(false)
    }
  }

  const saveRegions = async () => {
    setSaving(true)
    try {
      // Delete existing and insert new
      await supabase.from('regions').delete().eq('site_id', SITE_ID)
      if (regions.length > 0) {
        const { error } = await supabase
          .from('regions')
          .insert(regions.map((r, i) => ({ ...r, site_id: SITE_ID, order_index: i + 1 })))
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Regioes salvas com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar regioes' })
    } finally {
      setSaving(false)
    }
  }

  const saveWhatsapp = async () => {
    setSaving(true)
    try {
      await supabase.from('whatsapp_numbers').delete().eq('site_id', SITE_ID)
      if (whatsappNumbers.length > 0) {
        const { error } = await supabase
          .from('whatsapp_numbers')
          .insert(whatsappNumbers.map((w, i) => ({ ...w, site_id: SITE_ID, order_index: i + 1 })))
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Numeros WhatsApp salvos com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar numeros' })
    } finally {
      setSaving(false)
    }
  }

  const saveOffers = async () => {
    setSaving(true)
    try {
      await supabase.from('site_offers').delete().eq('site_id', SITE_ID)
      if (offers.length > 0) {
        const { error } = await supabase
          .from('site_offers')
          .insert(offers.map((o, i) => ({ ...o, site_id: SITE_ID, order_index: i + 1 })))
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Ofertas salvas com sucesso!' })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar ofertas' })
    } finally {
      setSaving(false)
    }
  }

  

  const tabs = [
    { id: 'settings' as Tab, label: 'Configuracoes', icon: Settings },
    { id: 'regions' as Tab, label: 'Regioes', icon: MapPin },
    { id: 'whatsapp' as Tab, label: 'WhatsApp', icon: MessageCircle },
    { id: 'offers' as Tab, label: 'Ofertas', icon: Tag },
  ]

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Integracoes</h1>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--orange-primary)] text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-[var(--orange-primary)]" size={32} />
        </div>
      ) : (
        <>
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Site</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL do Logo</label>
                  <input
                    type="text"
                    value={settings.logo_url}
                    onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={settings.telefone_principal}
                    onChange={(e) => setSettings({ ...settings, telefone_principal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp Principal</label>
                  <input
                    type="text"
                    value={settings.whatsapp_principal}
                    onChange={(e) => setSettings({ ...settings, whatsapp_principal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email de Contato</label>
                  <input
                    type="email"
                    value={settings.email_contato}
                    onChange={(e) => setSettings({ ...settings, email_contato: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Endereco da Empresa</label>
                  <input
                    type="text"
                    value={settings.endereco_empresa}
                    onChange={(e) => setSettings({ ...settings, endereco_empresa: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--orange-primary)] text-white rounded-lg hover:bg-[var(--orange-dark)] disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Configuracoes'}
              </button>
            </div>
          )}

          {/* Regions Tab */}
          {activeTab === 'regions' && (
            <div className="space-y-4">
              <button
                onClick={() => setRegions([...regions, { site_id: SITE_ID, name: '', active: true, order_index: regions.length + 1 }])}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={18} />
                Adicionar Regiao
              </button>
              <div className="space-y-2">
                {regions.map((region, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                    <input
                      type="text"
                      value={region.name}
                      onChange={(e) => {
                        const updated = [...regions]
                        updated[index].name = e.target.value
                        setRegions(updated)
                      }}
                      placeholder="Nome da regiao"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={region.active}
                        onChange={(e) => {
                          const updated = [...regions]
                          updated[index].active = e.target.checked
                          setRegions(updated)
                        }}
                      />
                      Ativo
                    </label>
                    <button
                      onClick={() => setRegions(regions.filter((_, i) => i !== index))}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={saveRegions}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--orange-primary)] text-white rounded-lg hover:bg-[var(--orange-dark)] disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Regioes'}
              </button>
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <button
                onClick={() => setWhatsappNumbers([...whatsappNumbers, { 
                  site_id: SITE_ID, 
                  number: '', 
                  label: '', 
                  active: true, 
                  click_count: 0,
                  order_index: whatsappNumbers.length + 1,
                  peso_distribuicao: 50000,
                  state_code: '',
                  rotation_interval_minutes: 0,
                  is_forced: false
                }])}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={18} />
                Adicionar Numero
              </button>
              <div className="space-y-2">
                {whatsappNumbers.map((num, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={num.number}
                        onChange={(e) => {
                          const updated = [...whatsappNumbers]
                          updated[index].number = e.target.value
                          setWhatsappNumbers(updated)
                        }}
                        placeholder="Numero (ex: 5511999999999)"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={num.label}
                        onChange={(e) => {
                          const updated = [...whatsappNumbers]
                          updated[index].label = e.target.value
                          setWhatsappNumbers(updated)
                        }}
                        placeholder="Label/Nome"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={num.peso_distribuicao}
                        onChange={(e) => {
                          const updated = [...whatsappNumbers]
                          updated[index].peso_distribuicao = Number(e.target.value)
                          setWhatsappNumbers(updated)
                        }}
                        placeholder="Peso distribuicao"
                        className="px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={num.active}
                          onChange={(e) => {
                            const updated = [...whatsappNumbers]
                            updated[index].active = e.target.checked
                            setWhatsappNumbers(updated)
                          }}
                        />
                        Ativo
                      </label>
                      <span className="text-sm text-muted-foreground">Cliques: {num.click_count}</span>
                      <button
                        onClick={() => setWhatsappNumbers(whatsappNumbers.filter((_, i) => i !== index))}
                        className="ml-auto p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={saveWhatsapp}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--orange-primary)] text-white rounded-lg hover:bg-[var(--orange-dark)] disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Numeros WhatsApp'}
              </button>
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div className="space-y-4">
              <button
                onClick={() => setOffers([...offers, { 
                  site_id: SITE_ID, 
                  title: '', 
                  description: '', 
                  badge: '',
                  price_current: 0,
                  price_original: 0,
                  active: true,
                  order_index: offers.length + 1
                }])}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={18} />
                Adicionar Oferta
              </button>
              <div className="space-y-2">
                {offers.map((offer, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={offer.title}
                        onChange={(e) => {
                          const updated = [...offers]
                          updated[index].title = e.target.value
                          setOffers(updated)
                        }}
                        placeholder="Titulo da oferta"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={offer.badge}
                        onChange={(e) => {
                          const updated = [...offers]
                          updated[index].badge = e.target.value
                          setOffers(updated)
                        }}
                        placeholder="Badge (ex: -20%)"
                        className="px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <textarea
                      value={offer.description}
                      onChange={(e) => {
                        const updated = [...offers]
                        updated[index].description = e.target.value
                        setOffers(updated)
                      }}
                      placeholder="Descricao"
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Preco Atual</label>
                        <input
                          type="number"
                          value={offer.price_current}
                          onChange={(e) => {
                            const updated = [...offers]
                            updated[index].price_current = Number(e.target.value)
                            setOffers(updated)
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Preco Original</label>
                        <input
                          type="number"
                          value={offer.price_original}
                          onChange={(e) => {
                            const updated = [...offers]
                            updated[index].price_original = Number(e.target.value)
                            setOffers(updated)
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={offer.active}
                          onChange={(e) => {
                            const updated = [...offers]
                            updated[index].active = e.target.checked
                            setOffers(updated)
                          }}
                        />
                        Ativo
                      </label>
                      <button
                        onClick={() => setOffers(offers.filter((_, i) => i !== index))}
                        className="p-2 text-red-600 hover:bg-red-100 rounded self-center justify-self-end"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={saveOffers}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--orange-primary)] text-white rounded-lg hover:bg-[var(--orange-dark)] disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Ofertas'}
              </button>
            </div>
          )}

          
        </>
      )}
    </div>
  )
}
