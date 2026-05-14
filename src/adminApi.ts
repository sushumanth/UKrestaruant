import type {
  Booking,
  BookingStatus,
  DailyReport,
  MenuItem,
  RestaurantSettings,
  RestaurantTable,
  TableStatus,
  User,
} from '@/types';
import {
  backendRequest,
  clearStoredAuthSession,
  getStoredAuthSession,
  mapBackendBooking,
  mapBackendMenuItem,
  mapBackendSettings,
  mapBackendTable,
  mapBackendUser,
  setStoredAuthSession,
} from './backendApi';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'employee' | 'customer';
    isBlocked?: boolean;
    firstName: string;
    lastName: string;
    phone?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
};

type StaffMemberResponse = {
  id: string;
  email: string;
  role: 'admin' | 'employee';
  isBlocked: boolean;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type PublicOperationalDataResponse = {
  settings: {
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
  } | null;
  tables: Array<{
    id: string;
    tableNumber: number;
    capacity: number;
    status: TableStatus;
    timeSlot?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  menuItems: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    category: MenuItem['category'];
    imageUrl: string;
    rating: number;
    prepTime: number;
    isVeg: boolean;
    tags: string[];
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
};

type CategoryItem = {
  id: string;
  name: string;
};

type BookingsResponse = {
  items: Array<{
    id: string;
    bookingCode: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    bookingDate: string;
    bookingTime: string;
    guests: number;
    tableId?: string | null;
    tableNumber?: number | null;
    status: BookingStatus;
    specialRequests?: string | null;
    depositAmount: number;
    paymentStatus: Booking['paymentStatus'];
    stripePaymentIntentId?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

const splitNameFromEmail = (email: string) => {
  const localPart = email.split('@')[0] ?? '';
  const normalized = localPart.replace(/[._-]+/g, ' ').trim();
  const parts = normalized.split(/\s+/).filter(Boolean);

  const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() : 'Staff';
  const lastName = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1).toLowerCase() : 'User';

  return { firstName, lastName };
};

const buildAppUser = (user: AuthResponse['user']): User => {
  const mapped = mapBackendUser(user);

  return {
    id: mapped.id,
    email: mapped.email,
    role: mapped.role,
    isBlocked: mapped.isBlocked,
    firstName: mapped.firstName,
    lastName: mapped.lastName,
    phone: mapped.phone,
    createdAt: mapped.createdAt,
  };
};

const computeReports = (bookings: Booking[], tables: RestaurantTable[]): DailyReport[] => {
  const days = new Map<string, DailyReport>();

  for (const booking of bookings) {
    const day = booking.date.slice(0, 10);
    const current = days.get(day) ?? {
      date: day,
      totalBookings: 0,
      totalGuests: 0,
      totalRevenue: 0,
      noShows: 0,
      cancellations: 0,
      averageOccupancy: 0,
    };

    current.totalBookings += 1;
    current.totalGuests += booking.guests;
    current.totalRevenue += booking.depositAmount;

    if (booking.status === 'no_show') {
      current.noShows += 1;
    }

    if (booking.status === 'cancelled') {
      current.cancellations += 1;
    }

    days.set(day, current);
  }

  const tableCount = Math.max(1, tables.length);

  return [...days.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((report) => ({
      ...report,
      averageOccupancy: Math.min(100, Math.round((report.totalBookings / tableCount) * 100)),
    }));
};

export const signInStaffPortal = async (email: string, password: string): Promise<{ user?: User; error?: string }> => {
  try {
    const response = await backendRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: email.trim().toLowerCase(), password },
    });

    if (response.user.role === 'customer') {
      return { error: 'Customer accounts cannot access the staff portal.' };
    }

    setStoredAuthSession({ token: response.token, user: response.user });
    return { user: buildAppUser(response.user) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Invalid email or password.' };
  }
};

export const resolveCurrentStaffUser = async (): Promise<User | null> => {
  const session = getStoredAuthSession();

  if (!session || session.user.role === 'customer') {
    return null;
  }

  try {
    const response = await backendRequest<AuthResponse>('/auth/me');

    if (response.user.role === 'customer') {
      return null;
    }

    return buildAppUser(response.user);
  } catch {
    const fallback = splitNameFromEmail(session.user.email);
    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role === 'admin' ? 'admin' : 'employee',
      isBlocked: false,
      firstName: fallback.firstName,
      lastName: fallback.lastName,
      phone: session.user.phone ?? undefined,
      createdAt: session.user.createdAt ?? new Date().toISOString(),
    };
  }
};

export const signOutStaffPortal = async (): Promise<void> => {
  clearStoredAuthSession();
};

export const fetchPublicOperationalData = async (): Promise<{
  tables: RestaurantTable[];
  settings: RestaurantSettings | null;
  menuItems: MenuItem[];
}> => {
  const [settingsResponse, tablesResponse, menuItemsResponse] = await Promise.all([
    backendRequest<{ settings: PublicOperationalDataResponse['settings'] } | PublicOperationalDataResponse['settings']>('/restaurants/settings', { auth: false }),
    backendRequest<{ tables: PublicOperationalDataResponse['tables'] } | PublicOperationalDataResponse['tables']>('/restaurants/tables', { auth: false }),
    backendRequest<{ items: PublicOperationalDataResponse['menuItems'] }>('/menu?limit=1000&page=1&isActive=true', { auth: false }),
  ]);

  const settings = Array.isArray(settingsResponse)
    ? null
    : settingsResponse && typeof settingsResponse === 'object' && 'settings' in settingsResponse
      ? settingsResponse.settings
      : settingsResponse;

  const tables = Array.isArray(tablesResponse)
    ? tablesResponse
    : tablesResponse && typeof tablesResponse === 'object' && 'tables' in tablesResponse
      ? tablesResponse.tables
      : [];

  return {
    tables: tables.map(mapBackendTable),
    settings: settings ? mapBackendSettings(settings) : null,
    menuItems: menuItemsResponse.items.map(mapBackendMenuItem),
  };
};

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const response = await backendRequest<{ items: PublicOperationalDataResponse['menuItems'] }>('/menu?limit=1000&page=1', { auth: false });
  return response.items.map(mapBackendMenuItem);
};

