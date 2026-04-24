-- Tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  dimensions TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS para produtos (acesso publico para leitura)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Politica para leitura publica (todos podem ver produtos ativos)
CREATE POLICY "products_select_public" ON public.products 
  FOR SELECT USING (active = true);

-- Politica para admins (permitir todas as operacoes - usando service role)
CREATE POLICY "products_all_service" ON public.products 
  FOR ALL USING (true) WITH CHECK (true);

-- Funcao para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
