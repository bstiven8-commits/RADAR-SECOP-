-- Radar SECOP: esquema de base de datos (Supabase / Postgres)
-- Ejecutar completo en: Supabase > SQL Editor

create extension if not exists pgcrypto;

-- Perfil por usuario (el plan decide límites y, más adelante, cobros)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  created_at timestamptz not null default now()
);

-- Alarmas: un conjunto de filtros guardado por el usuario
create table if not exists public.alarms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  filters jsonb not null,
  active boolean not null default true,
  baselined boolean not null default false, -- true tras la primera corrida silenciosa
  created_at timestamptz not null default now()
);
create index if not exists alarms_user_idx on public.alarms (user_id);
create index if not exists alarms_active_idx on public.alarms (active) where active;

-- Procesos ya notificados por alarma (evita correos duplicados)
create table if not exists public.alarm_hits (
  alarm_id uuid not null references public.alarms(id) on delete cascade,
  process_key text not null,
  notified_at timestamptz not null default now(),
  primary key (alarm_id, process_key)
);

-- Crear el perfil automáticamente cuando alguien se registra por correo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seguridad por filas: cada usuario solo ve lo suyo.
-- El servidor (cron y API) usa la service role key, que ignora RLS.
alter table public.profiles enable row level security;
alter table public.alarms enable row level security;
alter table public.alarm_hits enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "alarms_select_own" on public.alarms;
create policy "alarms_select_own" on public.alarms
  for select using (auth.uid() = user_id);

drop policy if exists "alarms_delete_own" on public.alarms;
create policy "alarms_delete_own" on public.alarms
  for delete using (auth.uid() = user_id);
-- Las altas y cambios de alarmas pasan por /api/alarms (valida límites del plan).
