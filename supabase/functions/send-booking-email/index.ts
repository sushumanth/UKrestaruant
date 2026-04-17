import { Resend } from 'npm:resend@4.0.1';

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'LuxeReserve <reservations@luxereserve.com>';
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not configured.');
}

const resend = new Resend(resendApiKey || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type BookingPayload = {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  time: string;
  guests: number;
  tableNumber?: number;
  depositAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatTime = (value: string) => {
  const [rawHours, rawMinutes] = value.split(':');
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const htmlTemplate = (booking: BookingPayload) => {
  const tableLabel = booking.tableNumber ? `Table ${booking.tableNumber}` : 'To be assigned';

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937; max-width: 640px; margin: 0 auto; line-height: 1.5;">
      <h2 style="margin: 0 0 12px; color: #111827;">LuxeReserve Booking Confirmation</h2>
      <p style="margin: 0 0 16px;">Hi ${booking.customerName}, your table booking is confirmed.</p>

      <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
        <p style="margin: 0 0 8px;"><strong>Booking Reference:</strong> ${booking.bookingId}</p>
        <p style="margin: 0 0 8px;"><strong>Date:</strong> ${formatDate(booking.date)}</p>
        <p style="margin: 0 0 8px;"><strong>Time:</strong> ${formatTime(booking.time)}</p>
        <p style="margin: 0 0 8px;"><strong>Guests:</strong> ${booking.guests}</p>
        <p style="margin: 0 0 8px;"><strong>Table:</strong> ${tableLabel}</p>
        <p style="margin: 0;"><strong>Deposit:</strong> GBP ${booking.depositAmount.toFixed(2)} (${booking.paymentStatus})</p>
      </div>

      <p style="margin: 0 0 6px;">Please arrive within 15 minutes of your reservation time.</p>
      <p style="margin: 0 0 16px;">Cancellations made at least 24 hours in advance are fully refundable.</p>
      <p style="margin: 0;">Thanks,<br />LuxeReserve Team</p>
    </div>
  `;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!resendApiKey) {
    return new Response(JSON.stringify({ ok: false, error: 'RESEND_API_KEY is missing in function secrets.' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { booking } = (await request.json()) as { booking?: BookingPayload };

    if (!booking || !booking.bookingId || !booking.customerEmail || !booking.customerName) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid booking payload.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tableLabel = booking.tableNumber ? `Table ${booking.tableNumber}` : 'To be assigned';
    const textBody = [
      `Hi ${booking.customerName},`,
      '',
      'Your LuxeReserve table booking is confirmed.',
      '',
      `Booking Reference: ${booking.bookingId}`,
      `Date: ${formatDate(booking.date)}`,
      `Time: ${formatTime(booking.time)}`,
      `Guests: ${booking.guests}`,
      `Table: ${tableLabel}`,
      `Deposit: GBP ${booking.depositAmount.toFixed(2)} (${booking.paymentStatus})`,
      '',
      'Please arrive within 15 minutes of your reservation time.',
      'Cancellations made at least 24 hours in advance are fully refundable.',
      '',
      'Thanks,',
      'LuxeReserve Team',
    ].join('\n');

    const result = await resend.emails.send({
      from: fromEmail,
      to: [booking.customerEmail],
      subject: `Your LuxeReserve booking ${booking.bookingId} is confirmed`,
      text: textBody,
      html: htmlTemplate(booking),
    });

    if (result.error) {
      return new Response(JSON.stringify({ ok: false, error: result.error.message }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: result.data?.id || null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
