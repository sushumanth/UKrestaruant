-- =====================================================
-- LuxeReserve Supabase setup (Final role-aware + realtime)
-- Run this whole file in Supabase SQL Editor.
-- =====================================================

begin;

-- 0) Role model for authenticated admin/staff users
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role'
      and n.nspname = 'public'
  ) then
    create type public.app_role as enum ('admin', 'staff');
  end if;
end $$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select ur.role
  from public.user_roles ur
  where ur.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'admin'::public.app_role, false);
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() in ('admin'::public.app_role, 'staff'::public.app_role), false);
$$;

grant execute on function public.current_app_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff_or_admin() to anon, authenticated;

-- 1) Shared trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- 2) Core tables
create table if not exists public.restaurant_tables (
  id text primary key,
  table_number integer not null unique,
  capacity integer not null check (capacity > 0),
  status text not null check (status in ('available', 'booked', 'reserved', 'seated', 'blocked')),
  x integer not null default 0,
  y integer not null default 0,
  shape text not null check (shape in ('round', 'square', 'rectangle')),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.restaurant_settings (
  id text primary key,
  name text not null,
  address text not null,
  phone text not null,
  email text not null,
  opening_time time not null,
  closing_time time not null,
  time_slot_interval integer not null check (time_slot_interval in (15, 30, 60)),
  default_deposit_amount numeric(10,2) not null default 5,
  cancellation_deadline_hours integer not null default 24,
  auto_release_minutes integer not null default 15,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.menu_items (
  id text primary key,
  category text not null,
  name text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  tags text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookings (
  id text primary key,
  booking_id text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  booking_date date not null,
  booking_time time not null,
  guests integer not null check (guests > 0),
  table_id text,
  table_number integer,
  status text not null check (status in ('pending', 'confirmed', 'arrived', 'seated', 'completed', 'cancelled', 'no_show')),
  special_requests text,
  deposit_amount numeric(10,2) not null default 5,
  payment_status text not null check (payment_status in ('pending', 'paid', 'refunded')),
  stripe_payment_intent_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Optional safety: add FK if not present
alter table public.bookings drop constraint if exists fk_bookings_table_id;
alter table public.bookings
  add constraint fk_bookings_table_id
  foreign key (table_id) references public.restaurant_tables(id)
  on delete set null;

-- 3) Updated-at triggers

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

drop trigger if exists trg_restaurant_tables_updated_at on public.restaurant_tables;
create trigger trg_restaurant_tables_updated_at
before update on public.restaurant_tables
for each row
execute function public.set_updated_at();

drop trigger if exists trg_restaurant_settings_updated_at on public.restaurant_settings;
create trigger trg_restaurant_settings_updated_at
before update on public.restaurant_settings
for each row
execute function public.set_updated_at();

drop trigger if exists trg_menu_items_updated_at on public.menu_items;
create trigger trg_menu_items_updated_at
before update on public.menu_items
for each row
execute function public.set_updated_at();

-- 4) Indexes
create index if not exists idx_bookings_date_time on public.bookings (booking_date, booking_time);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_email on public.bookings (customer_email);
create index if not exists idx_bookings_table_id on public.bookings (table_id);
create index if not exists idx_restaurant_tables_status on public.restaurant_tables (status);
create index if not exists idx_menu_items_category_active on public.menu_items (category, is_active, sort_order);

-- 5) Seed settings row
insert into public.restaurant_settings (
  id,
  name,
  address,
  phone,
  email,
  opening_time,
  closing_time,
  time_slot_interval,
  default_deposit_amount,
  cancellation_deadline_hours,
  auto_release_minutes
)
values (
  'settings-1',
  'LuxeReserve',
  '12 Royal Exchange, Manchester M2 7EA',
  '+44 (0)161 123 4567',
  'hello@luxereserve.co',
  '17:00',
  '23:00',
  30,
  5,
  24,
  15
)
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  opening_time = excluded.opening_time,
  closing_time = excluded.closing_time,
  time_slot_interval = excluded.time_slot_interval,
  default_deposit_amount = excluded.default_deposit_amount,
  cancellation_deadline_hours = excluded.cancellation_deadline_hours,
  auto_release_minutes = excluded.auto_release_minutes,
  updated_at = timezone('utc', now());

-- 6) Seed 50 floor-plan tables only if empty
insert into public.restaurant_tables (
  id,
  table_number,
  capacity,
  status,
  x,
  y,
  shape,
  width,
  height
)
select
  'table-' || g::text as id,
  g as table_number,
  case
    when g % 10 in (1,2,3,4,5) then 2
    when g % 10 in (6,7,8) then 4
    when g % 10 = 9 then 6
    else 8
  end as capacity,
  'available' as status,
  100 + ((g - 1) % 10) * 120 as x,
  100 + floor((g - 1) / 10.0)::int * 100 as y,
  case
    when g % 10 in (1,2,3,4,5,6,7,8) then 'round'
    when g % 10 = 9 then 'square'
    else 'rectangle'
  end as shape,
  case
    when g % 10 in (1,2,3,4,5,6,7,8) then 60
    when g % 10 = 9 then 70
    else 100
  end as width,
  case
    when g % 10 = 0 then 80
    else case
      when g % 10 in (1,2,3,4,5,6,7,8) then 60
      else 70
    end
  end as height
