import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingStore, useCustomerAuthStore, useMenuCartStore } from '@/store';
import { formatCurrency, formatDate, formatTime } from '@/mockData';

export const BookingDetailsPage = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuthStore();
  const { selectedDate, selectedTime, selectedGuests, setSelectedDate, setSelectedTime, setSelectedGuests } = useBookingStore();
  const { items: cartItems } = useMenuCartStore();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    <div className="min-h-screen pt-20 pb-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      <div className="absolute inset-y-0 -left-32 w-[450px] opacity-15 pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
        <img src="/bookpagerose.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="absolute inset-y-0 -right-32 w-[450px] opacity-15 pointer-events-none">
        <img src="/bookpagerose.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 items-start">
          <div className="pr-4">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-b from-amber-50 to-yellow-50 border border-amber-200/50">
              <div className="bg-white px-8 py-6 text-center border-b border-amber-100">
                <div className="text-4xl mb-2">🍽️</div>
                <h3 className="text-amber-900 font-serif text-sm tracking-widest uppercase font-semibold">LUXE RESERVE / YOUR RESERVATION</h3>
              </div>

              <div className="px-8 py-8">
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} className="text-amber-700" />
                    </div>
                    <div>
                      <p className="text-amber-900/60 text-xs font-medium uppercase">Date</p>
                      <p className="text-amber-900 font-medium">{formatDate(selectedDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={20} className="text-amber-700" />
                    </div>
                    <div>
                      <p className="text-amber-900/60 text-xs font-medium uppercase">Time</p>
                      <p className="text-amber-900 font-medium">{formatTime(selectedTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Users size={20} className="text-amber-700" />
                    </div>
                    <div>
                      <p className="text-amber-900/60 text-xs font-medium uppercase">Party Size</p>
                      <p className="text-amber-900 font-medium">{selectedGuests} {selectedGuests === 1 ? 'Guest' : 'Guests'}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-amber-200 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-700/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-700 font-bold text-lg">£</span>
                      </div>
                      <div>
                        <p className="text-amber-900/60 text-xs font-medium uppercase">Reservation Deposit</p>
                        <p className="text-amber-700 font-serif text-xl font-semibold">{formatCurrency(baseDepositAmount)}</p>
                      </div>
                    </div>

                    {hasPreOrder && (
                      <div className="flex items-center justify-between rounded-lg border border-amber-200/70 bg-white/65 px-3 py-2">
                        <p className="text-amber-900/75 text-xs font-semibold uppercase">Pre-order Dishes ({cartItemCount})</p>
                        <p className="text-amber-900 font-semibold">{formatCurrency(cartSubtotal)}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between rounded-lg border border-amber-300/80 bg-amber-100/70 px-3 py-2">
                      <p className="text-amber-900 text-xs font-bold uppercase tracking-wide">Total Charge Now</p>
                      <p className="text-amber-900 font-serif text-xl font-semibold">{formatCurrency(totalChargeNow)}</p>
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
                  className="w-full mt-8 px-4 py-2.5 rounded-lg border border-amber-700 text-amber-700 hover:bg-amber-50 font-medium transition-all text-sm"
                >
                  Change Selection
                </button>
              </div>

              <div className="bg-amber-100/50 px-8 py-6 border-t border-amber-200">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-amber-700 text-white">
                      1
                    </div>
                    <p className="text-xs mt-2 font-medium text-amber-900">Details</p>
                  </div>

                  <div className="flex-1 h-0.5 bg-amber-700" />

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-amber-200 text-amber-700">
                      2
                    </div>
                    <p className="text-xs mt-2 font-medium text-amber-700/60">Payment</p>
                  </div>

                  <div className="flex-1 h-0.5 bg-amber-200" />

                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-amber-200 text-amber-700">
                      3
                    </div>
                    <p className="text-xs mt-2 font-medium text-amber-700/60">Confirm</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/60 px-8 py-5 border-t border-black/10">
                <p className="text-xs text-amber-900/70 leading-relaxed">
                  <span className="font-semibold">Note:</span>{' '}
                  {hasPreOrder
                    ? `${formatCurrency(baseDepositAmount)} deposit + ${formatCurrency(cartSubtotal)} pre-order will be charged now.`
                    : `${formatCurrency(baseDepositAmount)} deposit secures your reservation.`}{' '}
                  Fully refundable with 24 hours notice.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,252,245,0.95),rgba(255,247,231,0.9))] shadow-[0_18px_40px_rgba(85,54,21,0.16)] h-fit sticky top-6">
            <div className="px-8 py-6 text-center border-b border-amber-200/70 bg-[linear-gradient(130deg,rgba(44,26,15,0.95),rgba(73,45,22,0.96),rgba(27,23,30,0.95))]">
              <h3 className="text-[#FFF8EE] font-serif text-[1.7rem] leading-none tracking-[0.01em]">Complete Your Details</h3>
              <p className="text-amber-200/80 text-[11px] mt-2 tracking-[0.18em] uppercase">Secure Checkout</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-2 w-8 rounded-full transition-colors bg-amber-300" />
                <span className="h-2 w-8 rounded-full transition-colors bg-white/30" />
                <span className="h-2 w-8 rounded-full transition-colors bg-white/30" />
              </div>
            </div>

            <div className="px-8 py-8">
              <h3 className="font-serif text-[1.8rem] text-amber-950 mb-2 leading-none">Your Information</h3>
              <p className="text-sm text-amber-900/70 mb-6">Your account details are used for this booking.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-amber-900 mb-2 block text-sm font-semibold">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      readOnly
                      className="h-11 rounded-xl bg-white border border-amber-200/80 text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-amber-900 mb-2 block text-sm font-semibold">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      readOnly
                      className="h-11 rounded-xl bg-white border border-amber-200/80 text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-amber-900 mb-2 block text-sm font-semibold">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    readOnly
                    className="h-11 rounded-xl bg-white border border-amber-200/80 text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-amber-900 mb-2 block text-sm font-semibold">Phone *</Label>
                  <div className="flex gap-2">
                    <div className="w-16 pt-2.5">
                      <span className="text-amber-900 text-sm font-semibold">+ 44</span>
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-11 flex-1 rounded-xl bg-white border border-amber-200/80 text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                      placeholder="7123 456789"
                    />
                  </div>
                  <p className="mt-2 text-xs text-amber-800/70">Need to change your name or email? Update your account and sign in again.</p>
                </div>

                <div>
                  <Label htmlFor="specialRequests" className="text-amber-900 mb-2 block text-sm font-semibold">
                    Special Requests
                  </Label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    className="w-full h-24 resize-none rounded-xl bg-white border border-amber-200/80 px-3 py-2 text-sm text-amber-950 placeholder:text-amber-700/45 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="e.g., dietary requirements, special occasion"
                  />
                </div>
              </div>

              <Button
                onClick={() => navigate('/booking/payment', { state: formData })}
                disabled={!isDetailsValid}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                className="w-full text-center text-amber-700 hover:text-amber-900 transition-colors mt-3 text-sm font-semibold"
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
