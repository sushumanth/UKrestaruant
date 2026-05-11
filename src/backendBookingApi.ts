import type { Booking } from '@/types';
import { backendRequest, consumePendingOrder, mapBackendBooking, persistPendingOrder } from './backendApi';

type BookingResponse = {
  booking?: {
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
  };
};

type AvailabilityResponse = {
  slots: Array<{ time: string; available: boolean; availableTables: number }>;
};

type OccupiedTablesResponse = {
  tableIds: string[];
};

type CustomerBookingsResponse = {
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
    status: Booking['status'];
    specialRequests?: string | null;
    depositAmount: number;
    paymentStatus: Booking['paymentStatus'];
    stripePaymentIntentId?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

type PendingOnlineOrder = {
  id: string;
  customerEmail: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
};

const mapBooking = (booking: BookingResponse['booking'] | CustomerBookingsResponse['items'][number]): Booking => {
  if (!booking) {
    throw new Error('Invalid booking payload.');
  }

  return mapBackendBooking(booking);
};

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export interface SlotResult {
  time: string;
  available: boolean;
  availableTables: number;
}

export interface OccupiedTableResult {
  tableIds: string[];
}

export const saveBooking = async (booking: Booking): Promise<SaveResult> => {
  try {
    const response = await backendRequest<BookingResponse>('/bookings', {
      method: 'POST',
      auth: false,
      body: {
        id: booking.id,
        bookingId: booking.bookingId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        bookingDate: booking.date,
        bookingTime: booking.time,
        guests: booking.guests,
        tableId: booking.tableId ?? null,
        tableNumber: booking.tableNumber ?? null,
        status: booking.status,
        specialRequests: booking.specialRequests ?? null,
        depositAmount: booking.depositAmount,
        paymentStatus: booking.paymentStatus,
        stripePaymentIntentId: booking.stripePaymentIntentId ?? null,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    });

    if (!response.booking) {
      return { ok: false, error: 'Unable to save booking.' };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to save booking.' };
  }
};

export const getAvailableSlots = async (
  date: string,
  guests: number
): Promise<{ ok: boolean; slots: SlotResult[]; error?: string }> => {
  try {
    const response = await backendRequest<AvailabilityResponse>(`/bookings/availability?date=${encodeURIComponent(date)}&guests=${encodeURIComponent(String(guests))}`, {
      auth: false,
    });

    return { ok: true, slots: response.slots };
  } catch (error) {
    return { ok: false, slots: [], error: error instanceof Error ? error.message : 'Unable to fetch available slots.' };
  }
};

export const getOccupiedTableIds = async (
  date: string,
  time: string
): Promise<{ ok: boolean; tableIds: string[]; error?: string }> => {
  try {
    const response = await backendRequest<OccupiedTablesResponse>(`/bookings/occupied-tables?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
      auth: false,
    });

    return { ok: true, tableIds: response.tableIds };
  } catch (error) {
    return { ok: false, tableIds: [], error: error instanceof Error ? error.message : 'Unable to fetch occupied tables.' };
  }
};

export const getCustomerBookings = async (
  customerEmail: string
): Promise<{ ok: boolean; bookings: Booking[]; error?: string }> => {
  try {
    const response = await backendRequest<CustomerBookingsResponse>(`/bookings?email=${encodeURIComponent(customerEmail)}`);
    return { ok: true, bookings: response.items.map(mapBooking) };
  } catch (error) {
    return { ok: false, bookings: [], error: error instanceof Error ? error.message : 'Unable to fetch bookings.' };
  }
};

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
}

export const saveOrderItems = async (
  orderId: string,
  items: OrderItem[]
): Promise<SaveResult> => {
  if (items.length === 0) {
    return { ok: false, error: 'No items to save.' };
  }

  const pendingOrder = consumePendingOrder(orderId) as PendingOnlineOrder | null;

  if (!pendingOrder) {
    return { ok: false, error: 'Pending order not found.' };
  }

  try {
    await backendRequest('/orders', {
      method: 'POST',
      auth: false,
      body: {
        id: pendingOrder.id,
        customerEmail: pendingOrder.customerEmail,
        totalAmount: pendingOrder.totalAmount,
        status: pendingOrder.status,
        stripePaymentIntentId: pendingOrder.stripePaymentIntentId ?? null,
        createdAt: pendingOrder.createdAt,
        updatedAt: pendingOrder.updatedAt,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unable to save order items.' };
  }
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

export const saveOnlineOrder = async (order: OnlineOrder): Promise<SaveResult> => {
  persistPendingOrder(order);
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

export const getCustomerOrders = async (
  customerEmail: string
): Promise<{ ok: boolean; orders: OrderOnlineWithItems[]; error?: string }> => {
  try {
    const response = await backendRequest<{ items: Array<{
      id: string;
      orderNumber: string;
      customerName?: string | null;
      customerEmail: string;
      customerPhone?: string | null;
      totalAmount: number;
      status: OnlineOrder['status'];
      stripePaymentIntentId?: string | null;
      createdAt: string;
      updatedAt: string;
      items: Array<{
        id: string;
        orderId: string;
        menuItemId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;
    }> }>(`/orders?email=${encodeURIComponent(customerEmail)}`);

    return {
      ok: true,
      orders: response.items.map((order) => ({
        id: order.id,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        status: order.status,
        stripePaymentIntentId: order.stripePaymentIntentId ?? undefined,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      })),
    };
  } catch (error) {
    return { ok: false, orders: [], error: error instanceof Error ? error.message : 'Unable to fetch orders.' };
  }
};
