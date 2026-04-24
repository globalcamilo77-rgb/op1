-- Libera escrita anonima nas tabelas de catalogo / configuracao.
-- O painel admin do projeto usa autenticacao local (Zustand), nao Supabase Auth,
-- por isso, com a chave anon, e necessario permitir INSERT/UPDATE/DELETE explicitamente.
--
-- ATENCAO: rode SOMENTE em ambientes onde a chave anon nao seja exposta a usuarios finais
-- nao confiaveis, OU coloque um proxy/edge function na frente do CRUD em producao.

-- ============ products ============
drop policy if exists "products: authenticated write" on public.products;
drop policy if exists "products: anon write" on public.products;
create policy "products: anon write"
  on public.products for all
  using (true)
  with check (true);

-- ============ whatsapp_contacts ============
drop policy if exists "whatsapp_contacts: authenticated write" on public.whatsapp_contacts;
drop policy if exists "whatsapp_contacts: anon write" on public.whatsapp_contacts;
create policy "whatsapp_contacts: anon write"
  on public.whatsapp_contacts for all
  using (true)
  with check (true);

-- Leitura publica completa (sem filtro de active) para o painel admin enxergar inativos.
drop policy if exists "whatsapp_contacts: public read" on public.whatsapp_contacts;
create policy "whatsapp_contacts: public read"
  on public.whatsapp_contacts for select
  using (true);

-- ============ whatsapp_settings ============
drop policy if exists "whatsapp_settings: authenticated write" on public.whatsapp_settings;
drop policy if exists "whatsapp_settings: anon write" on public.whatsapp_settings;
create policy "whatsapp_settings: anon write"
  on public.whatsapp_settings for all
  using (true)
  with check (true);

-- ============ service_areas ============
drop policy if exists "service_areas: anon write" on public.service_areas;
create policy "service_areas: anon write"
  on public.service_areas for all
  using (true)
  with check (true);