export const fetchMenuCategories = async (): Promise<string[]> => {
  const response = await backendRequest<{ items: CategoryItem[] }>('/categories', { auth: false });
  return response.items.map((item) => item.name);
};

export const createMenuCategory = async (name: string): Promise<string> => {
  const response = await backendRequest<{ item: CategoryItem } | CategoryItem>('/categories', {
    method: 'POST',
    body: { name },
  });

  const normalized = response && typeof response === 'object' && 'item' in response
    ? response.item
    : response;

  return normalized.name;
};

export const upsertMenuItem = async (menuItem: MenuItem, isNew: boolean = false): Promise<MenuItem> => {
  const response = !isNew && menuItem.id
    ? await backendRequest<{ item: PublicOperationalDataResponse['menuItems'][number] } | PublicOperationalDataResponse['menuItems'][number]>(`/menu/${menuItem.id}`, {
        method: 'PUT',
        body: {
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          category: menuItem.category,
          imageUrl: menuItem.image,
          rating: menuItem.rating,
          prepTime: menuItem.prepTime,
          isVeg: menuItem.isVeg,
          tags: menuItem.tags,
          isActive: menuItem.isActive,
          sortOrder: menuItem.sortOrder,
        },
      })
    : await backendRequest<{ item: PublicOperationalDataResponse['menuItems'][number] } | PublicOperationalDataResponse['menuItems'][number]>('/menu', {
        method: 'POST',
        body: {
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          category: menuItem.category,
          imageUrl: menuItem.image,
          rating: menuItem.rating,
          prepTime: menuItem.prepTime,
          isVeg: menuItem.isVeg,
          tags: menuItem.tags,
          isActive: menuItem.isActive,
          sortOrder: menuItem.sortOrder,
        },
      });

  const normalized = response && typeof response === 'object' && 'item' in response
    ? response.item
    : response;

  return mapBackendMenuItem(normalized);
};

