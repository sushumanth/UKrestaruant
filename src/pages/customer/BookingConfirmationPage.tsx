import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { Check, Calendar, Clock, Users, MapPin, Mail, Download, Share2, Home, BadgeCheck, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, formatCurrency } from '@/lib/mockData';
import { jsPDF } from 'jspdf';
import type { Booking } from '@/types';
import { useBookingStore } from '@/store';
import { getBookingByBookingId } from '@/lib/supabaseBookingApi';

interface BookingCharges {
  baseDepositAmount: number;
  cartSubtotal: number;
  totalPaid: number;
  itemCount: number;
}

export const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const charges = location.state?.charges as BookingCharges | undefined;
  const bookings = useBookingStore((state) => state.bookings);
  const [booking, setBooking] = useState<Booking | null>((location.state?.booking as Booking | undefined) ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string>('');

  const getShareText = (activeBooking: Booking, paidAmount: number) => [
    `LuxeReserve Booking Confirmed (${activeBooking.bookingId})`,
    `Name: ${activeBooking.customerName}`,
    `Date: ${formatDate(activeBooking.date)}`,
    `Time: ${formatTime(activeBooking.time)}`,
    `Guests: ${activeBooking.guests}`,
    `Table: ${activeBooking.tableNumber ? `Table ${activeBooking.tableNumber}` : 'To be assigned'}`,
    `Paid: ${formatCurrency(paidAmount)}`,
  ].join('\n');

  const handleDownloadPdf = () => {
    if (!booking) {
      return;
    }

    const paidAmount = charges?.totalPaid ?? booking.depositAmount;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 56;
    let y = 72;

    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.text('LuxeReserve Booking Confirmation', marginX, y);

    y += 34;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Thank you for booking with LuxeReserve. Your reservation details are below.', marginX, y);

    y += 36;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, 540, y);

    y += 30;
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('BOOKING REFERENCE', marginX, y);
    doc.text('STATUS', 390, y);

    y += 20;
    doc.setFont('courier', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(164, 121, 27);
    doc.text(booking.bookingId, marginX, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(16, 142, 90);
    doc.text('CONFIRMED', 390, y);

    y += 34;
    doc.setTextColor(20, 20, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const details: Array<[string, string]> = [
      ['Customer', booking.customerName],
      ['Email', booking.customerEmail],
      ['Phone', booking.customerPhone],
      ['Date', formatDate(booking.date)],
      ['Time', formatTime(booking.time)],
      ['Party Size', `${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`],
      ['Table', booking.tableNumber ? `Table ${booking.tableNumber}` : 'To be assigned'],
      ['Amount Paid', `${formatCurrency(paidAmount)} (${booking.paymentStatus})`],
    ];

    if (charges?.cartSubtotal) {
      details.splice(7, 0, ['Pre-order Menu', `${formatCurrency(charges.cartSubtotal)} (${charges.itemCount} item${charges.itemCount === 1 ? '' : 's'})`]);
    }

    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, marginX, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, marginX + 90, y);
      y += 24;
    });

    if (booking.specialRequests) {
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Special Requests:', marginX, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      const wrapped = doc.splitTextToSize(booking.specialRequests, 460);
      doc.text(wrapped, marginX, y);
      y += wrapped.length * 16;
    }

    y += 30;
    doc.setDrawColor(220, 220, 220);
    doc.line(marginX, y, 540, y);

    y += 24;
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text('Please arrive within 15 minutes of your reservation time.', marginX, y);
    y += 14;
    doc.text('Cancellations with at least 24 hours notice are fully refundable.', marginX, y);

    doc.save(`LuxeReserve-${booking.bookingId}.pdf`);
    setActionMessage('PDF downloaded successfully.');
  };

  const handleShare = async () => {
    if (!booking) {
      return;
    }

    const shareText = getShareText(booking, charges?.totalPaid ?? booking.depositAmount);
    const shareData: ShareData = {
      title: `LuxeReserve Booking ${booking.bookingId}`,
      text: shareText,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setActionMessage('Booking details shared successfully.');
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setActionMessage('Share not supported here. Booking details copied to clipboard.');
        return;
      }

      setActionMessage('Sharing is not supported on this device/browser.');
    } catch {
      setActionMessage('Sharing was cancelled or failed. Please try again.');
    }
  };

  useEffect(() => {
  if (!bookingId) {
    navigate('/book', { replace: true });
    return;
  }

  const stateBooking = location.state?.booking as Booking | undefined;

  if (stateBooking?.bookingId === bookingId) {
    setBooking(stateBooking);
    setIsLoading(false);
    return;
  }

  const storeBooking = bookings.find((item) => item.bookingId === bookingId);

  if (storeBooking) {
    setBooking(storeBooking);
    setIsLoading(false);
    return;
  }

  const loadBooking = async () => {
    setIsLoading(true);

    const result = await getBookingByBookingId(bookingId);

    if (!result.ok || !result.booking) {
      navigate('/book', { replace: true });
      return;
    }

    setBooking(result.booking);
    setIsLoading(false);
  };

  void loadBooking();
}, [bookingId, bookings, location.state, navigate]);

