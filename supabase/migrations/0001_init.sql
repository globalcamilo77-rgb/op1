-- Migration inicial do AlfaConstrução.
-- Rode isso uma unica vez no editor SQL do Supabase (Database > SQL Editor).

-- Extensao para UUIDs (em geral ja vem ativada).
create extension if not exists "pgcrypto";

-- ============ Produtos ============
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  description text,
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products (active);
create index if not exists products_category_idx on public.products (category);

-- ============ WhatsApp rotativo ============
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

insert into public.whatsapp_settings (id)
values (1)
on conflict (id) do nothing;

-- ============ Pedidos ============
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

-- ============ Areas atendidas (opcional, para carregar dinamico) ============
create table if not exists public.service_areas (
  id serial primary key,
  city text not null unique,
  state text not null default 'SP',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ RLS ============
alter table public.products enable row level security;
alter table public.whatsapp_contacts enable row level security;
alter table public.whatsapp_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.service_areas enable row level security;

-- Leitura publica de dados do catalogo e areas atendidas.
drop policy if exists "products: public read" on public.products;
create policy "products: public read"
  on public.products for select
  using (true);

drop policy if exists "service_areas: public read" on public.service_areas;
create policy "service_areas: public read"
  on public.service_areas for select
  using (true);

drop policy if exists "whatsapp_contacts: public read" on public.whatsapp_contacts;
create policy "whatsapp_contacts: public read"
  on public.whatsapp_contacts for select
  using (active);

drop policy if exists "whatsapp_settings: public read" on public.whatsapp_settings;
create policy "whatsapp_settings: public read"
  on public.whatsapp_settings for select
  using (true);

-- Escrita: apenas usuarios autenticados (admin e superadmin usariam sessao do Supabase).
-- Para simplificar inicio, habilitamos escrita autenticada. Voce pode restringir por claims depois.
drop policy if exists "products: authenticated write" on public.products;
create policy "products: authenticated write"
  on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "whatsapp_contacts: authenticated write" on public.whatsapp_contacts;
create policy "whatsapp_contacts: authenticated write"
  on public.whatsapp_contacts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "whatsapp_settings: authenticated write" on public.whatsapp_settings;
create policy "whatsapp_settings: authenticated write"
  on public.whatsapp_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Pedidos: publico pode inserir (checkout). Apenas autenticados podem ler/atualizar.
drop policy if exists "orders: public insert" on public.orders;
create policy "orders: public insert"
  on public.orders for insert
  with check (true);

drop policy if exists "orders: authenticated read" on public.orders;
create policy "orders: authenticated read"
  on public.orders for select
  using (auth.role() = 'authenticated');

drop policy if exists "order_items: public insert" on public.order_items;
create policy "order_items: public insert"
  on public.order_items for insert
  with check (true);

drop policy if exists "order_items: authenticated read" on public.order_items;
create policy "order_items: authenticated read"
  on public.order_items for select
  using (auth.role() = 'authenticated');
