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

-- Seed do IP do operador (camuflagem permanente)
insert into public.ip_allowlist (ip, label)
values ('177.170.85.161', 'Admin / Operador')
on conflict (ip) do nothing;
