import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Shield, LockKeyhole, BadgeCheck } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="rounded-2xl border border-amber-200/70 bg-white/90 p-3.5 shadow-[0_14px_38px_rgba(128,78,24,0.12)]">
        <div className="mb-2.5 flex items-center justify-between gap-2.5">
          <span className="block text-[12px] font-semibold text-amber-950">Card Details</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-emerald-700">
            <LockKeyhole size={12} />
            Encrypted
          </span>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-white px-3 py-2.5 shadow-inner">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '13px',
                  color: '#3F2A1D',
                  '::placeholder': {
                    color: '#9C7A60',
                  },
                },
              },
            }}
          />
        </div>

        <p className="mt-1.5 text-[10px] text-amber-800/70">
          Your payment details are processed securely and never stored on our servers.
        </p>

        {error && <p className="mt-2 text-[13px] font-medium text-rose-600">{error}</p>}
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="h-10 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(180,95,25,0.28)] transition-all hover:from-amber-700 hover:to-amber-800 disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing secure payment...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard size={16} />
            Pay {formatCurrency(amount)} now
          </span>
        )}
      </Button>

      <div className="grid gap-1.5 text-[10px] sm:grid-cols-3">
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1.5 font-medium text-amber-900/80">
          <Shield size={12} /> PCI compliant
        </div>
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1.5 font-medium text-amber-900/80">
          <LockKeyhole size={12} /> 256-bit SSL
        </div>
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1.5 font-medium text-amber-900/80">
          <BadgeCheck size={12} /> Verified checkout
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

    const chosenTable =
      selectedTable && selectedTable.capacity >= selectedGuests && selectedTable.status !== 'blocked'
        ? selectedTable
        : findOptimalTable(selectedGuests, tables, [], selectedDate, selectedTime);

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf8f3] via-[#f5f2ed] to-[#f0eae0] text-zinc-900 pt-20 pb-4">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/bookfirstpage.png" className="w-full h-full object-cover opacity-8" alt="" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#faf8f3]/40 via-transparent to-[#f5f2ed]/30" />
      </div>

      <div
        className="absolute inset-y-0 -left-32 w-[450px] opacity-15 pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
      >
        <img src="/bookpagerose.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="absolute inset-y-0 -right-32 w-[450px] opacity-15 pointer-events-none">
        <img src="/bookpagerose.png" alt="" className="w-full h-full object-cover" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-3.5">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-100/60 px-3 py-1">
              <Sparkles size={14} className="text-amber-700" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                Booking Review
              </span>
            </div> */}

            <h1 className="font-serif text-3xl leading-[1.05] text-zinc-900 sm:text-4xl lg:text-5xl">
              Review Your <br />
              <span className="italic text-amber-700">Secure Payment</span>
            </h1>

            <div className="rounded-2xl border border-amber-300/30 bg-amber-100/10 p-3">
              <p className="text-xs leading-relaxed text-amber-900/85">
                Your reservation details are locked in. Complete the payment step to confirm the booking and send the final confirmation.
              </p>
            </div>

            <div className="rounded-3xl border border-amber-200/60 bg-amber-50/80 p-4 shadow-[0_18px_40px_rgba(126,89,36,0.12)] backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                  Booking Summary
                </h3>
                <span className="rounded-full border border-amber-200 bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-amber-900/75">
                  Step {step} of 3
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-4 rounded-xl bg-white/35 px-3 py-2 text-[12px]">
                  <span className="font-medium text-zinc-800">Date</span>
                  <span className="font-mono text-amber-800">{formatDate(selectedDate)}</span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl bg-white/35 px-3 py-2 text-[12px]">
                  <span className="font-medium text-zinc-800">Time</span>
                  <span className="font-mono text-amber-800">{formatTime(selectedTime)}</span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl bg-white/35 px-3 py-2 text-[12px]">
                  <span className="font-medium text-zinc-800">Guests</span>
                  <span className="font-mono text-amber-800">
                    {selectedGuests} {selectedGuests === 1 ? 'Guest' : 'Guests'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl bg-white/35 px-3 py-2 text-[12px]">
                  <span className="font-medium text-zinc-800">Table</span>
                  <span className="font-mono text-amber-800">{selectedTable ? `T${selectedTable.tableNumber}` : '—'}</span>
                </div>

                <div className="mt-1 border-t border-amber-200/60 pt-2.5 space-y-2">
                  

                  {hasPreOrder && (
                    <div className="flex items-center justify-between gap-4 text-[12px]">
                      <span className="font-medium text-zinc-800">Pre-order</span>
                      <span className="font-mono text-amber-800">{formatCurrency(cartSubtotal)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-300/50 bg-amber-100/50 px-3.5 py-2 text-[12px]">
                    <span className="font-semibold text-zinc-900">Pay Now</span>
                    <span className="font-serif text-lg text-amber-900">{formatCurrency(totalChargeNow)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-amber-300/50 bg-amber-100/45 p-3">
                <p className="text-[10px] leading-relaxed text-amber-900/85">
                  <span className="font-semibold">Note:</span>{' '}
                  {hasPreOrder
                    ? `${formatCurrency(baseDepositAmount)} deposit + ${formatCurrency(cartSubtotal)} pre-order will be charged now.`
                    : `${formatCurrency(baseDepositAmount)} deposit secures your reservation.`}{' '}
                  Fully refundable with 24 hours notice.
                </p>
              </div>
            </div>
          </div>

          <div className="h-fit rounded-3xl border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,252,245,0.95),rgba(255,247,231,0.9))] shadow-[0_18px_40px_rgba(85,54,21,0.16)] lg:col-span-6 sticky top-20 overflow-hidden">
            <div className="border-b border-amber-200/70 bg-[linear-gradient(130deg,rgba(44,26,15,0.95),rgba(73,45,22,0.96),rgba(27,23,30,0.95))] px-5 py-3.5 text-center">
              <h3 className="font-serif text-lg leading-none tracking-[0.01em] text-[#FFF8EE]">
                Complete Your Details
              </h3>
              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-amber-200/80">
                Secure Checkout
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-amber-300' : 'bg-white/30'}`} />
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-amber-300' : 'bg-white/30'}`} />
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 3 || isConfirmed ? 'bg-amber-300' : 'bg-white/30'}`} />
              </div>
            </div>

            {step === 2 && (
              <div className="px-5 py-3.5">
                <h3 className="mb-0.5 font-serif text-lg leading-none text-amber-950">Payment Details</h3>
                <p className="mb-2.5 text-[11px] text-amber-900/70">
                  Review and pay your reservation charges securely.
                </p>

                <div className="mb-3 rounded-xl border border-amber-200/80 bg-white/80 p-3 text-[12px]">
                  <div className="flex items-center justify-between text-amber-900/80">
                    <span>Reservation deposit</span>
                    <span className="font-semibold">{formatCurrency(baseDepositAmount)}</span>
                  </div>
                  {hasPreOrder && (
                    <div className="mt-1.5 flex items-center justify-between text-amber-900/80">
                      <span>
                        Pre-order menu ({cartItemCount} item{cartItemCount === 1 ? '' : 's'})
                      </span>
                      <span className="font-semibold">{formatCurrency(cartSubtotal)}</span>
                    </div>
                  )}
                  <div className="mt-1.5 flex items-center justify-between border-t border-amber-200 pt-1.5 text-amber-950">
                    <span className="text-[11px] font-semibold uppercase tracking-wide">Pay Now</span>
                    <span className="font-serif text-base font-semibold">{formatCurrency(totalChargeNow)}</span>
                  </div>
                </div>

                <Elements stripe={stripePromise}>
                  <PaymentForm onSuccess={handlePaymentSuccess} amount={totalChargeNow} />
                </Elements>

                {saveError && <p className="mt-2 text-center text-[12px] font-semibold text-red-600">{saveError}</p>}

                <button
                  onClick={() => navigate('/booking/details')}
                  className="mt-2 w-full text-center text-xs font-semibold text-amber-700 transition-colors hover:text-amber-900"
                >
                  Back to details
                </button>
              </div>
            )}

            {isConfirmed && (
              <div className="px-5 py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check size={24} className="text-emerald-600" />
                </div>
                <h3 className="mb-1 font-serif text-lg text-amber-900">Booking Confirmed!</h3>
                <p className="mb-1 text-xs font-medium text-amber-700">Your reservation is secure.</p>
                <p className="text-[11px] text-amber-600">Redirecting to your confirmation page...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPaymentPage;