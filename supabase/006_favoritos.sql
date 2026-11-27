-- Radar SECOP: procesos guardados (favoritos) con estado de seguimiento
create table if not exists public.favoritos (
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('secop1','secop2')),
  proceso_id text not null,
  estado_seguimiento text not null default 'interesa' check (estado_seguimiento in ('interesa','postulado','descartado')),
  nota text not null default '' check (char_length(nota) <= 500),
  -- Copia de los datos al guardar, para mostrarlos sin volver a consultar SECOP
  objeto text not null default '',
  entidad text not null default '',
  valor numeric,
  cierre timestamptz,
  url text,
  created_at timestamptz not null default now(),
  primary key (user_id, source, proceso_id)
);
create index if not exists favoritos_user_idx on public.favoritos (user_id, created_at desc);
alter table public.favoritos enable row level security; -- sin políticas: solo el servidor (service role) accede
