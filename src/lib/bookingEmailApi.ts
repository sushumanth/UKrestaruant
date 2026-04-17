import type { Booking } from '@/types';
import { supabase } from '@/lib/supabase';

export interface BookingEmailResult {
  ok: boolean;
  error?: string;
}

const functionName = (import.meta.env.VITE_SUPABASE_BOOKING_EMAIL_FUNCTION as string | undefined) || 'send-booking-email';

export const sendBookingConfirmationEmail = async (booking: Booking): Promise<BookingEmailResult> => {
  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  try {
    const { error } = await supabase.functions.invoke(functionName, {
      body: { booking },
    });

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to connect to email service.',
    };
  }
};
