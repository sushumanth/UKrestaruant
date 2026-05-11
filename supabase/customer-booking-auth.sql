-- Require customer sign-in for booking and allow customers to view only their own bookings.
-- Run this in Supabase SQL Editor after setup.sql.

begin;

alter table public.bookings enable row level security;

drop policy if exists "Public create booking requests" on public.bookings;
drop policy if exists "Customer read own bookings" on public.bookings;

create policy "Public create booking requests"
on public.bookings
for insert
to authenticated
with check (
  customer_email = lower(coalesce(auth.jwt() ->> 'email', ''))
  and guests > 0
  and status in ('pending', 'confirmed')
  and payment_status in ('pending', 'paid', 'refunded')
);

create policy "Customer read own bookings"
on public.bookings
for select
to authenticated
using (customer_email = lower(coalesce(auth.jwt() ->> 'email', '')));

commit;