export const deleteMenuItem = async (menuItemId: string): Promise<void> => {
  await backendRequest<void>(`/menu/${menuItemId}`, { method: 'DELETE' });
};

export const uploadMenuImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const asset = await backendRequest<{ asset: { url: string } }>('/upload', {
    method: 'POST',
    body: formData,
  });

  return asset.asset.url;
};

export const fetchStaffOperationalData = async (): Promise<{
  bookings: Booking[];
  reports: DailyReport[];
}> => {
  const [bookingsResponse, tablesResponse] = await Promise.all([
    backendRequest<BookingsResponse>('/bookings?limit=1000&page=1'),
    backendRequest<{ tables: PublicOperationalDataResponse['tables'] } | PublicOperationalDataResponse['tables']>('/restaurants/tables', { auth: false }),
  ]);

  const bookings = bookingsResponse.items.map(mapBackendBooking);
  const normalizedTables = Array.isArray(tablesResponse)
    ? tablesResponse
    : tablesResponse && typeof tablesResponse === 'object' && 'tables' in tablesResponse
      ? tablesResponse.tables
      : [];
  const tables = normalizedTables.map(mapBackendTable);

  return {
    bookings,
    reports: computeReports(bookings, tables),
  };
};

export const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<void> => {
  await backendRequest<void>(`/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: { status },
  });
};

export const updateTableStatus = async (tableId: string, status: TableStatus, timeSlot: string | null = null): Promise<void> => {
  await backendRequest<void>(`/restaurants/tables/${tableId}/status`, {
    method: 'PATCH',
    body: { status, timeSlot },
  });
};

export const createRestaurantTable = async (table: RestaurantTable): Promise<RestaurantTable> => {
  const response = await backendRequest<PublicOperationalDataResponse['tables'][number]>('/restaurants/tables', {
    method: 'POST',
    body: {
      id: table.id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      timeSlot: table.timeSlot ?? null,
    },
  });

  return mapBackendTable(response);
};

export const updateRestaurantSettings = async (payload: {
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
  const response = await backendRequest<PublicOperationalDataResponse['settings']>('/restaurants/settings', {
    method: 'PUT',
    body: {
      id: payload.id,
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      email: payload.email,
      openingTime: payload.openingTime,
      closingTime: payload.closingTime,
      timeSlotInterval: payload.timeSlotInterval,
      defaultDepositAmount: payload.defaultDepositAmount,
      cancellationDeadlineHours: payload.cancellationDeadlineHours,
      autoReleaseMinutes: payload.autoReleaseMinutes,
    },
  });

  if (!response) {
    throw new Error('Failed to update settings.');
  }

  return mapBackendSettings(response);
};

export const createStaffMember = async (payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<User> => {
  const response = await backendRequest<AuthResponse>('/auth/staff', {
    method: 'POST',
    body: {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone?.trim(),
    },
  });

  return buildAppUser(response.user);
};

export const fetchStaffMembers = async (): Promise<User[]> => {
  const response = await backendRequest<{ items: StaffMemberResponse[] }>('/auth/staff');
  return response.items.map(mapBackendUser);
};

export const updateStaffMember = async (payload: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password?: string;
}): Promise<User> => {
  const response = await backendRequest<{ item: StaffMemberResponse }>(`/auth/staff/${payload.id}`, {
    method: 'PATCH',
    body: {
      email: payload.email.trim().toLowerCase(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phone: payload.phone?.trim() ?? null,
      password: payload.password?.trim() || undefined,
    },
  });

  return mapBackendUser(response.item);
};

export const setStaffMemberBlocked = async (id: string, isBlocked: boolean): Promise<User> => {
  const response = await backendRequest<{ item: StaffMemberResponse }>(`/auth/staff/${id}/block`, {
    method: 'PATCH',
    body: { isBlocked },
  });

  return mapBackendUser(response.item);
};

export const deleteStaffMember = async (id: string): Promise<void> => {
  await backendRequest<void>(`/auth/staff/${id}`, {
    method: 'DELETE',
  });
};