from generate_series(1, 50) g
where not exists (select 1 from public.restaurant_tables);

-- 7) Seed menu items (runs once unless IDs changed)
insert into public.menu_items (id, category, name, description, price, tags, sort_order)
values
  ('menu-st-1', 'starters', 'Seared Scallops', 'Cauliflower puree, smoked pancetta crumb, lemon oil.', 14, array['signature','seafood'], 1),
  ('menu-st-2', 'starters', 'Truffle Burrata', 'Heirloom tomato, basil pearls, aged balsamic.', 12, array['vegetarian'], 2),
  ('menu-ma-1', 'mains', 'Aged Ribeye 10oz', 'Charcoal grilled, cafe de Paris butter, rosemary jus.', 32, array['popular'], 1),
  ('menu-ma-2', 'mains', 'Fire-Roasted Sea Bass', 'Saffron aioli, charred asparagus, citrus glaze.', 27, array['seafood'], 2),
  ('menu-de-1', 'desserts', 'Valrhona Velvet', 'Dark chocolate mousse, hazelnut praline crunch.', 10, array[]::text[], 1),
  ('menu-dr-1', 'drinks', 'Midnight Manhattan', 'Rye, vermouth blend, black cherry smoke.', 13, array[]::text[], 1)
on conflict (id) do nothing;

-- 8) Analytics view from live bookings
create or replace view public.daily_reports as
select
  b.booking_date as date,
  count(*)::int as total_bookings,
  coalesce(sum(b.guests), 0)::int as total_guests,
  coalesce(sum(case when b.payment_status = 'paid' then b.deposit_amount else 0 end), 0)::numeric(12,2) as total_revenue,
  count(*) filter (where b.status = 'no_show')::int as no_shows,
  count(*) filter (where b.status = 'cancelled')::int as cancellations,
  round(
    (
      count(*) filter (where b.status in ('arrived', 'seated', 'completed'))::numeric
      /
      greatest((select count(*) from public.restaurant_tables where status <> 'blocked'), 1)
    ) * 100
  )::int as average_occupancy
from public.bookings b
group by b.booking_date
order by b.booking_date desc;

-- 9) RPC: available slots by date/guests
create or replace function public.get_available_slots(
  p_date date,
  p_guests integer default 2
)
returns table (
  slot text,
  available boolean,
  available_tables integer
)
language sql
stable
as $$
with cfg as (
  select
    opening_time,
    closing_time,
    time_slot_interval
  from public.restaurant_settings
  order by updated_at desc
  limit 1
),
slots as (
  select gs::time as slot_time
  from cfg,
  generate_series(
    p_date + cfg.opening_time,
    p_date + cfg.closing_time - make_interval(mins => cfg.time_slot_interval),
    make_interval(mins => cfg.time_slot_interval)
  ) as gs
),
capacity as (
  select count(*)::int as total_tables
  from public.restaurant_tables
  where status <> 'blocked'
    and capacity >= p_guests
),
active_bookings as (
  select
    b.booking_time as slot_time,
    count(*)::int as used_tables
  from public.bookings b
  where b.booking_date = p_date
    and b.status in ('confirmed', 'arrived', 'seated')
  group by b.booking_time
)
select
  to_char(s.slot_time, 'HH24:MI') as slot,
  greatest(c.total_tables - coalesce(a.used_tables, 0), 0) > 0 as available,
  greatest(c.total_tables - coalesce(a.used_tables, 0), 0)::int as available_tables
