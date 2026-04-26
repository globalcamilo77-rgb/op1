-- Conteudo customizavel de Landing Page por produto.
-- Quando enabled = true, a rota /p/[productId] renderiza a LP rica
-- (hero, galeria, video, beneficios, descricao longa, CTA WhatsApp).
-- Quando enabled = false, /p/[productId] cai no template padrao com
-- apenas os dados de products (name, image, price, description).

create table if not exists public.product_landing_pages (
  product_id text primary key,
  enabled boolean not null default false,
  headline text,
  subheadline text,
  hero_image text,
  gallery jsonb not null default '[]'::jsonb,
  video_url text,
  benefits jsonb not null default '[]'::jsonb,
  long_description text,
  cta_text text,
  cta_message text,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

alter table public.product_landing_pages enable row level security;

drop policy if exists "product_lp: anon all" on public.product_landing_pages;
create policy "product_lp: anon all"
  on public.product_landing_pages for all
  using (true) with check (true);

create index if not exists product_lp_enabled_idx
  on public.product_landing_pages (enabled);
