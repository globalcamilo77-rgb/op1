'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, TrendingUp, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SearchLog {
  id: string
  query: string
  results_count: number
  ip: string
  created_at: string
}

interface PopularSearch {
  query: string
  count: number
  lastSearch: string
  avgResults: number
}

export default function PesquisasPage() {
  const [recent, setRecent] = useState<SearchLog[]>([])
  const [popular, setPopular] = useState<PopularSearch[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/search/list')
      if (res.ok) {
        const data = await res.json()
        setRecent(data.recent || [])
        setPopular(data.popular || [])
      }
    } catch (err) {
      console.error('Erro ao carregar pesquisas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/adminlr"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar
            </Link>
            <h1 className="text-2xl font-bold">Pesquisas dos Clientes</h1>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pesquisas mais populares */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp size={20} className="text-orange-500" />
                Mais Pesquisadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-zinc-500 text-center py-8">Carregando...</div>
              ) : popular.length === 0 ? (
                <div className="text-zinc-500 text-center py-8">
                  Nenhuma pesquisa ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {popular.map((item, idx) => (
                    <div
                      key={item.query}
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-orange-500 w-6">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-white">{item.query}</p>
                          <p className="text-xs text-zinc-500">
                            {item.avgResults === 0 ? (
                              <span className="text-red-400 flex items-center gap-1">
                                <AlertCircle size={12} />
                                Sem resultados - considere adicionar este produto!
                              </span>
                            ) : (
                              `Media de ${item.avgResults} resultados`
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{item.count}x</p>
                        <p className="text-xs text-zinc-500">buscas</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pesquisas recentes */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock size={20} className="text-blue-500" />
                Pesquisas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-zinc-500 text-center py-8">Carregando...</div>
              ) : recent.length === 0 ? (
                <div className="text-zinc-500 text-center py-8">
                  Nenhuma pesquisa ainda
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {recent.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Search size={14} className="text-zinc-500" />
                        <span className="text-white">{item.query}</span>
                        {item.results_count === 0 && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                            0 resultados
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">{formatDate(item.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dica */}
        <Card className="bg-orange-500/10 border-orange-500/30 mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-500 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-orange-500">Dica de vendas</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Pesquisas sem resultados indicam produtos que os clientes procuram mas voce ainda nao tem no catalogo. 
                  Considere adicionar esses produtos para aumentar suas vendas!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