from slots s
cross join capacity c
left join active_bookings a on a.slot_time = s.slot_time
order by s.slot_time;
$$;

grant execute on function public.get_available_slots(date, integer) to anon, authenticated;

-- 10) RLS and policies
alter table public.user_roles enable row level security;
alter table public.bookings enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.menu_items enable row level security;

-- user_roles

drop policy if exists "User can read own role" on public.user_roles;
drop policy if exists "Admin can read all roles" on public.user_roles;
drop policy if exists "Admin manage roles" on public.user_roles;

create policy "User can read own role"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admin can read all roles"
on public.user_roles
for select
to authenticated
using (public.is_admin());

create policy "Admin manage roles"
on public.user_roles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- bookings

drop policy if exists "Public create booking requests" on public.bookings;
drop policy if exists "Staff admin read bookings" on public.bookings;
drop policy if exists "Staff admin update bookings" on public.bookings;
drop policy if exists "Admin delete bookings" on public.bookings;

create policy "Public create booking requests"
on public.bookings
for insert
to anon, authenticated
with check (
  guests > 0
  and status in ('pending', 'confirmed')
  and payment_status in ('pending', 'paid', 'refunded')
);

create policy "Staff admin read bookings"
on public.bookings
for select
to authenticated
using (public.is_staff_or_admin());

create policy "Staff admin update bookings"
on public.bookings
for update
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Admin delete bookings"
on public.bookings
for delete
to authenticated
using (public.is_admin());

-- restaurant_tables

drop policy if exists "Public read tables" on public.restaurant_tables;
drop policy if exists "Staff admin update tables" on public.restaurant_tables;
drop policy if exists "Admin insert tables" on public.restaurant_tables;
drop policy if exists "Admin delete tables" on public.restaurant_tables;

create policy "Public read tables"
on public.restaurant_tables
for select
to anon, authenticated
using (true);

create policy "Staff admin update tables"
on public.restaurant_tables
for update
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Admin insert tables"
on public.restaurant_tables
for insert
to authenticated
with check (public.is_admin());

create policy "Admin delete tables"
on public.restaurant_tables
for delete
to authenticated
using (public.is_admin());

-- restaurant_settings

drop policy if exists "Public read settings" on public.restaurant_settings;
drop policy if exists "Staff admin read settings" on public.restaurant_settings;
drop policy if exists "Admin update settings" on public.restaurant_settings;

create policy "Public read settings"
on public.restaurant_settings
for select
to anon, authenticated
using (true);

create policy "Admin update settings"
on public.restaurant_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- menu_items

drop policy if exists "Public read menu" on public.menu_items;
drop policy if exists "Staff admin write menu" on public.menu_items;
drop policy if exists "Staff admin update menu" on public.menu_items;
drop policy if exists "Admin delete menu" on public.menu_items;

create policy "Public read menu"
on public.menu_items
for select
to anon, authenticated
using (is_active = true or public.is_staff_or_admin());

create policy "Staff admin write menu"
on public.menu_items
for insert
to authenticated
with check (public.is_staff_or_admin());

create policy "Staff admin update menu"
on public.menu_items
for update
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

create policy "Admin delete menu"
on public.menu_items
for delete
to authenticated
using (public.is_admin());

-- 11) Realtime setup
alter table public.bookings replica identity full;
alter table public.restaurant_tables replica identity full;
alter table public.restaurant_settings replica identity full;
alter table public.menu_items replica identity full;

do $$
declare
  t text;
begin
  foreach t in array array['bookings', 'restaurant_tables', 'restaurant_settings', 'menu_items']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

commit;

-- =====================================================
-- Bootstrap roles (run once after users exist in auth.users)
-- =====================================================
-- insert into public.user_roles (user_id, role)
-- select id, 'admin'::public.app_role from auth.users where email = 'admin@luxereserve.co'
-- on conflict (user_id) do update set role = excluded.role;

-- insert into public.user_roles (user_id, role)
-- select id, 'staff'::public.app_role from auth.users where email = 'staff@luxereserve.co'
-- on conflict (user_id) do update set role = excluded.role;

-- =====================================================
-- Quick checks
-- =====================================================
-- select auth.uid(), public.current_app_role(), public.is_admin(), public.is_staff_or_admin();
-- select * from public.restaurant_settings;
-- select count(*) from public.restaurant_tables;
-- select * from public.get_available_slots(current_date, 2);
-- select * from public.daily_reports limit 7;
