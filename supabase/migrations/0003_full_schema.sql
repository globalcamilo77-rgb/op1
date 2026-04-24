-- Migration 0003: completa o schema do AlfaConstrução com analytics, ad_spends e appearance.
-- Pode rodar mesmo se ja rodou a 0001 e 0002 (e idempotente).
--
-- Atencao: as policies abaixo permitem escrita anonima (pois o admin do site usa auth local).
-- Em producao, troque para auth.role() = 'authenticated' e mova o admin para Supabase Auth.

create extension if not exists "pgcrypto";

-- ============ products: garantir coluna subcategory ============
alter table public.products
  add column if not exists subcategory text;

-- ============ analytics_events ============
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

-- ============ ad_spends ============
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

-- ============ appearance_settings (singleton id=1) ============
create table if not exists public.appearance_settings (
  id integer primary key default 1,
  brand_name text not null default 'Alfa',
  brand_highlight text not null default 'Construção',
  brand_suffix text not null default ', O Mercado da Construcao',
  logo_url text,
  primary_color text not null default '#ff9900',
  primary_dark_color text not null default '#e68900',
  notification_bar_enabled boolean not null default true,
  notification_bar_text text not null default 'Compre pelo (11) 4572-4545 ou ligue 08003336272 | Orcamento Relampago',
  featured_eyebrow text not null default 'Produtos em destaque',
  featured_title text not null default 'Ofertas ativas da AlfaConstrução',
  featured_subtitle text not null default 'Os melhores precos para a sua obra, com entrega rapida.',
  footer_company text not null default 'AlfaConstrução',
  footer_copyright text not null default '(c) 2026 | AlfaConstrução - Todos os direitos reservados',
  footer_phone text not null default '0800 333 6722',
  footer_whatsapp text not null default '551145724545',
  footer_email text not null default 'contato@alfaconstrucao.com.br',
  updated_at timestamptz not null default now(),
  check (id = 1)
);

insert into public.appearance_settings (id) values (1)
on conflict (id) do nothing;

-- ============ RLS ============
alter table public.analytics_events enable row level security;
alter table public.ad_spends enable row level security;
alter table public.appearance_settings enable row level security;

-- analytics_events: insert publico (qualquer visitante envia eventos), leitura/edicao livre.
drop policy if exists "analytics_events: public insert" on public.analytics_events;
create policy "analytics_events: public insert"
  on public.analytics_events for insert
  with check (true);

drop policy if exists "analytics_events: public read" on public.analytics_events;
create policy "analytics_events: public read"
  on public.analytics_events for select
  using (true);

drop policy if exists "analytics_events: public update" on public.analytics_events;
create policy "analytics_events: public update"
  on public.analytics_events for update
  using (true)
  with check (true);

drop policy if exists "analytics_events: public delete" on public.analytics_events;
create policy "analytics_events: public delete"
  on public.analytics_events for delete
  using (true);

-- ad_spends: leitura/escrita anonimas (admin local).
drop policy if exists "ad_spends: anon all" on public.ad_spends;
create policy "ad_spends: anon all"
  on public.ad_spends for all
  using (true)
  with check (true);

-- appearance_settings: leitura publica, escrita anonima (admin local).
drop policy if exists "appearance: public read" on public.appearance_settings;
create policy "appearance: public read"
  on public.appearance_settings for select
  using (true);

drop policy if exists "appearance: anon write" on public.appearance_settings;
create policy "appearance: anon write"
  on public.appearance_settings for all
  using (true)
  with check (true);
