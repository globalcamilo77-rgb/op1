-- =====================================================================
-- AlfaConstrução - Setup completo do Supabase em 1 unico script.
-- Cole TUDO isso no SQL Editor do Supabase (Database > SQL Editor > New query)
-- e clique em RUN. Pode rodar mais de uma vez sem quebrar (idempotente).
--
-- O que faz:
--   1. Cria as tabelas (produtos, whatsapp, pedidos, analytics, ad_spends, appearance, service_areas)
--   2. Habilita RLS e deixa as policies ja prontas para o painel admin local
--   3. Faz seed inicial de whatsapp_settings e appearance_settings
-- =====================================================================

create extension if not exists "pgcrypto";

-- =========================== PRODUCTS ===========================
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  subcategory text,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  description text,
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products add column if not exists subcategory text;

create index if not exists products_active_idx on public.products (active);
create index if not exists products_category_idx on public.products (category);

-- =========================== WHATSAPP ===========================
create table if not exists public.whatsapp_contacts (
  id text primary key,
  label text not null,
  number text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_settings (
  id integer primary key default 1,
  default_message text not null default 'Ola AlfaConstrução, estou navegando no site e gostaria de ajuda!',
  rotation_interval_minutes integer not null default 15,
  updated_at timestamptz not null default now(),
  check (id = 1)
);
insert into public.whatsapp_settings (id) values (1) on conflict (id) do nothing;

-- =========================== ORDERS ===========================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  customer_email text,
  customer_phone text,
  address_raw text,
  city text,
  postal_code text,
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  category text,
  unit_price numeric(10,2) not null,
  quantity integer not null,
  image text
);

