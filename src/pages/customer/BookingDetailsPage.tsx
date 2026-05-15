import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingStore, useCustomerAuthStore, useMenuCartStore, useTableStore } from '@/store';
import { formatCurrency, formatDate, formatTime } from '@/restaurantUtils';

export const BookingDetailsPage = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuthStore();
  const {
    selectedDate,
    selectedTime,
    selectedGuests,
    setSelectedDate,
    setSelectedTime,
    setSelectedGuests,
  } = useBookingStore();
  const { items: cartItems } = useMenuCartStore();
  const { selectedTable } = useTableStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  useEffect(() => {
    if (!customer) {
      return;
    }

    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      specialRequests: '',
    });
  }, [customer]);

  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      navigate('/booking', { replace: true });
    }
  }, [navigate, selectedDate, selectedTime]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const baseDepositAmount = 5;
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalChargeNow = baseDepositAmount + cartSubtotal;
  const hasPreOrder = cartSubtotal > 0;
  const isDetailsValid = Boolean(customer?.firstName && customer?.lastName && customer?.email && formData.phone);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf8f3] via-[#f5f2ed] to-[#f0eae0] text-zinc-900 pt-20 pb-4">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/bookpayment.png" className="w-full h-full object-cover opacity-8" alt="" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#faf8f3]/40 via-transparent to-[#f5f2ed]/30" />
      </div>

      <div
        className="absolute inset-y-0 -left-32 w-[450px] opacity-15 pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
      >
        <img src="/bookpayment.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="absolute inset-y-0 -right-32 w-[450px] opacity-15 pointer-events-none">
        <img src="/bookpayment.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* LEFT SUMMARY PANEL */}
          <div className="lg:col-span-6 pr-0 lg:pr-4">
            <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-lg backdrop-blur-xl">
              <div className="border-b border-amber-200/40 bg-gradient-to-r from-amber-100/60 to-amber-50/60 px-5 py-3 text-center backdrop-blur-sm">
                <div className="mb-0.5 text-2xl">🍽️</div>
                <h3 className="font-serif text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-900">
                  LUXE RESERVE / YOUR RESERVATION
                </h3>
              </div>

              <div className="px-5 py-3.5">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-4 rounded-lg bg-white/30 px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <Calendar size={16} className="text-amber-700" />
                      </div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-amber-900/60">Date</p>
                    </div>
                    <p className="text-right font-medium text-amber-900">{formatDate(selectedDate)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg bg-white/30 px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <Clock size={16} className="text-amber-700" />
                      </div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-amber-900/60">Time</p>
                    </div>
                    <p className="text-right font-medium text-amber-900">{formatTime(selectedTime)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg bg-white/30 px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <Users size={16} className="text-amber-700" />
                      </div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-amber-900/60">Party Size</p>
                    </div>
                    <p className="text-right font-medium text-amber-900">
                      {selectedGuests} {selectedGuests === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>

                    <div className="flex items-center justify-between gap-4 rounded-lg bg-white/30 px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                          <span className="text-base font-bold text-amber-700">#</span>
                        </div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-amber-900/60">Table</p>
                      </div>
                      <p className="text-right font-medium text-amber-900">{selectedTable ? `T${selectedTable.tableNumber}` : '—'}</p>
                    </div>

                  <div className="border-t border-amber-200 pt-2.5 space-y-2">
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-white/25 px-3 py-2">
                      
                      <p className="text-right font-serif text-lg font-semibold text-amber-700">
                        {formatCurrency(baseDepositAmount)}
                      </p>
                    </div>

                    {hasPreOrder && (
                      <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200/70 bg-white/65 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900/75">
                          Pre-order Dishes ({cartItemCount})
                        </p>
                        <p className="text-right font-semibold text-amber-900">{formatCurrency(cartSubtotal)}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-300/80 bg-amber-100/70 px-3 py-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900">
                        Total Charge Now
                      </p>
                      <p className="text-right font-serif text-lg font-semibold text-amber-900">
                        {formatCurrency(totalChargeNow)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDate('');
                    setSelectedTime('');
                    setSelectedGuests(0);
                    navigate('/booking');
                  }}
                  className="mt-3 w-full rounded-lg border border-amber-700 px-4 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-50"
                >
                  Change Selection
                </button>
              </div>

              <div className="border-t border-amber-200/40 bg-amber-100/40 px-5 py-3">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-[11px] font-bold text-white">
                      1
                    </div>
                    <p className="mt-1 text-[9px] font-medium text-amber-900">Details</p>
                  </div>

                  <div className="h-0.5 flex-1 bg-amber-700" />

                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-700">
                      2
                    </div>
                    <p className="mt-1 text-[9px] font-medium text-amber-700/60">Payment</p>
                  </div>

                  <div className="h-0.5 flex-1 bg-amber-200" />

                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-700">
                      3
                    </div>
                    <p className="mt-1 text-[9px] font-medium text-amber-700/60">Confirm</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/10 bg-amber-50/60 px-5 py-3">
                <p className="text-[11px] leading-relaxed text-amber-900/70">
                  <span className="font-semibold">Note:</span>{' '}
                  {hasPreOrder
                    ? `${formatCurrency(baseDepositAmount)} deposit + ${formatCurrency(cartSubtotal)} pre-order will be charged now.`
                    : `${formatCurrency(baseDepositAmount)} deposit secures your reservation.`}{' '}
                  Fully refundable with 24 hours notice.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="lg:col-span-6 h-fit overflow-hidden rounded-3xl border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,252,245,0.95),rgba(255,247,231,0.9))] shadow-[0_18px_40px_rgba(85,54,21,0.16)] sticky top-0">
            <div className="border-b border-amber-200/70 bg-[linear-gradient(130deg,rgba(44,26,15,0.95),rgba(73,45,22,0.96),rgba(27,23,30,0.95))] px-5 py-3 text-center">
              <h3 className="font-serif text-lg leading-none tracking-[0.01em] text-[#FFF8EE]">
                Complete Your Details
              </h3>
              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-amber-200/80">
                Secure Checkout
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="h-2 w-8 rounded-full bg-amber-300 transition-colors" />
                <span className="h-2 w-8 rounded-full bg-white/30 transition-colors" />
                <span className="h-2 w-8 rounded-full bg-white/30 transition-colors" />
              </div>
            </div>

            <div className="px-5 py-3.5">
              <h3 className="font-serif text-lg leading-none text-amber-950">
                Your Information
              </h3>
              <p className="mb-2.5 text-[11px] text-amber-900/70">
                Your account details are used for this booking.
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Label
                    htmlFor="firstName"
                    className="w-28 shrink-0 text-[13px] font-semibold text-amber-900"
                  >
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    readOnly
                    className="h-10 flex-1 rounded-xl border border-amber-200/80 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                    placeholder="John"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <Label
                    htmlFor="lastName"
                    className="w-28 shrink-0 text-[13px] font-semibold text-amber-900"
                  >
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    readOnly
                    className="h-10 flex-1 rounded-xl border border-amber-200/80 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                    placeholder="Doe"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <Label
                    htmlFor="email"
                    className="w-28 shrink-0 text-[13px] font-semibold text-amber-900"
                  >
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    readOnly
                    className="h-10 flex-1 rounded-xl border border-amber-200/80 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <Label
                    htmlFor="phone"
                    className="w-28 shrink-0 text-[13px] font-semibold text-amber-900"
                  >
                    Phone *
                  </Label>

                  <div className="flex flex-1 gap-2">
                    <div className="flex h-10 w-16 items-center justify-center rounded-xl border border-amber-200/80 bg-white text-[12px] font-semibold text-amber-900">
                      +44
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-10 flex-1 rounded-xl border border-amber-200/80 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                      placeholder="7123 456789"
                    />
                  </div>
                </div>

                <p className="pl-[7.5rem] text-[9px] text-amber-800/70 -mt-0.5">
                  Need to change your name or email? Update your account and sign in again.
                </p>

                <div className="flex items-start gap-2.5">
                  <Label
                    htmlFor="specialRequests"
                    className="w-28 shrink-0 pt-2 text-[13px] font-semibold text-amber-900"
                  >
                    Requests
                  </Label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className="h-12 w-full resize-none rounded-xl border border-amber-200/80 bg-white px-3 py-2 text-[12px] text-amber-950 placeholder:text-amber-700/45 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Dietary requirements, occasion..."
                  />
                </div>
              </div>

              <Button
                onClick={() => navigate('/booking/payment', { state: formData })}
                disabled={!isDetailsValid}
                className="mt-3 h-10 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-sm font-semibold text-white transition-all hover:from-amber-700 hover:to-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Payment
              </Button>

              <button
                onClick={() => {
                  setSelectedDate('');
                  setSelectedTime('');
                  setSelectedGuests(0);
                  navigate('/booking');
                }}
                className="mt-1.5 w-full text-center text-xs font-semibold text-amber-700 transition-colors hover:text-amber-900"
              >
                Back to booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;