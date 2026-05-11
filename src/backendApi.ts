import type { Booking, DailyReport, MenuItem, RestaurantSettings, RestaurantTable, User } from '@/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000/api';
const AUTH_STORAGE_KEY = 'ukrestaurant-auth-session';
const PENDING_ORDER_STORAGE_KEY = 'ukrestaurant-pending-orders';

type BackendRole = 'admin' | 'employee' | 'customer';

export type BackendUser = {
  id: string;
  email: string;
  role: BackendRole;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendAuthSession = {
  token: string;
  user: BackendUser;
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  auth?: boolean;
  body?: unknown;
};

type StoredPendingOrder = {
  id: string;
  customerEmail: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
};

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readJson = <T,>(storageKey: string): T | null => {
  if (!isBrowser) {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeJson = <T,>(storageKey: string, value: T | null): void => {
  if (!isBrowser) {
    return;
  }

  if (value === null) {
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
};

export const getStoredAuthSession = (): BackendAuthSession | null => readJson<BackendAuthSession>(AUTH_STORAGE_KEY);

export const setStoredAuthSession = (session: BackendAuthSession | null): void => {
  writeJson(AUTH_STORAGE_KEY, session);
};

export const clearStoredAuthSession = (): void => {
  writeJson<BackendAuthSession>(AUTH_STORAGE_KEY, null);
};

export const getStoredAuthToken = (): string | null => getStoredAuthSession()?.token ?? null;

export const getStoredAuthUser = (): BackendUser | null => getStoredAuthSession()?.user ?? null;

export const persistPendingOrder = (order: StoredPendingOrder): void => {
  const existing = readJson<Record<string, StoredPendingOrder>>(PENDING_ORDER_STORAGE_KEY) ?? {};
  existing[order.id] = order;
  writeJson(PENDING_ORDER_STORAGE_KEY, existing);
};

export const consumePendingOrder = (orderId: string): StoredPendingOrder | null => {
  const existing = readJson<Record<string, StoredPendingOrder>>(PENDING_ORDER_STORAGE_KEY) ?? {};
  const order = existing[orderId] ?? null;

  if (order) {
    delete existing[orderId];
    writeJson(PENDING_ORDER_STORAGE_KEY, existing);
  }

  return order;
};

export const backendRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  const token = options.auth === false ? null : getStoredAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: BodyInit | null | undefined = options.body as BodyInit | null | undefined;
  if (body && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const responseBody = response.status === 204
    ? null
    : contentType.includes('application/json')
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const message = typeof responseBody === 'object' && responseBody && 'message' in responseBody
      ? String((responseBody as { message?: unknown }).message ?? 'Request failed')
      : typeof responseBody === 'string' && responseBody
        ? responseBody
        : 'Request failed';

    throw new Error(message);
  }

  return responseBody as T;
};

export const normalizeDateKey = (value: string | Date): string => {
  const text = value instanceof Date ? value.toISOString() : value;
  return text.slice(0, 10);
};

export const mapBackendBooking = (booking: {
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
  status: Booking['status'];
  specialRequests?: string | null;
  depositAmount: number;
  paymentStatus: Booking['paymentStatus'];
  stripePaymentIntentId?: string | null;
  createdAt: string;
  updatedAt: string;
}): Booking => ({
  id: booking.id,
  bookingId: booking.bookingCode,
  customerName: booking.customerName,
  customerEmail: booking.customerEmail,
  customerPhone: booking.customerPhone,
  date: normalizeDateKey(booking.bookingDate),
  time: booking.bookingTime.slice(0, 5),
  guests: booking.guests,
  tableId: booking.tableId ?? undefined,
  tableNumber: booking.tableNumber ?? undefined,
  status: booking.status,
  specialRequests: booking.specialRequests ?? undefined,
  depositAmount: booking.depositAmount,
  paymentStatus: booking.paymentStatus,
  stripePaymentIntentId: booking.stripePaymentIntentId ?? undefined,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});

export const mapBackendTable = (table: {
  id: string;
  tableNumber: number;
  capacity: number;
  status: RestaurantTable['status'];
  timeSlot?: string | null;
  createdAt: string;
  updatedAt: string;
}): RestaurantTable => ({
  id: table.id,
  tableNumber: table.tableNumber,
  capacity: table.capacity,
  status: table.status,
  timeSlot: table.timeSlot ?? null,
  createdAt: table.createdAt,
  updatedAt: table.updatedAt,
});

export const mapBackendSettings = (settings: {
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
}): RestaurantSettings => ({
  id: settings.id,
  name: settings.name,
  address: settings.address,
  phone: settings.phone,
  email: settings.email,
  openingTime: settings.openingTime,
  closingTime: settings.closingTime,
  timeSlotInterval: settings.timeSlotInterval,
  defaultDepositAmount: settings.defaultDepositAmount,
  cancellationDeadlineHours: settings.cancellationDeadlineHours,
  autoReleaseMinutes: settings.autoReleaseMinutes,
});

export const mapBackendMenuItem = (menuItem: {
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
}): MenuItem => ({
  id: menuItem.id,
  name: menuItem.name,
  description: menuItem.description,
  price: menuItem.price,
  category: menuItem.category,
  image: menuItem.imageUrl,
  rating: menuItem.rating,
  prepTime: menuItem.prepTime,
  isVeg: menuItem.isVeg,
  tags: menuItem.tags ?? [],
  isActive: menuItem.isActive,
  sortOrder: menuItem.sortOrder,
  createdAt: menuItem.createdAt,
  updatedAt: menuItem.updatedAt,
});

export const mapBackendUser = (user: BackendUser): User => ({
  id: user.id,
  email: user.email,
  role: user.role === 'customer' ? 'customer' : user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone ?? undefined,
  createdAt: user.createdAt ?? new Date().toISOString(),
});

export const mapBackendReport = (report: DailyReport): DailyReport => report;
