import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Calendar, Clock, Users, CreditCard, Shield, LockKeyhole, BadgeCheck } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useBookingStore, useCustomerAuthStore, useMenuCartStore, useTableStore } from '@/store';
import { formatCurrency, formatDate, formatTime, generateBookingId, findOptimalTable } from '@/mockData';
import { saveBooking } from '@/backendBookingApi';
import { sendBookingConfirmationEmail } from '@/bookingEmailApi';
import type { Booking } from '@/types';

const stripePromise = loadStripe('pk_test_your_publishable_key');

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

const PaymentForm = ({
  onSuccess,
  amount,
}: {
  onSuccess: () => Promise<{ ok: boolean; error?: string }>;
  amount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError('');

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = await onSuccess();

    if (!result.ok) {
      setError(result.error ?? 'Unable to save your booking. Please try again.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-amber-200/70 bg-white/90 p-5 sm:p-6 shadow-[0_14px_38px_rgba(128,78,24,0.12)]">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-amber-950 text-base font-semibold block">Card Details</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[11px] uppercase tracking-[0.12em]">
            <LockKeyhole size={12} />
            Encrypted
          </span>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-white px-4 py-4 shadow-inner">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#3F2A1D',
                  '::placeholder': {
                    color: '#9C7A60',
                  },
                },
              },
            }}
          />
        </div>
        <p className="text-amber-800/70 text-xs mt-3">
          Your payment details are processed securely and never stored on our servers.
        </p>
        {error && (
          <p className="text-rose-600 text-sm mt-2 font-medium">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-[0_12px_24px_rgba(180,95,25,0.28)] disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing secure payment...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard size={18} />
            Pay {formatCurrency(amount)} now
          </span>
        )}
      </Button>

      <div className="grid sm:grid-cols-3 gap-2.5 text-xs">
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-3 py-2 text-amber-900/80 font-medium">
          <Shield size={13} /> PCI compliant
        </div>
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-3 py-2 text-amber-900/80 font-medium">
          <LockKeyhole size={13} /> 256-bit SSL
        </div>
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-3 py-2 text-amber-900/80 font-medium">
          <BadgeCheck size={13} /> Verified checkout
        </div>
      </div>
    </form>
  );
};

