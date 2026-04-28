-- =====================================================
-- SQL to enable Staff + Admin menu management
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- 1) DROP OLD ADMIN-ONLY POLICIES
drop policy if exists "Admin upload ukrestaurent images" on storage.objects;
drop policy if exists "Admin update ukrestaurent images" on storage.objects;
drop policy if exists "Admin delete ukrestaurent images" on storage.objects;
drop policy if exists "Admin delete menu" on public.menu_items;

-- 2) CREATE STORAGE POLICIES FOR STAFF + ADMIN (Images)

-- Staff + Admin can upload images
create policy "Staff admin upload ukrestaurent images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'ukrestaurent' and public.is_staff_or_admin());

-- Staff + Admin can update images
create policy "Staff admin update ukrestaurent images"
on storage.objects
for update
to authenticated
using (bucket_id = 'ukrestaurent' and public.is_staff_or_admin())
with check (bucket_id = 'ukrestaurent' and public.is_staff_or_admin());

-- Staff + Admin can delete images
create policy "Staff admin delete ukrestaurent images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'ukrestaurent' and public.is_staff_or_admin());

-- Public can read images
create policy "Public read ukrestaurent images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'ukrestaurent');

-- 3) CREATE MENU ITEM POLICIES FOR STAFF + ADMIN (Database)

-- Public can read active menu items, staff+admin can read all
create policy "Public read menu"
on public.menu_items
for select
to anon, authenticated
using (is_active = true or public.is_staff_or_admin());

-- Staff + Admin can add menu items
create policy "Staff admin write menu"
on public.menu_items
for insert
to authenticated
with check (public.is_staff_or_admin());

-- Staff + Admin can update menu items
create policy "Staff admin update menu"
on public.menu_items
for update
to authenticated
using (public.is_staff_or_admin())
with check (public.is_staff_or_admin());

-- Staff + Admin can delete menu items
create policy "Staff admin delete menu"
on public.menu_items
for delete
to authenticated
using (public.is_staff_or_admin());

-- 4) VERIFY POLICIES ARE ACTIVE
-- Run this to check all policies are in place:
-- select schemaname, tablename, policyname, qual, with_check from pg_policies 
-- where tablename in ('objects', 'menu_items') 
-- order by schemaname, tablename, policyname;
