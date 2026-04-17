import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Check, Calendar, Clock, Users, MapPin, Mail, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, formatCurrency } from '@/lib/mockData';
import type { Booking } from '@/types';

export const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking as Booking | undefined;

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-emerald-500" />
          </div>
          <span className="eyebrow block mb-3">Booking Confirmed</span>
          <h1 className="font-serif text-[clamp(32px,4vw,56px)] uppercase text-[#F4F6FA] leading-[0.95] mb-4">
            Thank you, {booking.customerName.split(' ')[0]}
          </h1>
          <p className="text-[#A9B1BE] text-lg">
            Your reservation has been confirmed. We've sent a confirmation email to {booking.customerEmail}
          </p>
        </div>

        {/* Booking Card */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[rgba(244,246,250,0.08)]">
            <div>
              <p className="text-[#A9B1BE] text-sm mb-1">Booking Reference</p>
              <p className="font-mono text-2xl text-[#D4A23A]">{booking.bookingId}</p>
            </div>
            <div className="text-right">
              <p className="text-[#A9B1BE] text-sm mb-1">Status</p>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Confirmed
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
                <Calendar size={22} className="text-[#D4A23A]" />
              </div>
              <div>
                <p className="text-[#A9B1BE] text-sm">Date</p>
                <p className="text-[#F4F6FA] font-medium">{formatDate(booking.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
                <Clock size={22} className="text-[#D4A23A]" />
              </div>
              <div>
                <p className="text-[#A9B1BE] text-sm">Time</p>
                <p className="text-[#F4F6FA] font-medium">{formatTime(booking.time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
                <Users size={22} className="text-[#D4A23A]" />
              </div>
              <div>
                <p className="text-[#A9B1BE] text-sm">Party Size</p>
                <p className="text-[#F4F6FA] font-medium">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
                <MapPin size={22} className="text-[#D4A23A]" />
              </div>
              <div>
                <p className="text-[#A9B1BE] text-sm">Table</p>
                <p className="text-[#F4F6FA] font-medium">
                  {booking.tableNumber ? `Table ${booking.tableNumber}` : 'To be assigned'}
                </p>
              </div>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="pt-6 border-t border-[rgba(244,246,250,0.08)]">
              <p className="text-[#A9B1BE] text-sm mb-2">Special Requests</p>
              <p className="text-[#F4F6FA]">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
                <Mail size={22} className="text-[#D4A23A]" />
              </div>
              <div>
                <p className="text-[#F4F6FA] font-medium">Deposit Paid</p>
                <p className="text-[#A9B1BE] text-sm">{formatCurrency(booking.depositAmount)}</p>
              </div>
            </div>
            <span className="text-emerald-400 text-sm">Paid</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-12">
          <Button className="btn-gold flex items-center gap-2">
            <Download size={18} />
            Download PDF
          </Button>
          <Button className="btn-ghost flex items-center gap-2">
            <Share2 size={18} />
            Share
          </Button>
        </div>

        {/* Important Info */}
        <div className="space-y-4 mb-12">
          <h3 className="font-serif text-xl text-[#F4F6FA]">Important Information</h3>
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D4A23A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#D4A23A] text-xs">1</span>
              </div>
              <div>
                <p className="text-[#F4F6FA] font-medium mb-1">Arrival Time</p>
                <p className="text-[#A9B1BE] text-sm">
                  Please arrive within 15 minutes of your reservation time. 
                  Your table may be released after this time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D4A23A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#D4A23A] text-xs">2</span>
              </div>
              <div>
                <p className="text-[#F4F6FA] font-medium mb-1">Cancellation Policy</p>
                <p className="text-[#A9B1BE] text-sm">
                  Cancellations made at least 24 hours in advance will receive a full refund. 
                  Late cancellations may forfeit the deposit.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D4A23A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#D4A23A] text-xs">3</span>
              </div>
              <div>
                <p className="text-[#F4F6FA] font-medium mb-1">Dress Code</p>
                <p className="text-[#A9B1BE] text-sm">
                  Smart casual attire is recommended for the best dining experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link to="/" className="btn-gold-outline inline-flex items-center gap-2">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
