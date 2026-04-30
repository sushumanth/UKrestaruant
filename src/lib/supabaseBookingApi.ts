import type { Booking } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type DbCustomerBookingRow = {
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
  status: Booking['status'];
  special_requests: string | null;
  deposit_amount: number;
  payment_status: Booking['paymentStatus'];
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

const normalizeBookingTime = (value: string) => value.slice(0, 5);

const mapCustomerBookingRow = (row: DbCustomerBookingRow): Booking => ({
  id: row.id,
  bookingId: row.booking_id,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  date: row.booking_date,
  time: normalizeBookingTime(row.booking_time),
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

export interface SupabaseSaveResult {
  ok: boolean;
  error?: string;
}

export interface SupabaseSlotResult {
  time: string;
  available: boolean;
  availableTables: number;
}

export interface SupabaseOccupiedTableResult {
  tableIds: string[];
}

export const saveBookingToSupabase = async (booking: Booking): Promise<SupabaseSaveResult> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { error } = await supabase.from('bookings').insert({
    id: booking.id,
    booking_id: booking.bookingId,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    customer_phone: booking.customerPhone,
    booking_date: booking.date,
    booking_time: booking.time,
    guests: booking.guests,
    table_id: booking.tableId ?? null,
    table_number: booking.tableNumber ?? null,
    status: booking.status,
    special_requests: booking.specialRequests ?? null,
    deposit_amount: booking.depositAmount,
    payment_status: booking.paymentStatus,
    stripe_payment_intent_id: booking.stripePaymentIntentId ?? null,
    created_at: booking.createdAt,
    updated_at: booking.updatedAt,
  });

  if (error) {
    return {
      ok: false,
      error: `${error.message}${error.details ? ` (${error.details})` : ''}`,
    };
  }

  return { ok: true };
};

export const getAvailableSlotsFromSupabase = async (
  date: string,
  guests: number
): Promise<{ ok: boolean; slots: SupabaseSlotResult[]; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      slots: [],
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { data, error } = await supabase.rpc('get_available_slots', {
    p_date: date,
    p_guests: guests,
  });

  if (error) {
    return {
      ok: false,
      slots: [],
      error: error.message,
    };
  }

  const slots = ((data ?? []) as Array<{ slot: string; available: boolean; available_tables: number }>).map((row) => ({
    time: row.slot,
    available: row.available,
    availableTables: row.available_tables,
  }));

  return {
    ok: true,
    slots,
  };
};

export const getOccupiedTableIdsFromSupabase = async (
  date: string,
  time: string
): Promise<{ ok: boolean; tableIds: string[]; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      tableIds: [],
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const normalizedTime = time.slice(0, 5);

  const { data, error } = await supabase.rpc('get_occupied_table_ids', {
    p_date: date,
    p_time: normalizedTime,
  });

  if (error) {
    return {
      ok: false,
      tableIds: [],
      error: error.message,
    };
  }

  const tableIds = ((data ?? []) as Array<{ table_id: string | null }>)
    .map((row) => row.table_id)
    .filter((tableId): tableId is string => Boolean(tableId));

  return {
    ok: true,
    tableIds,
  };
};

export const getCustomerBookingsFromSupabase = async (
  customerEmail: string
): Promise<{ ok: boolean; bookings: Booking[]; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      bookings: [],
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, booking_id, customer_name, customer_email, customer_phone, booking_date, booking_time, guests, table_id, table_number, status, special_requests, deposit_amount, payment_status, stripe_payment_intent_id, created_at, updated_at'
    )
    .eq('customer_email', customerEmail)
    .order('booking_date', { ascending: false })
    .order('booking_time', { ascending: false });

  if (error) {
    return {
      ok: false,
      bookings: [],
      error: error.message,
    };
  }

  return {
    ok: true,
    bookings: ((data ?? []) as DbCustomerBookingRow[]).map(mapCustomerBookingRow),
  };
};

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
}

export const saveOrderItemsToSupabase = async (
  orderId: string,
  items: OrderItem[]
): Promise<SupabaseSaveResult> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  if (items.length === 0) {
    return {
      ok: false,
      error: 'No items to save.',
    };
  }

  const { error } = await supabase.from('order_online_items').insert(
    items.map((item) => ({
      id: item.id,
      order_id: orderId,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))
  );

  if (error) {
    return {
      ok: false,
      error: `${error.message}${error.details ? ` (${error.details})` : ''}`,
    };
  }

  return { ok: true };
};

export interface OnlineOrder {
  id: string;
  customerEmail: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export const saveOnlineOrderToSupabase = async (order: OnlineOrder): Promise<SupabaseSaveResult> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { error } = await supabase.from('orders_online').insert({
    id: order.id,
    customer_email: order.customerEmail,
    total_amount: order.totalAmount,
    status: order.status,
    stripe_payment_intent_id: order.stripePaymentIntentId ?? null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  });

  if (error) {
    return {
      ok: false,
      error: `${error.message}${error.details ? ` (${error.details})` : ''}`,
    };
  }

  return { ok: true };
};

export interface OrderOnlineWithItems extends OnlineOrder {
  items?: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export const getCustomerOrdersFromSupabase = async (
  customerEmail: string
): Promise<{ ok: boolean; orders: OrderOnlineWithItems[]; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      orders: [],
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { data, error } = await supabase
    .from('orders_online')
    .select(
      `id, customer_email, total_amount, status, stripe_payment_intent_id, created_at, updated_at,
       order_online_items ( id, menu_item_id, quantity, unit_price, total_price )`
    )
    .eq('customer_email', customerEmail)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      ok: false,
      orders: [],
      error: error.message,
    };
  }

  const orders = ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    customerEmail: row.customer_email,
    totalAmount: row.total_amount,
    status: row.status,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.order_online_items ?? []).map((item: any) => ({
      id: item.id,
      menuItemId: item.menu_item_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })),
  }));

  return {
    ok: true,
    orders,
  };
};