if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1ed]">
      <div className="rounded-2xl bg-white px-8 py-6 shadow-lg text-amber-900">
        Loading your booking confirmation...
      </div>
    </div>
  );
}

if (!booking) {
  return null;
}

  const paidAmount = charges?.totalPaid ?? booking.depositAmount;
  const paidLabel = charges?.cartSubtotal ? 'Payment Received' : 'Deposit Paid';

  return (
  <main className="relative min-h-screen overflow-hidden bg-[#efe8dc] px-3 py-3 sm:px-4 lg:px-5">
    {/* Floral background */}
    <div className="absolute inset-0 opacity-45 pointer-events-none">
      <img
        src="/bookfirstpage.png"
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>

    <div className="relative z-10 mx-auto mt-20 max-w-6xl">
      <section className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#fffaf1]/90 shadow-[0_22px_55px_rgba(65,42,25,0.2)] backdrop-blur-xl">
        {/* Compact header */}
        <div className="px-4 pb-4 pt-5 text-center sm:px-6">
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-600/50 bg-amber-700/40">
              <span className="text-lg">🍽️</span>
            </div>

            <p className="font-serif text-[clamp(1.15rem,2.2vw,1.7rem)] tracking-[0.26em] text-[#1f1813]">
              LUXE RESERVE
            </p>
          </div>

          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#b98b42]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#b98b42]">
              Premium Dining Experience
            </p>
            <span className="h-px w-10 bg-[#b98b42]" />
          </div>

          <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-8 ring-emerald-500/8">
            <Check size={28} className="text-emerald-700" />
          </div>

          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#6f5c4b]">
            Booking Confirmed
          </p>

          <h1 className="mt-2 font-serif text-[clamp(2rem,4vw,3.6rem)] leading-none text-[#2b2018]">
            Thank you, {booking.customerName?.split(' ')[0] || 'Guest'}
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#776b5e]">
            Your reservation has been confirmed.
            {booking.customerEmail ? (
              <>
                {' '}We&apos;ve sent a confirmation email to{' '}
                <span className="font-semibold text-[#3d3128]">
                  {booking.customerEmail}
                </span>
                .
              </>
            ) : null}
          </p>
        </div>

        {/* Main one-screen content */}
        <div className="grid gap-4 px-4 pb-4 sm:px-5 lg:grid-cols-[1fr_0.95fr] lg:px-7">
          {/* Left booking card */}
          <section className="rounded-[1.2rem] border border-[#eadfce] bg-white/50 p-4 shadow-sm backdrop-blur-md">
            <div className="flex items-start justify-between gap-4 border-b border-[#eadfce] pb-4">
              <div>
                <p className="text-sm font-semibold text-[#6f5c4b]">
                  Booking Reference
                </p>
                <p className="mt-2 font-mono text-2xl font-bold tracking-wide text-[#8a5d21]">
                  {booking.bookingId}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-[#6f5c4b]">
                  Status
                </p>
                <span className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <Check size={15} />
                  Confirmed
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf1]/70 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2db] text-[#a8752b]">
                  <Calendar size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                    Date
                  </p>
                  <p className="text-sm font-semibold text-[#3d3128]">
                    {formatDate(booking.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf1]/70 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2db] text-[#a8752b]">
                  <Clock size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                    Time
                  </p>
                  <p className="text-sm font-semibold text-[#3d3128]">
                    {formatTime(booking.time)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf1]/70 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2db] text-[#a8752b]">
                  <Users size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                    Party Size
                  </p>
                  <p className="text-sm font-semibold text-[#3d3128]">
                    {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf1]/70 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff2db] text-[#a8752b]">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                    Table
                  </p>
                  <p className="text-sm font-semibold text-[#3d3128]">
                    {booking.tableNumber ? `Table ${booking.tableNumber}` : 'To be assigned'}
                  </p>
                </div>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mt-4 rounded-2xl border border-[#eadfce] bg-[#fffaf1]/70 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                  Special Requests
                </p>
                <p className="mt-1 text-sm leading-5 text-[#3d3128]">
                  {booking.specialRequests}
                </p>
              </div>
            )}

            {/* Payment mini card */}
            <div className="mt-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Mail size={18} />
                  </span>

                  <div>
                    <p className="font-semibold text-emerald-900">
                      {paidLabel}
                    </p>
                    <p className="text-sm text-emerald-700/75">
                      {formatCurrency(paidAmount)}
                    </p>

                    {charges?.cartSubtotal ? (
                      <p className="mt-1 text-xs text-emerald-700/70">
                        {formatCurrency(charges.baseDepositAmount)} deposit +{' '}
                        {formatCurrency(charges.cartSubtotal)} pre-order menu
                      </p>
                    ) : null}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                  <Check size={14} />
                  Paid
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={handleDownloadPdf}
                className="h-12 rounded-xl bg-[linear-gradient(135deg,#c39243,#a56f25)] text-sm font-bold text-white shadow-[0_10px_22px_rgba(165,111,37,0.25)] hover:opacity-95"
              >
                <Download size={18} className="mr-2" />
                Download PDF
              </Button>

              <Button
                type="button"
                onClick={handleShare}
                className="h-12 rounded-xl border border-[#cbb28d] bg-white text-sm font-bold text-[#7a5b32] hover:bg-[#fff8ef]"
              >
                <Share2 size={18} className="mr-2" />
                Share
              </Button>
            </div>

            {actionMessage && (
              <p className="mt-3 text-center text-sm font-medium text-[#8a5d21]">
                {actionMessage}
              </p>
            )}
          </section>

          {/* Right important info */}
          <section className="rounded-[1.2rem] border border-[#eadfce] bg-white/50 p-4 shadow-sm backdrop-blur-md">
            <h2 className="font-serif text-[1.8rem] leading-none text-[#2b2018]">
              Important Information
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex gap-4 border-b border-[#eadfce] pb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff2db] font-serif text-xl font-bold text-[#a8752b]">
                  1
                </span>

                <div>
                  <h3 className="font-serif text-xl text-[#2b2018]">
                    Arrival Time
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#776b5e]">
                    Please arrive within 15 minutes of your reservation time.
                    Your table may be released after this time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-b border-[#eadfce] pb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff2db] font-serif text-xl font-bold text-[#a8752b]">
                  2
                </span>

                <div>
                  <h3 className="font-serif text-xl text-[#2b2018]">
                    Cancellation Policy
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#776b5e]">
                    Cancellations made at least 24 hours in advance will receive
                    a full refund. Late cancellations may forfeit the deposit.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff2db] font-serif text-xl font-bold text-[#a8752b]">
                  3
                </span>

                <div>
                  <h3 className="font-serif text-xl text-[#2b2018]">
                    Dress Code
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#776b5e]">
                    Smart casual attire is recommended for the best dining
                    experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#eadfce] bg-[#fffaf1]/70 px-4 py-4">
              <div className="flex items-center gap-3 text-sm text-[#7a6c60]">
                <BadgeCheck size={18} className="text-[#a8752b]" />
                <span>Secure booking confirmed instantly.</span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm text-[#7a6c60]">
                <LockKeyhole size={18} className="text-[#a8752b]" />
                <span>Payment details are processed securely.</span>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom home button */}
        <div className="px-4 pb-5 sm:px-5 lg:px-7">
          <Link
            to="/"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[linear-gradient(135deg,#c39243,#a56f25)] text-base font-bold text-white shadow-[0_10px_22px_rgba(165,111,37,0.25)] transition hover:scale-[1.005] hover:opacity-95"
          >
            <Home size={19} />
            Return to Home
          </Link>

          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8a7c6d]">
            <LockKeyhole size={13} />
            Secure booking • Instant confirmation • Fully refundable with 24 hours notice.
          </p>
        </div>
      </section>
    </div>
  </main>
);
};
