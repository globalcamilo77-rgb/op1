-- Adiciona coluna external_reference na tabela orders
-- Usada para correlacionar o pixOrderId (ex: OBMOFJ118V7FUZO7) com o pedido
-- Isso permite que o /api/pix/status encontre o pedido quando a Koliseu
-- retorna o externalReference no payload de confirmacao

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS external_reference TEXT;

-- Cria indice para buscas rapidas
CREATE INDEX IF NOT EXISTS idx_orders_external_reference ON orders(external_reference);

-- Comentario na coluna
COMMENT ON COLUMN orders.external_reference IS 'ID externo usado na integracao com gateway de pagamento (ex: Koliseu externalReference)';
