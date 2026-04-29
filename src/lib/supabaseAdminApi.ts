import type { User, Booking, BookingStatus, RestaurantTable, TableStatus, DailyReport, RestaurantSettings, MenuCategory, MenuItem } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const MENU_IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_MENU_IMAGE_BUCKET ?? 'ukrestaurent';

type DbRole = 'admin' | 'staff';

type DbBookingRow = {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  table_id: string | null;
  table_number: number | null;
  status: BookingStatus;
  special_requests: string | null;
  deposit_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

type DbTableRow = {
  id: string;
  table_number: number;
  capacity: number;
  status: TableStatus;
  time_slot: string | null;
  created_at: string;
  updated_at: string;
};

type DbSettingsRow = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  opening_time: string;
  closing_time: string;
  time_slot_interval: number;
  default_deposit_amount: number;
  cancellation_deadline_hours: number;
  auto_release_minutes: number;
};

type DbMenuItemRow = {
  id: string;
  category: MenuCategory;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  prep_time_minutes: number;
  is_veg: boolean;
  tags: string[] | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type DbReportRow = {
  date: string;
  total_bookings: number;
  total_guests: number;
  total_revenue: number;
  no_shows: number;
  cancellations: number;
  average_occupancy: number;
};

const splitNameFromEmail = (email: string) => {
  const localPart = email.split('@')[0] ?? '';
  const normalized = localPart.replace(/[._-]+/g, ' ').trim();
  const parts = normalized.split(/\s+/).filter(Boolean);

  const firstName = parts[0] ? capitalize(parts[0]) : 'Staff';
  const lastName = parts.length > 1 ? capitalize(parts[parts.length - 1]) : 'User';

  return { firstName, lastName };
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const mapRoleToAppRole = (role: DbRole): User['role'] => {
  return role === 'admin' ? 'admin' : 'employee';
};

const normalizeTime = (value: string) => value.slice(0, 5);

const mapBookingRow = (row: DbBookingRow): Booking => ({
  id: row.id,
  bookingId: row.booking_id,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  date: row.booking_date,
  time: normalizeTime(row.booking_time),
  guests: row.guests,
  tableId: row.table_id ?? undefined,
  tableNumber: row.table_number ?? undefined,
  status: row.status,
  specialRequests: row.special_requests ?? undefined,
  depositAmount: row.deposit_amount,
  paymentStatus: row.payment_status,
  stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTableRow = (row: DbTableRow): RestaurantTable => ({
  id: row.id,
  tableNumber: row.table_number,
  capacity: row.capacity,
  status: row.status,
  timeSlot: row.time_slot ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapSettingsRow = (row: DbSettingsRow): RestaurantSettings => ({
  id: row.id,
  name: row.name,
  address: row.address,
  phone: row.phone,
  email: row.email,
  openingTime: row.opening_time,
  closingTime: row.closing_time,
  timeSlotInterval: row.time_slot_interval,
  defaultDepositAmount: row.default_deposit_amount,
  cancellationDeadlineHours: row.cancellation_deadline_hours,
  autoReleaseMinutes: row.auto_release_minutes,
});

const mapMenuItemRow = (row: DbMenuItemRow): MenuItem => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  category: row.category,
  image: row.image_url,
  rating: row.rating,
  prepTime: row.prep_time_minutes,
  isVeg: row.is_veg,
  tags: row.tags ?? [],
  isActive: row.is_active,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapReportRow = (row: DbReportRow): DailyReport => ({
  date: row.date,
  totalBookings: row.total_bookings,
  totalGuests: row.total_guests,
  totalRevenue: row.total_revenue,
  noShows: row.no_shows,
  cancellations: row.cancellations,
  averageOccupancy: row.average_occupancy,
});

const sanitizeFileName = (fileName: string) =>
  fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'menu-image';

const resolveRole = async (userId: string): Promise<DbRole | null> => {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle<{ role: DbRole }>();

  if (error || !data?.role) {
    return null;
  }

  return data.role;
};

const buildAppUser = async (authUser: { id: string; email?: string | null }): Promise<User | null> => {
  const role = await resolveRole(authUser.id);

  if (!role) {
    return null;
  }

  const email = authUser.email ?? 'staff@luxereserve.co';
  const { firstName, lastName } = splitNameFromEmail(email);

  return {
    id: authUser.id,
    email,
    role: mapRoleToAppRole(role),
    firstName,
    lastName,
    createdAt: new Date().toISOString(),
  };
};

export const signInStaffPortal = async (email: string, password: string): Promise<{ user?: User; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: error?.message ?? 'Invalid email or password.' };
  }

  const user = await buildAppUser(data.user);

  if (!user) {
    await supabase.auth.signOut();
    return {
      error: 'Your account has no role in user_roles. Assign admin or staff role first.',
    };
  }

  return { user };
};

export const resolveCurrentStaffUser = async (): Promise<User | null> => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.user) {
    return null;
  }

  return buildAppUser(data.session.user);
};

export const signOutStaffPortal = async (): Promise<void> => {
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
};

export const fetchPublicOperationalData = async (): Promise<{
  tables: RestaurantTable[];
  settings: RestaurantSettings | null;
  menuItems: MenuItem[];
}> => {
  if (!supabase) {
    return { tables: [], settings: null, menuItems: [] };
  }

  const [tablesResponse, settingsResponse, menuItemsResponse] = await Promise.all([
    supabase.from('restaurant_tables').select('id, table_number, capacity, status, time_slot, created_at, updated_at').order('table_number', { ascending: true }),
    supabase.from('restaurant_settings').select('*').limit(1).maybeSingle<DbSettingsRow>(),
    supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
  ]);

  if (tablesResponse.error) {
    throw new Error(tablesResponse.error.message);
  }

  if (settingsResponse.error) {
    throw new Error(settingsResponse.error.message);
  }

  if (menuItemsResponse.error) {
    throw new Error(menuItemsResponse.error.message);
  }

  return {
    tables: (tablesResponse.data as DbTableRow[] | null)?.map(mapTableRow) ?? [],
    settings: settingsResponse.data ? mapSettingsRow(settingsResponse.data) : null,
    menuItems: (menuItemsResponse.data as DbMenuItemRow[] | null)?.map(mapMenuItemRow) ?? [],
  };
};

export const fetchMenuItemsInSupabase = async (): Promise<MenuItem[]> => {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DbMenuItemRow[] | null)?.map(mapMenuItemRow) ?? [];
};

export const upsertMenuItemInSupabase = async (menuItem: MenuItem): Promise<MenuItem> => {
  if (!supabase) {
    return menuItem;
  }

  const payload = {
    id: menuItem.id,
    category: menuItem.category,
    name: menuItem.name,
    description: menuItem.description,
    price: menuItem.price,
    image_url: menuItem.image,
    rating: menuItem.rating,
    prep_time_minutes: menuItem.prepTime,
    is_veg: menuItem.isVeg,
    tags: menuItem.tags,
    is_active: menuItem.isActive,
    sort_order: menuItem.sortOrder,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('menu_items').upsert(payload, { onConflict: 'id' }).select('*').single<DbMenuItemRow>();

  if (error) {
    throw new Error(error.message);
  }

  return mapMenuItemRow(data);
};

export const deleteMenuItemInSupabase = async (menuItemId: string): Promise<void> => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from('menu_items').delete().eq('id', menuItemId);

  if (error) {
    throw new Error(error.message);
  }
};

export const uploadMenuImageToSupabase = async (file: File): Promise<string> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const fileExtension = file.name.includes('.') ? file.name.split('.').pop() ?? '' : '';
  const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ''));
  const storagePath = `menu-images/${crypto.randomUUID()}-${safeName}${fileExtension ? `.${fileExtension.toLowerCase()}` : ''}`;

  const { error: uploadError } = await supabase.storage.from(MENU_IMAGE_BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(MENU_IMAGE_BUCKET).getPublicUrl(storagePath);

  if (!data?.publicUrl) {
    throw new Error('Unable to resolve public image URL.');
  }

  return data.publicUrl;
};

