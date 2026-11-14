-- DATABASE PONDOK PESANTREN HIDAYATUL MA'MUN
-- Jalankan seluruh SQL ini di Supabase > SQL Editor.
-- Keamanan: RLS aktif. Tidak ada akses publik ke tabel santri.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin'))
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  nis text not null unique,
  full_name text not null,
  gender text not null check (gender in ('Putra','Putri')),
  class_name text,
  birth_place text,
  birth_date date,
  entry_year integer,
  status text not null default 'Aktif' check (status in ('Aktif','Alumni','Nonaktif')),
  address text,
  guardian_name text,
  guardian_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.students enable row level security;

-- Admin hanya dapat membaca profilnya sendiri.
drop policy if exists "Admin read own profile" on public.profiles;
create policy "Admin read own profile" on public.profiles
for select to authenticated
using (id = (select auth.uid()) and public.is_admin());

-- Hanya admin terdaftar dapat mengelola database santri.
drop policy if exists "Admins manage students" on public.students;
create policy "Admins manage students" on public.students
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Tidak membuat policy untuk anon/public: data santri tidak dapat dibaca publik.
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.students to authenticated;
revoke all on public.students from anon;
revoke all on public.profiles from anon;

-- Setelah membuat user di Authentication > Users, jalankan:
-- Ganti UUID dengan User UID akun admin yang dibuat.
-- insert into public.profiles (id, role) values ('UUID-USER-ADMIN', 'admin');
