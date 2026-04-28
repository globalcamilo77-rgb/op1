'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Ban, Check, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface IpBlock {
  id: string
  ip: string
  reason: string
  source: string
  created_at: string
  expires_at: string | null
  metadata: Record<string, unknown>
}

interface IpLog {
  ip: string
  path: string
  user_agent: string
  created_at: string
  count: number
}

export default function IpsPage() {
  const [blockedIps, setBlockedIps] = useState<IpBlock[]>([])
  const [ipLogs, setIpLogs] = useState<IpLog[]>([])
  const [loading, setLoading] = useState(true)
  const [newIp, setNewIp] = useState('')
  const [reason, setReason] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      // Busca IPs bloqueados
      const blockedRes = await fetch('/api/ip-blocks/list')
      if (blockedRes.ok) {
        const data = await blockedRes.json()
        setBlockedIps(data.blocks || [])
      }
      
      // Busca logs de IPs (ultimas visitas)
      const logsRes = await fetch('/api/ip-blocks/logs')
      if (logsRes.ok) {
        const data = await logsRes.json()
        setIpLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBlockIp = async (ip: string, blockReason?: string) => {
    try {
      const res = await fetch('/api/ip-blocks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip,
          reason: blockReason || reason || 'manual',
          source: 'manual',
        }),
      })
      if (res.ok) {
        setNewIp('')
        setReason('')
        fetchData()
      }
    } catch (err) {
      console.error('Erro ao bloquear IP:', err)
    }
  }

  const handleUnblockIp = async (id: string) => {
    try {
      const res = await fetch(`/api/ip-blocks/remove?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Erro ao desbloquear IP:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/adminlr">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Gerenciar IPs</h1>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
        </div>

        {/* Bloquear novo IP */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bloquear IP Manualmente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: 192.168.1.1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="max-w-xs"
              />
              <Input
                placeholder="Motivo (opcional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={() => handleBlockIp(newIp)} disabled={!newIp.trim()}>
                <Ban size={16} className="mr-2" />
                Bloquear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* IPs Bloqueados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ban size={20} className="text-red-500" />
              IPs Bloqueados ({blockedIps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockedIps.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum IP bloqueado.</p>
            ) : (
              <div className="space-y-2">
                {blockedIps.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900"
                  >
                    <div>
                      <span className="font-mono font-semibold">{block.ip}</span>
                      <span className="text-sm text-muted-foreground ml-3">
                        {block.reason} - {block.source}
                      </span>
                      <span className="text-xs text-muted-foreground ml-3">
                        {new Date(block.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnblockIp(block.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check size={16} className="mr-1" />
                      Desbloquear
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs de IPs (visitantes recentes) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">IPs Recentes (Visitantes)</CardTitle>
          </CardHeader>
          <CardContent>
            {ipLogs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum log de IP ainda.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ipLogs.map((log, i) => (
                  <div
                    key={`${log.ip}-${i}`}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="font-mono font-semibold">{log.ip}</span>
                      <span className="text-sm text-muted-foreground ml-3">
                        {log.path}
                      </span>
                      <div className="text-xs text-muted-foreground truncate max-w-md">
                        {log.user_agent}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBlockIp(log.ip, 'suspeito')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Ban size={14} className="mr-1" />
                        Bloquear
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