export const fetchStaffOperationalData = async (): Promise<{
  bookings: Booking[];
  reports: DailyReport[];
}> => {
  if (!supabase) {
    return { bookings: [], reports: [] };
  }

  const [bookingsResponse, reportsResponse] = await Promise.all([
    supabase.from('bookings').select('*').order('booking_date', { ascending: false }).order('booking_time', { ascending: false }),
    supabase.from('daily_reports').select('*').order('date', { ascending: true }).limit(60),
  ]);

  if (bookingsResponse.error) {
    throw new Error(bookingsResponse.error.message);
  }

  if (reportsResponse.error) {
    console.warn('Unable to fetch daily_reports view:', reportsResponse.error.message);
  }

  return {
    bookings: (bookingsResponse.data as DbBookingRow[] | null)?.map(mapBookingRow) ?? [],
    reports: reportsResponse.error
      ? []
      : (reportsResponse.data as DbReportRow[] | null)?.map(mapReportRow) ?? [],
  };
};

export const updateBookingStatusInSupabase = async (bookingId: string, status: BookingStatus): Promise<void> => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateTableStatusInSupabase = async (tableId: string, status: TableStatus, timeSlot: string | null = null): Promise<void> => {
  if (!supabase) {
    return;
  }

  const { error } = await supabase
    .from('restaurant_tables')
    .update({ status, time_slot: timeSlot, updated_at: new Date().toISOString() })
    .eq('id', tableId);

  if (error) {
    throw new Error(error.message);
  }
};

export const createRestaurantTableInSupabase = async (table: RestaurantTable): Promise<RestaurantTable> => {
  if (!supabase) {
    return table;
  }

  const { data, error } = await supabase
    .from('restaurant_tables')
    .insert({
      id: table.id,
      table_number: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      time_slot: table.timeSlot ?? null,
    })
    .select('id, table_number, capacity, status, time_slot, created_at, updated_at')
    .single<DbTableRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create table.');
  }

  return mapTableRow(data);
};

export const updateRestaurantSettingsInSupabase = async (payload: {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  timeSlotInterval: number;
  defaultDepositAmount: number;
  cancellationDeadlineHours: number;
  autoReleaseMinutes: number;
}): Promise<RestaurantSettings> => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('restaurant_settings')
    .update({
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      email: payload.email,
      opening_time: payload.openingTime,
      closing_time: payload.closingTime,
      time_slot_interval: payload.timeSlotInterval,
      default_deposit_amount: payload.defaultDepositAmount,
      cancellation_deadline_hours: payload.cancellationDeadlineHours,
      auto_release_minutes: payload.autoReleaseMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id)
    .select('*')
    .single<DbSettingsRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update settings.');
  }

  return mapSettingsRow(data);
};
