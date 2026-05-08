-- ============================================================
-- Dar Baraï / Dar Tanawi – Schéma Supabase
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_net";  -- pour webhooks HTTP (optionnel)

-- ============================================================
-- PROFILES
-- Étend auth.users avec des données métier
-- ============================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  phone           text,
  avatar_url      text,
  role            text not null default 'client' check (role in ('client', 'admin')),
  newsletter_subscribed boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Trigger: créer le profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- RIADS
-- ============================================================
create table public.riads (
  id                      uuid primary key default uuid_generate_v4(),
  slug                    text not null unique check (slug in ('dar-barai', 'dar-tanawi')),
  name                    text not null,
  name_en                 text,
  description             text,
  description_en          text,
  cover_image             text,
  images                  text[] not null default '{}',
  max_guests              int not null default 8,
  base_price_per_night    int not null,  -- centimes EUR
  ical_airbnb_url         text,
  ical_booking_url        text,
  created_at              timestamptz not null default now()
);

-- Seed des 2 riads
insert into public.riads (slug, name, name_en, description, description_en, max_guests, base_price_per_night)
values
  (
    'dar-barai',
    'Dar Baraï',
    'Dar Baraï',
    'Un riad authentique au cœur de la médina de Marrakech, avec piscine et vue sur les toits.',
    'An authentic riad in the heart of Marrakech medina, with pool and rooftop views.',
    10,
    25000  -- 250 €
  ),
  (
    'dar-tanawi',
    'Dar Tanawi',
    'Dar Tanawi',
    'Un havre de paix alliant architecture traditionnelle et confort contemporain.',
    'A peaceful haven blending traditional architecture with contemporary comfort.',
    8,
    20000  -- 200 €
  );

-- ============================================================
-- AVAILABILITY
-- Créneaux bloqués (Airbnb, Booking, admin)
-- ============================================================
create table public.availability (
  id          uuid primary key default uuid_generate_v4(),
  riad_id     uuid not null references public.riads(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  source      text not null default 'admin' check (source in ('admin', 'airbnb', 'booking', 'reservation')),
  label       text,
  created_at  timestamptz not null default now(),
  constraint  no_overlap check (start_date < end_date)
);

create index idx_availability_riad_dates on public.availability(riad_id, start_date, end_date);

-- ============================================================
-- RESERVATIONS
-- ============================================================
create table public.reservations (
  id                        uuid primary key default uuid_generate_v4(),
  riad_id                   uuid not null references public.riads(id),
  user_id                   uuid not null references public.profiles(id),
  check_in                  date not null,
  check_out                 date not null,
  guests                    int not null check (guests > 0),
  total_price               int not null,  -- centimes EUR
  status                    text not null default 'pending'
                              check (status in ('pending', 'confirmed', 'cancelled', 'refunded')),
  stripe_payment_intent_id  text unique,
  special_requests          text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint                check_out_after_check_in check (check_out > check_in)
);

create index idx_reservations_user on public.reservations(user_id);
create index idx_reservations_riad on public.reservations(riad_id);
create index idx_reservations_status on public.reservations(status);

-- Trigger: updated_at automatique
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reservations_updated_at
  before update on public.reservations
  for each row execute procedure public.set_updated_at();

-- Quand une réservation est confirmée → bloquer les dates dans availability
create or replace function public.block_dates_on_confirmation()
returns trigger language plpgsql security definer
as $$
begin
  if new.status = 'confirmed' and (old.status is distinct from 'confirmed') then
    insert into public.availability (riad_id, start_date, end_date, source, label)
    values (new.riad_id, new.check_in, new.check_out, 'reservation', 'Réservation #' || new.id::text);
  end if;

  -- Si annulation → supprimer le bloc correspondant
  if new.status in ('cancelled', 'refunded') and old.status = 'confirmed' then
    delete from public.availability
    where riad_id = new.riad_id
      and start_date = new.check_in
      and end_date = new.check_out
      and source = 'reservation';
  end if;

  return new;
end;
$$;

create trigger on_reservation_status_change
  after update of status on public.reservations
  for each row execute procedure public.block_dates_on_confirmation();

-- ============================================================
-- NEWSLETTERS_SENT
-- ============================================================
create table public.newsletters_sent (
  id                uuid primary key default uuid_generate_v4(),
  subject           text not null,
  subject_en        text,
  content_html      text not null,
  content_html_en   text,
  sent_at           timestamptz not null default now(),
  recipients_count  int not null default 0,
  sent_by           uuid references public.profiles(id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.riads enable row level security;
alter table public.availability enable row level security;
alter table public.reservations enable row level security;
alter table public.newsletters_sent enable row level security;

-- Profiles
create policy "Lecture profil propre" on public.profiles
  for select using (auth.uid() = id);
create policy "Mise à jour profil propre" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admin: lecture tous profils" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Riads: lecture publique
create policy "Riads publics" on public.riads
  for select using (true);
create policy "Admin: gestion riads" on public.riads
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Availability: lecture publique
create policy "Availability publique" on public.availability
  for select using (true);
create policy "Admin: gestion availability" on public.availability
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Reservations
create policy "Lecture réservations propres" on public.reservations
  for select using (auth.uid() = user_id);
create policy "Création réservation propre" on public.reservations
  for insert with check (auth.uid() = user_id);
create policy "Admin: toutes réservations" on public.reservations
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Newsletters: admin only
create policy "Admin: newsletters" on public.newsletters_sent
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
