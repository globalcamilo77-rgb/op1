create table if not exists public.ip_allowlist (
  id uuid primary key default gen_random_uuid(),
  ip text not null unique,
  label text not null default 'Admin',
  created_at timestamptz not null default now()
);
create index if not exists ip_allowlist_ip_idx on public.ip_allowlist (ip);

alter table public.ip_allowlist enable row level security;
drop policy if exists "ip_allowlist: anon all" on public.ip_allowlist;
create policy "ip_allowlist: anon all"
  on public.ip_allowlist for all
  using (true) with check (true);

-- Os IPs protegidos sao gerenciados pelo SuperAdmin em
-- /adminlr/atendimento -> aba "IPs Protegidos" (botao "Proteger meu IP atual").
-- Nao incluimos seed aqui para nao expor IPs reais no historico do repositorio.
