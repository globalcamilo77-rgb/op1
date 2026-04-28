-- Tabela para armazenar IPs bloqueados (anti-fraude e anti-bot)
CREATE TABLE IF NOT EXISTS ip_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  reason TEXT DEFAULT 'pix_aprovado',
  source TEXT DEFAULT 'auto' CHECK (source IN ('auto', 'manual')),
  manual BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para busca rapida por IP
CREATE INDEX IF NOT EXISTS idx_ip_blocks_ip ON ip_blocks(ip);

-- Indice para limpeza de bloqueios expirados
CREATE INDEX IF NOT EXISTS idx_ip_blocks_expires_at ON ip_blocks(expires_at);

-- Comentarios
COMMENT ON TABLE ip_blocks IS 'IPs bloqueados temporaria ou permanentemente';
COMMENT ON COLUMN ip_blocks.ip IS 'Endereco IP do cliente';
COMMENT ON COLUMN ip_blocks.reason IS 'Motivo do bloqueio (pix_aprovado, bot_detected, manual, etc)';
COMMENT ON COLUMN ip_blocks.source IS 'Origem do bloqueio: auto (sistema) ou manual (admin)';
COMMENT ON COLUMN ip_blocks.manual IS 'Se true, bloqueio foi feito manualmente pelo admin';
COMMENT ON COLUMN ip_blocks.expires_at IS 'Quando o bloqueio expira. NULL = permanente';
COMMENT ON COLUMN ip_blocks.metadata IS 'Dados extras (user_agent, ordem_id, etc)';
