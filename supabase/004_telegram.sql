-- Radar SECOP: avisos por Telegram (planes de pago)
-- Ejecutar UNA vez en: Supabase > Editor SQL (es seguro repetirlo)

alter table public.profiles
  add column if not exists telegram_chat_id bigint,
  add column if not exists telegram_link_code text,
  add column if not exists telegram_link_expires timestamptz;

-- Un chat de Telegram solo puede estar vinculado a una cuenta
create unique index if not exists profiles_telegram_chat_idx
  on public.profiles (telegram_chat_id) where telegram_chat_id is not null;
create index if not exists profiles_telegram_code_idx
  on public.profiles (telegram_link_code) where telegram_link_code is not null;
