import type { Booking } from '@/types';
import { backendRequest } from './backendApi';

export interface BookingEmailResult {
  ok: boolean;
  error?: string;
}

export const sendBookingConfirmationEmail = async (booking: Booking): Promise<BookingEmailResult> => {
  try {
    await backendRequest('/notifications/booking-confirmation', {
      method: 'POST',
      auth: false,
      body: { booking },
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to connect to email service.',
    };
  }
};
