-- Radar SECOP: límite de intentos de registro/ingreso (anti-bots)
create table if not exists public.auth_intentos (
  id bigserial primary key,
  ip_hash text not null,
  email_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists auth_intentos_ip_idx on public.auth_intentos (ip_hash, created_at desc);
create index if not exists auth_intentos_email_idx on public.auth_intentos (email_hash, created_at desc);
alter table public.auth_intentos enable row level security; -- sin políticas: solo el servidor (service role) accede
