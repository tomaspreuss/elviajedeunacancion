create extension if not exists "pgcrypto";

create table if not exists public.postulaciones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  musica_presente text not null,
  cancion text not null,
  interes_taller text not null,
  ciudad text not null,
  email text not null,
  haciendo_canciones text not null,
  parte_dificil text not null,
  modalidad text not null,
  expectativas text,
  link_musica text
);

alter table public.postulaciones enable row level security;

drop policy if exists "anon can insert postulaciones" on public.postulaciones;

create policy "anon can insert postulaciones"
on public.postulaciones
for insert
to public
with check (true);

grant usage on schema public to anon, authenticated;
grant insert on table public.postulaciones to anon, authenticated;
