import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Check, Calendar, Clock, Users, MapPin, Mail, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, formatCurrency } from '@/lib/mockData';
import { jsPDF } from 'jspdf';
import type { Booking } from '@/types';

export const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking as Booking | undefined;
  const [actionMessage, setActionMessage] = useState<string>('');

  const getShareText = (activeBooking: Booking) => [
    `LuxeReserve Booking Confirmed (${activeBooking.bookingId})`,
    `Name: ${activeBooking.customerName}`,
    `Date: ${formatDate(activeBooking.date)}`,
    `Time: ${formatTime(activeBooking.time)}`,
    `Guests: ${activeBooking.guests}`,
    `Table: ${activeBooking.tableNumber ? `Table ${activeBooking.tableNumber}` : 'To be assigned'}`,
  ].join('\n');

  const handleDownloadPdf = () => {
    if (!booking) {
      return;
    }

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
      ['Deposit', `${formatCurrency(booking.depositAmount)} (${booking.paymentStatus})`],
    ];

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

    const shareText = getShareText(booking);
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
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  if (!booking) return null;

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl overflow-hidden shadow-lg bg-white p-5 sm:p-8 sm:py-10 lg:p-10">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-emerald-600" />
          </div>
          <span className="inline-block text-amber-700 text-xs font-bold tracking-widest uppercase mb-3">✓ Booking Confirmed</span>
          <h1 className="font-serif text-amber-900 text-[clamp(38px,5.2vw,56px)] leading-[0.92] mb-4">
            Thank you, {booking.customerName.split(' ')[0]}
          </h1>
          <p className="text-amber-800/70 text-lg max-w-3xl mx-auto">
            Your reservation has been confirmed. We've sent a confirmation email to <span className="font-semibold">{booking.customerEmail}</span>
          </p>
        </div>

        {/* Booking Card */}
        <div className="rounded-xl border border-amber-200/50 p-8 mb-8 bg-gradient-to-br from-amber-50/80 to-yellow-50/80 relative overflow-hidden" style={{
          backgroundImage: 'url(/artimage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/35 via-white/40 to-white/92 rounded-xl" />
          
          {/* Content wrapper */}
          <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-amber-200/60">
            <div>
              <p className="text-amber-700/70 text-sm font-medium mb-1">Booking Reference</p>
              <p className="font-mono text-2xl text-amber-700 font-bold">{booking.bookingId}</p>
            </div>
            <div className="text-right">
              <p className="text-amber-700/70 text-sm font-medium mb-1">Status</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-700 text-sm border border-emerald-300/50 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Confirmed
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar size={22} className="text-amber-700" />
              </div>
              <div>
                <p className="text-amber-700/60 text-xs font-semibold uppercase">Date</p>
                <p className="text-amber-900 font-medium mt-1">{formatDate(booking.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock size={22} className="text-amber-700" />
              </div>
              <div>
                <p className="text-amber-700/60 text-xs font-semibold uppercase">Time</p>
                <p className="text-amber-900 font-medium mt-1">{formatTime(booking.time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users size={22} className="text-amber-700" />
              </div>
              <div>
                <p className="text-amber-700/60 text-xs font-semibold uppercase">Party Size</p>
                <p className="text-amber-900 font-medium mt-1">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <MapPin size={22} className="text-amber-700" />
              </div>
              <div>
                <p className="text-amber-700/60 text-xs font-semibold uppercase">Table</p>
                <p className="text-amber-900 font-medium mt-1">
                  {booking.tableNumber ? `Table ${booking.tableNumber}` : 'To be assigned'}
                </p>
              </div>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="pt-6 border-t border-amber-200/60">
              <p className="text-amber-700/70 text-sm font-semibold mb-2 uppercase">Special Requests</p>
              <p className="text-amber-900">{booking.specialRequests}</p>
            </div>
          )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="rounded-xl border border-amber-200/50 p-6 mb-8 bg-gradient-to-br from-emerald-50/80 to-teal-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Mail size={22} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-emerald-900 font-semibold">Deposit Paid</p>
                <p className="text-emerald-700/70 text-sm">{formatCurrency(booking.depositAmount)}</p>
              </div>
            </div>
            <span className="text-emerald-700 text-sm font-bold bg-emerald-100/60 px-3 py-1 rounded-full">✓ Paid</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-12">
          <Button className="bg-amber-700 hover:bg-amber-800 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-all" onClick={handleDownloadPdf}>
            <Download size={18} />
            Download PDF
          </Button>
          <Button className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-all border border-amber-200" onClick={handleShare}>
            <Share2 size={18} />
            Share
          </Button>
        </div>
        {actionMessage && (
          <p className="text-sm text-amber-700 mb-8 -mt-6 font-medium">{actionMessage}</p>
        )}

        {/* Important Info */}
        <div className="space-y-4 mb-12">
          <h3 className="font-serif text-3xl text-amber-900">Important Information</h3>
          <div className="rounded-xl border border-amber-200/50 p-6 space-y-4 bg-gradient-to-br from-amber-50/60 to-yellow-50/60">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-700/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-300/50">
                <span className="text-amber-700 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-amber-900 font-semibold mb-1">Arrival Time</p>
                <p className="text-amber-700/70 text-sm">
                  Please arrive within 15 minutes of your reservation time. 
                  Your table may be released after this time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-700/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-300/50">
                <span className="text-amber-700 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-amber-900 font-semibold mb-1">Cancellation Policy</p>
                <p className="text-amber-700/70 text-sm">
                  Cancellations made at least 24 hours in advance will receive a full refund. 
                  Late cancellations may forfeit the deposit.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-700/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-300/50">
                <span className="text-amber-700 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-amber-900 font-semibold mb-1">Dress Code</p>
                <p className="text-amber-700/70 text-sm">
                  Smart casual attire is recommended for the best dining experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-medium py-2 px-8 rounded-lg transition-all">
            Return to Home
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};
