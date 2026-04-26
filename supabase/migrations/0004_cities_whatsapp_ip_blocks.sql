-- Migration 0004: cidades publicas, contatos WhatsApp globais, bloqueios de IP, log de webhooks PIX.
-- Idempotente. RLS aberto (escrita anonima) seguindo padrao das migrations anteriores.

create extension if not exists "pgcrypto";

-- ============ cities ============
-- Cada cidade vira uma LP customizada acessivel em /cidade/[slug].
create table if not exists public.cities (
  id text primary key,
  slug text not null unique,
  city_name text not null,
  uf text not null default 'SP',
  active boolean not null default true,
  hero_title text,
  hero_subtitle text,
  highlight text,
  cta_label text,
  utm_source text default 'google',
  utm_medium text default 'cpc',
  utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cities_slug_idx on public.cities (slug);
create index if not exists cities_active_idx on public.cities (active);

-- ============ city_contacts ============
-- WhatsApps de cada cidade (rotacao por blocos de cliques).
create table if not exists public.city_contacts (
  id text primary key,
  city_id text not null references public.cities(id) on delete cascade,
  label text not null default 'Atendimento',
  number text not null,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists city_contacts_city_idx on public.city_contacts (city_id);

-- ============ whatsapp_contacts (globais) ============
-- Numeros que aparecem fora do contexto de cidade.
create table if not exists public.whatsapp_contacts (
  id text primary key,
  label text not null default 'WhatsApp',
  number text not null,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists whatsapp_contacts_active_idx on public.whatsapp_contacts (active);

-- ============ ip_blocks ============
-- IPs temporariamente bloqueados de checkout/popups.
create table if not exists public.ip_blocks (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  reason text not null default 'pix_aprovado',
  source text not null default 'auto',
  manual boolean not null default false,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ip_blocks_ip_idx on public.ip_blocks (ip);
create index if not exists ip_blocks_expires_idx on public.ip_blocks (expires_at);

-- ============ pix_webhook_log ============
-- Auditoria de notificacoes recebidas do gateway PIX.
create table if not exists public.pix_webhook_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  client_ip text,
  user_agent text,
  pix_id text,
  amount numeric(12,2),
  customer_name text,
  customer_email text,
  customer_phone text,
  ip_block_id uuid references public.ip_blocks(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pix_webhook_log_pix_idx on public.pix_webhook_log (pix_id);
create index if not exists pix_webhook_log_event_idx on public.pix_webhook_log (event_type, created_at desc);
create index if not exists pix_webhook_log_ip_idx on public.pix_webhook_log (client_ip);

-- ============ RLS ============
alter table public.cities enable row level security;
alter table public.city_contacts enable row level security;
alter table public.whatsapp_contacts enable row level security;
alter table public.ip_blocks enable row level security;
alter table public.pix_webhook_log enable row level security;

drop policy if exists "cities: anon all" on public.cities;
create policy "cities: anon all" on public.cities for all using (true) with check (true);

drop policy if exists "city_contacts: anon all" on public.city_contacts;
create policy "city_contacts: anon all" on public.city_contacts for all using (true) with check (true);

drop policy if exists "whatsapp_contacts: anon all" on public.whatsapp_contacts;
create policy "whatsapp_contacts: anon all" on public.whatsapp_contacts for all using (true) with check (true);

drop policy if exists "ip_blocks: anon all" on public.ip_blocks;
create policy "ip_blocks: anon all" on public.ip_blocks for all using (true) with check (true);

drop policy if exists "pix_webhook_log: anon all" on public.pix_webhook_log;
create policy "pix_webhook_log: anon all" on public.pix_webhook_log for all using (true) with check (true);
