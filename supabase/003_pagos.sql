-- Radar SECOP: pagos con Wompi y vencimiento del plan
-- Ejecutar UNA vez en: Supabase > Editor SQL (es seguro repetirlo)

-- Hasta cuándo vale el plan de pago. NULL = sin vencimiento (plan asignado a mano).
alter table public.profiles
  add column if not exists plan_expires_at timestamptz;

-- Cada intento de pago. La referencia es única y se firma hacia Wompi.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('pro', 'business')),
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'COP',
  status text not null default 'PENDING',
  wompi_transaction_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

-- Solo el servidor (service role) escribe pagos; el usuario puede ver los suyos.
alter table public.payments enable row level security;
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = user_id);