export const BookingPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer } = useCustomerAuthStore();
  const { selectedDate, selectedTime, selectedGuests } = useBookingStore();
  const { items: cartItems, clearCart } = useMenuCartStore();
  const { tables, selectedTable, setSelectedTable } = useTableStore();

  const formData = (location.state as BookingFormData | undefined) ?? {
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    specialRequests: '',
  };

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      navigate('/booking', { replace: true });
    }
  }, [navigate, selectedDate, selectedTime]);

  const baseDepositAmount = 5;
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalChargeNow = baseDepositAmount + cartSubtotal;
  const hasPreOrder = cartSubtotal > 0;

  const handlePaymentSuccess = async (): Promise<{ ok: boolean; error?: string }> => {
    setSaveError('');

    const chosenTable = selectedTable && selectedTable.capacity >= selectedGuests && selectedTable.status !== 'blocked'
      ? selectedTable
      : findOptimalTable(
          selectedGuests,
          tables,
          [],
          selectedDate,
          selectedTime,
        );

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      bookingId: generateBookingId(),
      customerName: `${customer?.firstName ?? formData.firstName} ${customer?.lastName ?? formData.lastName}`.trim(),
      customerEmail: customer?.email ?? formData.email,
      customerPhone: formData.phone,
      date: selectedDate,
      time: selectedTime,
      guests: selectedGuests,
      tableId: chosenTable?.id,
      tableNumber: chosenTable?.tableNumber,
      status: 'confirmed',
      specialRequests: formData.specialRequests,
      depositAmount: totalChargeNow,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveResult = await saveBooking(newBooking);
    if (!saveResult.ok) {
      const errorMessage = saveResult.error ?? 'Unable to save your booking to database.';
      setSaveError(errorMessage);
      console.warn('Backend booking save failed:', errorMessage);
      return { ok: false, error: errorMessage };
    }

    if (chosenTable) {
      const timeSlot = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      setSelectedTable(chosenTable);
      // keep the existing booking payload and handoff, table state is preserved in the store
      void timeSlot;
    }

    void sendBookingConfirmationEmail(newBooking).then((result) => {
      if (!result.ok) {
        console.warn('Booking confirmation email was not sent:', result.error);
      }
    });

    setIsConfirmed(true);
    setSelectedTable(null);
    clearCart();
    
    navigate('/confirmation', {
      state: {
        booking: newBooking,
        charges: {
          baseDepositAmount,
          cartSubtotal,
          totalPaid: totalChargeNow,
          itemCount: cartItemCount,
        },
        saveOk: true,
      },
    });

    return { ok: true };
  };

  if (!selectedDate || !selectedTime) {
    return null;
  }

  const step = 2;

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
                    setSelectedTable(null);
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-700'}`}>
                      1
                    </div>
                    <p className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-amber-900' : 'text-amber-700/60'}`}>Details</p>
                  </div>

                  <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-amber-700' : 'bg-amber-200'}`} />

                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-700'}`}>
                      2
                    </div>
                    <p className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-amber-900' : 'text-amber-700/60'}`}>Payment</p>
                  </div>

                  <div className={`flex-1 h-0.5 ${step >= 3 || isConfirmed ? 'bg-amber-700' : 'bg-amber-200'}`} />

                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 || isConfirmed ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-700'}`}>
                      3
                    </div>
                    <p className={`text-xs mt-2 font-medium ${step >= 3 || isConfirmed ? 'text-amber-900' : 'text-amber-700/60'}`}>Confirm</p>
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
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-amber-300' : 'bg-white/30'}`} />
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-amber-300' : 'bg-white/30'}`} />
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 3 || isConfirmed ? 'bg-amber-300' : 'bg-white/30'}`} />
              </div>
            </div>

            {step === 2 && (
              <div className="px-8 py-8">
                <h3 className="font-serif text-[1.8rem] text-amber-950 mb-2 leading-none">Payment Details</h3>
                <p className="text-sm text-amber-900/70 mb-4">Review and pay your reservation charges securely.</p>

                <div className="mb-6 rounded-xl border border-amber-200/80 bg-white/80 p-4 text-sm">
                  <div className="flex items-center justify-between text-amber-900/80">
                    <span>Reservation deposit</span>
                    <span className="font-semibold">{formatCurrency(baseDepositAmount)}</span>
                  </div>
                  {hasPreOrder && (
                    <div className="mt-2 flex items-center justify-between text-amber-900/80">
                      <span>Pre-order menu ({cartItemCount} item{cartItemCount === 1 ? '' : 's'})</span>
                      <span className="font-semibold">{formatCurrency(cartSubtotal)}</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between border-t border-amber-200 pt-3 text-amber-950">
                    <span className="font-semibold uppercase tracking-wide text-xs">Pay Now</span>
                    <span className="font-serif text-xl font-semibold">{formatCurrency(totalChargeNow)}</span>
                  </div>
                </div>

                <Elements stripe={stripePromise}>
                  <PaymentForm onSuccess={handlePaymentSuccess} amount={totalChargeNow} />
                </Elements>

                {saveError && (
                  <p className="mt-4 text-center text-sm text-red-600 font-semibold">{saveError}</p>
                )}

                <button
                  onClick={() => navigate('/booking/details')}
                  className="w-full text-center text-amber-700 hover:text-amber-900 transition-colors mt-4 font-semibold"
                >
                  Back to details
                </button>
              </div>
            )}

            {isConfirmed && (
              <div className="px-8 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <h3 className="font-serif text-2xl text-amber-900 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-amber-700 mb-2 text-sm font-medium">
                  Your reservation is secure.
                </p>
                <p className="text-amber-600 text-xs">
                  Redirecting to your confirmation page...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentPage;
