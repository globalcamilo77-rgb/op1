-- Migration 0005: deteccao de rotacao de IP
-- Registra fingerprint do cliente (cookie alfa-cid) com IP + UA por request.
-- Se o mesmo client_id aparece em 3+ IPs distintos em 30 min, todos viram bloqueados auto.

create table if not exists public.client_fingerprints (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  ip text not null,
  user_agent text,
  path text,
  created_at timestamptz not null default now()
);

create index if not exists client_fingerprints_cid_idx
  on public.client_fingerprints (client_id, created_at desc);
create index if not exists client_fingerprints_ip_idx
  on public.client_fingerprints (ip);
create index if not exists client_fingerprints_created_idx
  on public.client_fingerprints (created_at desc);

alter table public.client_fingerprints enable row level security;

drop policy if exists "client_fingerprints: anon all" on public.client_fingerprints;
create policy "client_fingerprints: anon all"
  on public.client_fingerprints for all
  using (true) with check (true);

select 'migration 0005 OK' as status;
