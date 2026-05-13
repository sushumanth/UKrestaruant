import { saveBookingToSupabase } from '@/lib/supabaseBookingApi';
import { sendBookingConfirmationEmail } from '@/lib/bookingEmailApi';
import {
  generateBookingId,
  findOptimalTable,
  formatCurrency,
  formatDate,
  formatTime,
} from '@/lib/mockData';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  CreditCard,
  LockKeyhole,
  Mail,
  Phone,
  Shield,
  User,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBookingStore, useMenuCartStore, useTableStore } from '@/store';

const stripePromise = loadStripe('pk_test_your_publishable_key');

type CustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
};

const PaymentForm = ({
  onSuccess,
  amount,
  onBack,
}: {
  onSuccess: () => Promise<{ ok: boolean; error?: string }>;
  amount: number;
  onBack: () => void;
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
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-[1.2rem] border border-[#eadfce] bg-[#fffdf8]/85 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Label className="block text-base font-semibold text-[#3d3128]">
            Card Details
          </Label>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            <LockKeyhole size={12} />
            Encrypted
          </span>
        </div>

        <div className="rounded-xl border border-[#d9cbb8] bg-white px-4 py-4 shadow-inner">
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

        <p className="mt-3 text-xs leading-5 text-[#8a7c6d]">
          Your payment details are processed securely and never stored on our servers.
        </p>

        {error && (
          <p className="mt-3 text-sm font-semibold text-rose-600">
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#c39243,#a56f25)] px-6 text-sm font-bold text-white shadow-[0_10px_22px_rgba(165,111,37,0.28)] transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Processing secure payment...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Pay {formatCurrency(amount)} now
            <ArrowRight size={18} />
          </>
        )}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#8a6d46] transition hover:text-[#5f4727]"
      >
        <ArrowLeft size={15} />
        Back to account details
      </button>

      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#eadfce] bg-white/70 px-3 py-2 font-medium text-[#7a6c60]">
          <Shield size={13} />
          PCI compliant
        </div>

        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#eadfce] bg-white/70 px-3 py-2 font-medium text-[#7a6c60]">
          <LockKeyhole size={13} />
          256-bit SSL
        </div>

        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#eadfce] bg-white/70 px-3 py-2 font-medium text-[#7a6c60]">
          <BadgeCheck size={13} />
          Verified checkout
        </div>
      </div>
    </form>
  );
};

export const BookingPaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    selectedDate,
    selectedTime,
    selectedGuests,
    addBooking,
    setSelectedDate,
    setSelectedTime,
    setSelectedGuests,
  } = useBookingStore();

  const dateFromUrl = searchParams.get('date') ?? '';
  const timeFromUrl = searchParams.get('time') ?? '';
  const guestsFromUrl = Number(searchParams.get('guests') ?? 0);
  const tableIdFromUrl = searchParams.get('tableId') ?? '';

  const { tables, selectedTable, setSelectedTable, updateTableStatus } = useTableStore();
  const { items: cartItems, clearCart } = useMenuCartStore();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);

  const baseDepositAmount = 5;

  const cartSubtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const totalChargeNow = baseDepositAmount + cartSubtotal;
  const hasPreOrder = cartSubtotal > 0;

  useEffect(() => {
    if (!dateFromUrl || !timeFromUrl || !guestsFromUrl) {
      navigate('/book', { replace: true });
      return;
    }

    const savedCustomerDetails = sessionStorage.getItem('bookingCustomerDetails');

    if (!savedCustomerDetails) {
      navigate(
        `/book/checkout?date=${dateFromUrl}&time=${timeFromUrl}&guests=${guestsFromUrl}&tableId=${tableIdFromUrl}`,
        { replace: true }
      );
      return;
    }

    const parsedCustomerDetails = JSON.parse(savedCustomerDetails) as CustomerDetails;

    setCustomerDetails(parsedCustomerDetails);
    setSelectedDate(dateFromUrl);
    setSelectedTime(timeFromUrl);
    setSelectedGuests(guestsFromUrl);

    if (tableIdFromUrl) {
      const tableFromUrl = tables.find((table) => table.id === tableIdFromUrl) ?? null;
      setSelectedTable(tableFromUrl);
    }
  }, [
    dateFromUrl,
    timeFromUrl,
    guestsFromUrl,
    tableIdFromUrl,
    navigate,
    setSelectedDate,
    setSelectedTime,
    setSelectedGuests,
    setSelectedTable,
    tables,
  ]);

  const reservationTableLabel = useMemo(() => {
    if (selectedTable?.tableNumber) {
      return `T${selectedTable.tableNumber}`;
    }

    if (tableIdFromUrl) {
      const matched = tables.find((table) => table.id === tableIdFromUrl);

      if (matched?.tableNumber) {
        return `T${matched.tableNumber}`;
      }
    }

    return 'Auto Assign';
  }, [selectedTable, tableIdFromUrl, tables]);

  const goBackToDetails = () => {
    navigate(
      `/book/checkout?date=${dateFromUrl}&time=${timeFromUrl}&guests=${guestsFromUrl}&tableId=${tableIdFromUrl}`
    );
  };

  const handlePaymentSuccess = async (): Promise<{ ok: boolean; error?: string }> => {
    if (!customerDetails) {
      return {
        ok: false,
        error: 'Customer details are missing. Please go back and enter your details again.',
      };
    }

    setSaveError('');

    const chosenTable =
      selectedTable && selectedTable.capacity >= selectedGuests && selectedTable.status !== 'blocked'
        ? selectedTable
        : findOptimalTable(selectedGuests, tables, [], selectedDate, selectedTime);

    const newBooking = {
      id: `booking-${Date.now()}`,
      bookingId: generateBookingId(),
      customerName: `${customerDetails.firstName} ${customerDetails.lastName}`,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone,
      date: selectedDate,
      time: selectedTime,
      guests: selectedGuests,
      tableId: chosenTable?.id,
      tableNumber: chosenTable?.tableNumber,
      status: 'confirmed' as const,
      specialRequests: customerDetails.specialRequests,
      depositAmount: totalChargeNow,
      paymentStatus: 'paid' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveResult = await saveBookingToSupabase(newBooking);

    if (!saveResult.ok) {
      const errorMessage = saveResult.error ?? 'Unable to save your booking to database.';
      setSaveError(errorMessage);
      console.warn('Supabase booking save failed:', errorMessage);
      return { ok: false, error: errorMessage };
    }

    addBooking(newBooking);

    if (chosenTable) {
      const timeSlot = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      updateTableStatus(chosenTable.id, 'booked', timeSlot);
    }

    void sendBookingConfirmationEmail(newBooking).then((result) => {
      if (!result.ok) {
        console.warn('Booking confirmation email was not sent:', result.error);
      }
    });

    setIsConfirmed(true);

    setTimeout(() => {
      sessionStorage.removeItem('bookingCustomerDetails');
      setSelectedTable(null);
      clearCart();

      navigate(`/book/confirmation/${newBooking.bookingId}`, {
        state: {
          booking: newBooking,
          charges: {
            baseDepositAmount,
            cartSubtotal,
            totalPaid: totalChargeNow,
            itemCount: cartItemCount,
          },
        },
      });
    }, 1500);

    return { ok: true };
  };

  if (!customerDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1ed]">
        <div className="rounded-2xl bg-white px-8 py-6 text-amber-900 shadow-lg">
          Loading payment details...
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#efe8dc] px-3 py-3 sm:px-4 lg:px-5">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <img
          src="/bookfirstpage.png"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <div className="relative z-10 mt-20 mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#fffaf1]/90 shadow-[0_22px_55px_rgba(65,42,25,0.2)] backdrop-blur-xl">
          <div className="px-4 pb-4 pt-5 text-center sm:px-6">
            <div className="relative mx-auto flex w-fit items-center justify-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-600/50 bg-amber-700/40">
                <span className="text-lg font-serif text-amber-200">🍽️</span>
              </div>

              <p className="font-serif text-[clamp(1.15rem,2.2vw,1.7rem)] tracking-[0.26em] text-[#1f1813]">
                LUXE RESERVE
              </p>
            </div>

            <div className="mx-auto mt-1 flex w-fit items-center justify-center gap-5">
              <span className="h-px w-10 bg-[#b98b42]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#b98b42]">
                Secure Reservation Checkout
              </p>
              <span className="h-px w-10 bg-[#b98b42]" />
            </div>

            {/* Stepper */}
            <div className="mx-auto mt-5 flex max-w-md items-start justify-center">
    <div className="flex flex-col items-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d5b77a] bg-[#d5b77a] text-sm font-bold text-white">
        <Check size={16} />
      </span>
      <span className="mt-1 text-xs font-semibold text-[#8a6d46]">
        Details
      </span>
    </div>

    <div className="mx-3 mt-4 h-px flex-1 bg-[#d5b77a]" />

    <div className="flex flex-col items-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b98b42] bg-[#b98b42] text-sm font-bold text-white shadow-[0_8px_18px_rgba(185,139,66,0.3)]">
        2
      </span>
      <span className="mt-1 text-xs font-semibold text-[#4b3e33]">
        Payment
      </span>
    </div>

    <div className="mx-3 mt-4 h-px flex-1 bg-[#d9cbb8]" />

    <div className="flex flex-col items-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9cbb8] bg-white/70 text-sm font-bold text-[#9a8d80]">
        3
      </span>
      <span className="mt-1 text-xs font-semibold text-[#8a7c6d]">
        Confirm
      </span>
    </div>
  </div>
</div>

          <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[330px_1fr] lg:px-7 lg:py-5">
            {/* LEFT SUMMARY */}
            <aside className="rounded-[1.2rem] border border-[#eadfce] bg-white/45 p-4 shadow-sm backdrop-blur-md">
              <h2 className="font-serif text-[1.8rem] leading-none text-[#2b2018]">
                Review Details
              </h2>

              <div className="mt-4 space-y-4 border-t border-[#eadfce] pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf2e4] text-[#a8752b]">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8a77]">
                      Name
                    </p>
                    <p className="text-base font-medium text-[#43372d]">
                      {customerDetails.firstName} {customerDetails.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf2e4] text-[#a8752b]">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8a77]">
                      Email
                    </p>
                    <p className="truncate text-base font-medium text-[#43372d]">
                      {customerDetails.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf2e4] text-[#a8752b]">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8a77]">
                      Phone
                    </p>
                    <p className="text-base font-medium text-[#43372d]">
                      +44 {customerDetails.phone}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#eadfce] pt-4" />

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf2e4] text-[#a8752b]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8a77]">
                      Date
                    </p>
                    <p className="text-base font-medium text-[#43372d]">
                      {selectedDate ? formatDate(selectedDate) : '--'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf2e4] text-[#a8752b]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8a77]">
                      Time
                    </p>
                    <p className="text-base font-medium text-[#43372d]">
                      {selectedTime ? formatTime(selectedTime) : '--'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf2e4] text-[#a8752b]">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8a77]">
                      Party Size
                    </p>
                    <p className="text-base font-medium text-[#43372d]">
                      {selectedGuests} {selectedGuests === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf2e4] text-[#a8752b]">
                    <UtensilsCrossed size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8a77]">
                      Table
                    </p>
                    <p className="text-base font-medium text-[#43372d]">
                      {reservationTableLabel}
                    </p>
                  </div>
                </div>

                {customerDetails.specialRequests && (
                  <div className="rounded-xl border border-[#eadfce] bg-[#fff7e8]/60 px-3 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8c6c3c]">
                      Special Requests
                    </p>
                    <p className="mt-1 text-sm leading-5 text-[#5a4330]">
                      {customerDetails.specialRequests}
                    </p>
                  </div>
                )}

                {/* <button
                  onClick={goBackToDetails}
                  className="w-full rounded-xl border border-[#cbb28d] bg-white px-4 py-2.5 text-sm font-semibold text-[#8b6631] transition hover:bg-[#fff8ef]"
                >
                  Edit Account Details
                </button> */}
              </div>
            </aside>

            {/* RIGHT PAYMENT */}
            <section className="rounded-[1.2rem] border border-[#eadfce] bg-white/45 p-4 shadow-sm backdrop-blur-md sm:p-5">
              {isConfirmed ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check size={32} className="text-emerald-600" />
                  </div>

                  <h2 className="font-serif text-3xl text-[#2b2018]">
                    Booking Confirmed!
                  </h2>

                  <p className="mt-2 text-sm font-medium text-[#7a6c60]">
                    Your reservation is secure.
                  </p>

                  <p className="mt-1 text-xs text-[#9a8b7d]">
                    Redirecting to your confirmation page...
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-[2.2rem] leading-none text-[#2b2018]">
                    Payment Details
                  </h2>

                  <p className="mt-2 text-sm text-[#7a6c60]">
                    Review and pay your reservation charges securely.
                  </p>

                  <div className="my-5 rounded-[1.2rem] border border-[#eadfce] bg-[#fffaf1]/75 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm text-[#5f5146]">
                      <span>Reservation deposit</span>
                      <span className="font-semibold">
                        {formatCurrency(baseDepositAmount)}
                      </span>
                    </div>

                    {hasPreOrder && (
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#5f5146]">
                        <span>
                          Pre-order menu ({cartItemCount} item{cartItemCount === 1 ? '' : 's'})
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(cartSubtotal)}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-[#eadfce] pt-4 text-[#2b2018]">
                      <span className="text-xs font-bold uppercase tracking-[0.14em]">
                        Pay Now
                      </span>
                      <span className="font-serif text-2xl font-semibold">
                        {formatCurrency(totalChargeNow)}
                      </span>
                    </div>
                  </div>

                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      onSuccess={handlePaymentSuccess}
                      amount={totalChargeNow}
                      onBack={goBackToDetails}
                    />
                  </Elements>

                  {saveError && (
                    <p className="mt-4 text-center text-sm font-semibold text-red-600">
                      {saveError}
                    </p>
                  )}
                </>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
};