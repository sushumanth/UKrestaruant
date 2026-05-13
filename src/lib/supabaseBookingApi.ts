import type { Booking } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

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

export const getBookingByBookingId = async (
  bookingId: string
): Promise<{ ok: boolean; booking?: Booking; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  const booking: Booking = {
    id: data.id,
    bookingId: data.booking_id,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    customerPhone: data.customer_phone,
    date: data.booking_date,
    time: data.booking_time,
    guests: data.guests,
    tableId: data.table_id ?? undefined,
    tableNumber: data.table_number ?? undefined,
    status: data.status,
    specialRequests: data.special_requests ?? '',
    depositAmount: data.deposit_amount,
    paymentStatus: data.payment_status,
    stripePaymentIntentId: data.stripe_payment_intent_id ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  return {
    ok: true,
    booking,
  };
};