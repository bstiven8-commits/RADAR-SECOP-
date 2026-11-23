-- Radar SECOP: frecuencia de alarmas
-- Ejecutar UNA vez en: Supabase > Editor SQL (es seguro repetirlo)

alter table public.alarms
  add column if not exists frequency text not null default 'daily';

alter table public.alarms
  add column if not exists last_checked_at timestamptz;

alter table public.alarms drop constraint if exists alarms_frequency_check;
alter table public.alarms
  add constraint alarms_frequency_check check (frequency in ('daily', 'hourly', '15min'));