-- =========================== SERVICE AREAS ===========================
create table if not exists public.service_areas (
  id serial primary key,
  city text not null unique,
  state text not null default 'SP',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================== ANALYTICS EVENTS ===========================
create table if not exists public.analytics_events (
  id text primary key,
  type text not null,
  value numeric(12,2) not null default 0,
  meta jsonb not null default '{}'::jsonb,
  source text not null default 'direct',
  medium text not null default 'none',
  campaign text not null default 'none',
  path text,
  session_id text not null,
  ts timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_ts_idx on public.analytics_events (ts desc);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id);
create index if not exists analytics_events_campaign_idx on public.analytics_events (source, campaign);
create index if not exists analytics_events_type_idx on public.analytics_events (type);

-- =========================== AD SPENDS ===========================
create table if not exists public.ad_spends (
  id text primary key,
  campaign text not null,
  source text not null,
  amount numeric(12,2) not null default 0,
  start_date date not null default now()::date,
  end_date date not null default now()::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ad_spends_campaign_idx on public.ad_spends (source, campaign);

-- =========================== APPEARANCE SETTINGS ===========================
create table if not exists public.appearance_settings (
  id integer primary key default 1,
  brand_name text not null default 'Alfa',
  brand_highlight text not null default 'Construção',
  brand_suffix text not null default ', O Mercado da Construcao',
  logo_url text,
  primary_color text not null default '#ff9900',
  primary_dark_color text not null default '#e68900',
  notification_bar_enabled boolean not null default true,
  notification_bar_text text not null default 'Materiais de construcao com entrega rapida e melhor preco | Orcamento Relampago',
  featured_eyebrow text not null default 'Produtos em destaque',
  featured_title text not null default 'Ofertas ativas da AlfaConstrução',
  featured_subtitle text not null default 'Os melhores precos para a sua obra, com entrega rapida.',
  footer_company text not null default 'AlfaConstrução',
  footer_copyright text not null default '(c) 2026 | AlfaConstrução - Todos os direitos reservados',
  footer_phone text not null default '0800 333 6722',
  footer_whatsapp text not null default '',
  footer_email text not null default 'contato@alfaconstrucao.com.br',
  updated_at timestamptz not null default now(),
  check (id = 1)
);
insert into public.appearance_settings (id) values (1) on conflict (id) do nothing;

-- =========================== RLS + POLICIES ===========================
-- O painel admin do site usa autenticacao LOCAL (Zustand), nao Supabase Auth.
-- Por isso, com a chave anon, precisamos liberar escrita explicitamente.
-- Em producao com chave anon publica, considere mover o admin para Supabase Auth
-- e trocar essas policies por auth.role() = 'authenticated'.

alter table public.products            enable row level security;
alter table public.whatsapp_contacts   enable row level security;
alter table public.whatsapp_settings   enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.service_areas       enable row level security;
alter table public.analytics_events    enable row level security;
alter table public.ad_spends           enable row level security;
alter table public.appearance_settings enable row level security;

-- products: leitura publica + escrita anon
drop policy if exists "products: public read"  on public.products;
drop policy if exists "products: anon write"   on public.products;
drop policy if exists "products: authenticated write" on public.products;
create policy "products: public read"  on public.products for select using (true);
create policy "products: anon write"   on public.products for all    using (true) with check (true);

-- whatsapp_contacts
drop policy if exists "whatsapp_contacts: public read" on public.whatsapp_contacts;
drop policy if exists "whatsapp_contacts: anon write"  on public.whatsapp_contacts;
drop policy if exists "whatsapp_contacts: authenticated write" on public.whatsapp_contacts;
create policy "whatsapp_contacts: public read" on public.whatsapp_contacts for select using (true);
create policy "whatsapp_contacts: anon write"  on public.whatsapp_contacts for all    using (true) with check (true);

-- whatsapp_settings
drop policy if exists "whatsapp_settings: public read" on public.whatsapp_settings;
drop policy if exists "whatsapp_settings: anon write"  on public.whatsapp_settings;
drop policy if exists "whatsapp_settings: authenticated write" on public.whatsapp_settings;
create policy "whatsapp_settings: public read" on public.whatsapp_settings for select using (true);
create policy "whatsapp_settings: anon write"  on public.whatsapp_settings for all    using (true) with check (true);

-- orders / order_items: insert publico (visitante checkout) + leitura anon
drop policy if exists "orders: public insert" on public.orders;
drop policy if exists "orders: anon all"      on public.orders;
drop policy if exists "orders: authenticated read" on public.orders;
create policy "orders: anon all" on public.orders for all using (true) with check (true);

drop policy if exists "order_items: public insert" on public.order_items;
drop policy if exists "order_items: anon all"      on public.order_items;
drop policy if exists "order_items: authenticated read" on public.order_items;
create policy "order_items: anon all" on public.order_items for all using (true) with check (true);

-- service_areas
drop policy if exists "service_areas: public read" on public.service_areas;
drop policy if exists "service_areas: anon write"  on public.service_areas;
create policy "service_areas: public read" on public.service_areas for select using (true);
create policy "service_areas: anon write"  on public.service_areas for all    using (true) with check (true);

-- analytics_events: visitante anonimo INSERTA, admin LE/EDITA tudo
drop policy if exists "analytics_events: public insert" on public.analytics_events;
drop policy if exists "analytics_events: public read"   on public.analytics_events;
drop policy if exists "analytics_events: public update" on public.analytics_events;
drop policy if exists "analytics_events: public delete" on public.analytics_events;
create policy "analytics_events: public insert" on public.analytics_events for insert with check (true);
create policy "analytics_events: public read"   on public.analytics_events for select using (true);
create policy "analytics_events: public update" on public.analytics_events for update using (true) with check (true);
create policy "analytics_events: public delete" on public.analytics_events for delete using (true);

-- ad_spends
drop policy if exists "ad_spends: anon all" on public.ad_spends;
create policy "ad_spends: anon all" on public.ad_spends for all using (true) with check (true);

-- appearance_settings
drop policy if exists "appearance: public read" on public.appearance_settings;
drop policy if exists "appearance: anon write"  on public.appearance_settings;
create policy "appearance: public read" on public.appearance_settings for select using (true);
create policy "appearance: anon write"  on public.appearance_settings for all    using (true) with check (true);
