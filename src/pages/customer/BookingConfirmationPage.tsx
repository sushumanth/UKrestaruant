import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Check,
  Calendar,
  Clock,
  Users,
  MapPin,
  Mail,
  Download,
  Share2,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, formatCurrency } from '@/restaurantUtils';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import type { Booking } from '@/types';

interface BookingCharges {
  baseDepositAmount: number;
  cartSubtotal: number;
  totalPaid: number;
  itemCount: number;
}

export const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking as Booking | undefined;
  const charges = location.state?.charges as BookingCharges | undefined;
  const saveOk = location.state?.saveOk as boolean | undefined;
  const saveError = location.state?.saveError as string | undefined;

  const [actionMessage, setActionMessage] = useState<string>('');
  const hasCelebratedRef = useRef(false);

  const getShareText = (activeBooking: Booking, paidAmount: number) =>
    [
      `Singhs Dining Booking Confirmed (${activeBooking.bookingId})`,
      `Name: ${activeBooking.customerName}`,
      `Date: ${formatDate(activeBooking.date)}`,
      `Time: ${formatTime(activeBooking.time)}`,
      `Guests: ${activeBooking.guests}`,
      `Table: ${activeBooking.tableNumber ? `Table ${activeBooking.tableNumber}` : 'Table Pending'}`,
      `Paid: ${formatCurrency(paidAmount)}`,
    ].join('\n');

  const handleDownloadPdf = () => {
    if (!booking) return;

    const paidAmount = charges?.totalPaid ?? booking.depositAmount;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 56;
    let y = 72;

    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.text('Singhs Dining Booking Confirmation', marginX, y);

    y += 34;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text('Thank you for booking with Singhs Dining. Your reservation details are below.', marginX, y);

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
      ['Table', booking.tableNumber ? `Table ${booking.tableNumber}` : 'Table Pending'],
      ['Amount Paid', `${formatCurrency(paidAmount)} (${booking.paymentStatus})`],
    ];

    if (charges?.cartSubtotal) {
      details.splice(7, 0, [
        'Pre-order Menu',
        `${formatCurrency(charges.cartSubtotal)} (${charges.itemCount} item${charges.itemCount === 1 ? '' : 's'})`,
      ]);
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

    doc.save(`SinghsDining-${booking.bookingId}.pdf`);
    setActionMessage('PDF downloaded successfully.');
  };

  const handleShare = async () => {
    if (!booking) return;

    const shareText = getShareText(booking, charges?.totalPaid ?? booking.depositAmount);
    const shareData: ShareData = {
      title: `Singhs Dining Booking ${booking.bookingId}`,
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
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  useEffect(() => {
    if (!booking || hasCelebratedRef.current) {
      return;
    }

    hasCelebratedRef.current = true;
    toast('Payment confirmed. Your reservation is booked.');

    const fire = (x: number, y: number) => {
      confetti({
        particleCount: 70,
        spread: 85,
        origin: { x, y },
        shapes: ['square'],
        scalar: 0.85,
        zIndex: 3000,
        disableForReducedMotion: true,
      });
    };

    fire(0.2, 0.6);
    fire(0.8, 0.6);
    fire(0.5, 0.45);

    const timer = window.setTimeout(() => {
      fire(0.25, 0.55);
      fire(0.75, 0.55);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [booking]);

  if (!booking) return null;

  const paidAmount = charges?.totalPaid ?? booking.depositAmount;
  const paidLabel = charges?.cartSubtotal ? 'Payment Received' : 'Deposit Paid';

  return (
    <div
      className="h-screen overflow-hidden bg-[#f8f1e3] pt-20 text-zinc-900"
      style={{
        backgroundImage: 'url(/comfrmtemplt.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto h-full max-w-[1200px] px-2 pb-2 sm:px-3 sm:pb-3">
        {/* <div className="flex h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-[24px] border border-[#dfceb1] bg-white/85 p-2.5 shadow-[0_20px_52px_rgba(91,62,25,0.14)] backdrop-blur-[2px] sm:p-4"> */}
          {!saveOk && saveError && (
            <div className="mb-2 rounded-md border border-amber-300/70 bg-amber-50/90 p-2.5 text-amber-900">
              <strong className="block text-sm font-semibold">
                Booking saved locally but failed to persist
              </strong>
              <p className="mt-1 text-[12px] leading-snug">
                {saveError}. The confirmation is available here and a retry will be attempted in the background.
              </p>
            </div>
          )}

          <div className="mb-2 text-center sm:mb-3">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#dbe8d2] ring-2 ring-[#edf4e8] sm:h-14 sm:w-14">
              <Check size={24} className="text-[#2c7b44] sm:size-7" />
            </div>
            <span className="mb-1 inline-block text-[9px] font-bold uppercase tracking-[0.18em] text-amber-700">
              ✓ Booking Confirmed
            </span>
            <h1 className="font-serif text-[clamp(24px,3.3vw,48px)] leading-[0.95] text-[#8e4f18]">
              Thank you, {booking.customerName.split(' ')[0]}
            </h1>
            <p className="mx-auto mt-1 max-w-3xl text-[11px] leading-snug text-[#8c633f]/80 sm:text-[13px]">
              Your reservation has been confirmed. We&apos;ve sent a confirmation email to{' '}
              <span className="font-semibold">{booking.customerEmail}</span>
            </p>
          </div>

          <div className="grid flex-1 gap-2.5 lg:grid-cols-12 lg:gap-25 xl:gap-8">
            {/* LEFT PANEL */}
            <div className="lg:col-span-6">
              <div
                className="relative h-full overflow-hidden rounded-2xl border border-[#e4cba2]/60 p-2.5 shadow-[0_10px_22px_rgba(84,52,20,0.14)]"
                style={{
                  backgroundImage: 'url(/artimage.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#f8ecd8',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#241507]/15 via-transparent to-[#fff4df]/35" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-2.5 flex items-center justify-between border-b border-[#dfbd8a]/80 pb-2">
                    <div>
                      <p className="text-[10px] font-medium text-[#5f3b1a]/85">Booking Reference</p>
                      <p className="mt-0.5 font-mono text-lg font-bold text-[#79421d] sm:text-[34px]">
                        {booking.bookingId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-[#5f3b1a]/85">Status</p>
                      <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-[#e5f4de] px-2.5 py-1 text-[10px] font-semibold text-[#2f7f47]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34a853]" />
                        Confirmed
                      </span>
                    </div>
                  </div>

                  <div className="grid flex-1 grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2 rounded-xl border border-[#edcfa7] bg-white/82 px-2.5 py-2 backdrop-blur-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e9c78f] bg-[#fff4e2]">
                        <Calendar size={14} className="text-[#d38f24]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#e3dfdb]">Date</p>
                        <p className="truncate text-[12px] font-semibold text-[#4f3017] sm:text-[13px]">
                          {formatDate(booking.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-[#edcfa7] bg-white/82 px-2.5 py-2 backdrop-blur-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e9c78f] bg-[#fff4e2]">
                        <Clock size={14} className="text-[#d38f24]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#f2f0ef]">Time</p>
                        <p className="truncate text-[12px] font-semibold text-[#4f3017] sm:text-[13px]">
                          {formatTime(booking.time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-[#edcfa7] bg-white/82 px-2.5 py-2 backdrop-blur-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e9c78f] bg-[#fff4e2]">
                        <Users size={14} className="text-[#d38f24]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#f4f2f1]">Party Size</p>
                        <p className="truncate text-[12px] font-semibold text-[#4f3017] sm:text-[13px]">
                          {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-[#edcfa7] bg-white/82 px-2.5 py-2 backdrop-blur-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e9c78f] bg-[#fff4e2]">
                        <MapPin size={14} className="text-[#d38f24]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#f9f8f8]">Table</p>
                        <p className="truncate text-[12px] font-semibold text-[#4f3017] sm:text-[13px]">
                          {booking.tableNumber ? `Table ${booking.tableNumber}` : 'Table Pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="mt-2 rounded-xl border border-[#edcfa7] bg-white/82 px-2.5 py-2 backdrop-blur-sm">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#9f6d3f]">
                        Special Requests
                      </p>
                      <p className="mt-1 text-[12px] leading-snug text-[#4f3017]">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}

                  <div className="mt-2 rounded-xl border border-emerald-300/30 bg-gradient-to-r from-[#214e2f]/95 to-[#2b6e3d]/95 px-3 py-2.5 text-white">
                    <p className="text-[14px] font-semibold">We look forward to hosting you!</p>
                    <p className="mt-0.5 text-[12px] text-emerald-50/90">
                      Arrive a little early and enjoy a seamless dining experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="lg:col-span-6">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e7d2ae] bg-[#fffcf6]/80 p-2.5">
                <div className="mb-2 flex items-start justify-between gap-3 rounded-xl border border-[#e6d9be] bg-[#f8fbf5] p-2.5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100/90">
                      <Mail size={16} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-[22px] font-semibold text-[#2f5f40]">{paidLabel}</p>
                      <p className="text-[22px] text-[#2f5f40]/80">{formatCurrency(paidAmount)}</p>
                      {charges?.cartSubtotal ? (
                        <p className="mt-0.5 text-[10px] text-emerald-700/80">
                          {formatCurrency(charges.baseDepositAmount)} deposit +{' '}
                          {formatCurrency(charges.cartSubtotal)} pre-order menu
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <span className="rounded-full bg-[#d8edd7] px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    ✓ Paid
                  </span>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl border border-[#ead8b9]/80 bg-white/90 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-[#9f6d3f]">Customer</p>
                    <p className="mt-0.5 truncate text-[14px] font-semibold text-[#4f3017]">{booking.customerName}</p>
                  </div>
                  <div className="rounded-xl border border-[#ead8b9]/80 bg-white/90 p-2">
                    <p className="text-[10px] uppercase tracking-wide text-[#9f6d3f]">Email</p>
                    <p className="mt-0.5 truncate text-[14px] font-semibold text-[#4f3017]">{booking.customerEmail}</p>
                  </div>
                </div>

                <div className="mb-2 rounded-xl border border-[#ead8b9]/80 bg-white/90 p-2.5">
                  <h3 className="mb-1.5 font-serif text-[18px] text-[#8e4f18] sm:text-[22px]">
                    Important Information
                  </h3>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/50 bg-amber-700/10">
                        <span className="text-[9px] font-bold text-amber-700">1</span>
                      </div>
                      <p className="text-[12px] leading-snug text-amber-700/90">
                        Please arrive within 15 minutes of your reservation time.
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/50 bg-amber-700/10">
                        <span className="text-[9px] font-bold text-amber-700">2</span>
                      </div>
                      <p className="text-[12px] leading-snug text-amber-700/90">
                        Cancellations made at least 24 hours in advance will receive a full refund.
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/50 bg-amber-700/10">
                        <span className="text-[9px] font-bold text-amber-700">3</span>
                      </div>
                      <p className="text-[12px] leading-snug text-amber-700/90">
                        Smart casual attire is recommended for the best dining experience.
                      </p>
                    </div>
                  </div>
                </div>

                {actionMessage && (
                  <p className="mb-1.5 text-[10px] font-medium text-amber-700">{actionMessage}</p>
                )}

                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-amber-200/60 pt-2.5">
                  <Button
                    className="h-9 rounded-full bg-gradient-to-r from-[#24582f] to-[#2f7c44] px-4 text-[12px] font-medium text-white transition-all hover:brightness-95"
                    onClick={handleDownloadPdf}
                  >
                    <Download size={14} className="mr-1.5" />
                    Download PDF
                  </Button>

                  <Button
                    className="h-9 rounded-full border border-[#dfbc8b] bg-[#fdf5e6] px-5 text-[12px] font-medium text-[#8f5620] transition-all hover:bg-[#f7edd9]"
                    onClick={handleShare}
                  >
                    <Share2 size={14} className="mr-1.5" />
                    Share
                  </Button>

                  <Link
                    to="/"
                    className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-[#b96a11] to-[#ca790f] px-5 text-[12px] font-medium text-white transition-all hover:brightness-95"
                  >
                    <Home size={14} className="mr-1.5" />
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        {/* </div> */}
      </div>
    </div>
  );
};

export default BookingConfirmationPage;