import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate, formatTime } from '@/lib/mockData';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBookingStore, useMenuCartStore, useTableStore } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  PoundSterling,
  Users,
  Armchair,
} from 'lucide-react';

export const BookingCheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    selectedDate,
    selectedTime,
    selectedGuests,
    setSelectedDate,
    setSelectedTime,
    setSelectedGuests,
  } = useBookingStore();

  const { tables, selectedTable, setSelectedTable } = useTableStore();
  const { items: cartItems } = useMenuCartStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const dateFromUrl = searchParams.get('date') ?? '';
  const timeFromUrl = searchParams.get('time') ?? '';
  const guestsFromUrl = Number(searchParams.get('guests') ?? 0);
  const tableIdFromUrl = searchParams.get('tableId') ?? '';

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

  const isDetailsValid = Boolean(
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.phone
  );

  useEffect(() => {
    if (!dateFromUrl || !timeFromUrl || !guestsFromUrl) {
      navigate('/book', { replace: true });
      return;
    }

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const continueToPayment = () => {
    const customerDetails = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      specialRequests: formData.specialRequests,
    };

    sessionStorage.setItem('bookingCustomerDetails', JSON.stringify(customerDetails));

    navigate(
      `/book/payment?date=${dateFromUrl}&time=${timeFromUrl}&guests=${guestsFromUrl}&tableId=${tableIdFromUrl}`
    );
  };

  const goBackToBooking = () => {
    setSelectedDate('');
    setSelectedTime('');
    setSelectedGuests(0);
    setSelectedTable(null);
    navigate('/book');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#efe8dc] px-3 py-3 sm:px-4 lg:px-5">
      {/* Floral background */}
      <div className="absolute inset-0 opacity-45">
        <img
          src="/bookfirstpage.png"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <div className="relative z-10 mx-auto mt-20 max-w-6xl">
        <section className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#fffaf1]/90 shadow-[0_22px_55px_rgba(65,42,25,0.2)] backdrop-blur-xl">
          {/* Top header */}
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

            {/* Step indicator */}
            <div className="mx-auto mt-5 flex max-w-md items-start justify-center">
    <div className="flex flex-col items-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#b98b42] bg-[#b98b42] text-sm font-bold text-white shadow-[0_8px_18px_rgba(185,139,66,0.3)]">
        1
      </span>
      <span className="mt-1 text-xs font-semibold text-[#4b3e33]">
        Details
      </span>
    </div>

    <div className="mx-3 mt-4 h-px flex-1 bg-[#d9cbb8]" />

    <div className="flex flex-col items-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9cbb8] bg-white/70 text-sm font-bold text-[#9a8d80]">
        2
      </span>
      <span className="mt-1 text-xs font-semibold text-[#8a7c6d]">
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

          {/* Body */}
          <div className="grid gap-4 px-4 pb-5 sm:px-5 lg:grid-cols-[310px_1fr] lg:px-7">
            {/* Left reservation summary */}
            <aside className="rounded-[1.2rem] border border-[#eadfce] bg-white/50 p-4 shadow-sm backdrop-blur-md">
              <h2 className="font-serif text-2xl leading-none text-[#2b2018]">
                Your Reservation
              </h2>

              <div className="mt-4 border-t border-[#eadfce] pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7e8] text-[#a8752b]">
                      <Calendar size={17} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-[#3d3128]">
                        {selectedDate ? formatDate(selectedDate) : 'Not selected'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7e8] text-[#a8752b]">
                      <Clock size={17} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                        Time
                      </p>
                      <p className="text-sm font-semibold text-[#3d3128]">
                        {selectedTime ? formatTime(selectedTime) : 'Not selected'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7e8] text-[#a8752b]">
                      <Users size={17} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                        Party Size
                      </p>
                      <p className="text-sm font-semibold text-[#3d3128]">
                        {selectedGuests} {selectedGuests === 1 ? 'Guest' : 'Guests'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7e8] text-[#a8752b]">
                      <Armchair size={17} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                        Table
                      </p>
                      <p className="text-sm font-semibold text-[#3d3128]">
                        {selectedTable?.tableNumber
                          ? `T${selectedTable.tableNumber}`
                          : 'Best available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7e8] text-[#a8752b]">
                      <PoundSterling size={17} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a8d80]">
                        Reservation Deposit
                      </p>
                      <p className="text-sm font-semibold text-[#3d3128]">
                        {formatCurrency(baseDepositAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {hasPreOrder && (
                  <div className="mt-4 rounded-xl border border-[#eadfce] bg-white/60 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7a5b32]">
                        Pre-order Dishes ({cartItemCount})
                      </p>
                      <p className="text-sm font-bold text-[#3d3128]">
                        {formatCurrency(cartSubtotal)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#d7b56f]/50 bg-[#fff7e8]/80 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7a5b32]">
                    Total Charge Now
                  </p>
                  <p className="font-serif text-xl font-bold text-[#8a5d21]">
                    {formatCurrency(totalChargeNow)}
                  </p>
                </div>

                {/* <button
                  type="button"
                  onClick={goBackToBooking}
                  className="mt-4 w-full rounded-xl border border-[#b98b42] px-4 py-2.5 text-sm font-semibold text-[#7a5b32] transition hover:bg-[#fff7e8]"
                >
                  Change Selection
                </button> */}

                <div className="mt-5 text-center">
                  <div className="mx-auto text-5xl text-[#b98b42]/35">♨</div>
                  <p className="mx-auto mt-3 max-w-[220px] text-xs leading-5 text-[#806947]">
                    {formatCurrency(baseDepositAmount)} deposit secures your reservation.
                    Fully refundable with 24 hours notice.
                  </p>
                </div>
              </div>
            </aside>

            {/* Right details form */}
            <section className="rounded-[1.2rem] border border-[#eadfce] bg-white/50 p-5 shadow-sm backdrop-blur-md sm:p-6">
              <div className="mb-5">
                <h1 className="font-serif text-[clamp(2rem,3vw,2.8rem)] leading-none text-[#2b2018]">
                  Complete Your Details
                </h1>
                <p className="mt-2 text-sm text-[#776b5e]">
                  Add your contact information to confirm your reservation.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-semibold text-[#3d3128]"
                    >
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-12 rounded-2xl border-[#d9cbb8] bg-[#fffdf8] text-[#3d3128] placeholder:text-[#b1a597] focus-visible:ring-[#d7b56f]"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-semibold text-[#3d3128]"
                    >
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-12 rounded-2xl border-[#d9cbb8] bg-[#fffdf8] text-[#3d3128] placeholder:text-[#b1a597] focus-visible:ring-[#d7b56f]"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#3d3128]"
                  >
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 rounded-2xl border-[#d9cbb8] bg-[#fffdf8] text-[#3d3128] placeholder:text-[#b1a597] focus-visible:ring-[#d7b56f]"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[#3d3128]"
                  >
                    Phone *
                  </Label>

                  <div className="grid grid-cols-[110px_1fr] gap-3">
                    <div className="flex h-12 items-center justify-between rounded-2xl border border-[#d9cbb8] bg-[#fffdf8] px-4 text-sm font-semibold text-[#3d3128]">
                      +44
                      <span className="text-[#9a8d80]">⌄</span>
                    </div>

                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-12 rounded-2xl border-[#d9cbb8] bg-[#fffdf8] text-[#3d3128] placeholder:text-[#b1a597] focus-visible:ring-[#d7b56f]"
                      placeholder="7123 456789"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="specialRequests"
                    className="mb-2 block text-sm font-semibold text-[#3d3128]"
                  >
                    Special Requests
                  </Label>

                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    className="h-24 w-full resize-none rounded-2xl border border-[#d9cbb8] bg-[#fffdf8] px-4 py-3 text-sm text-[#3d3128] outline-none placeholder:text-[#b1a597] focus:ring-2 focus:ring-[#d7b56f]"
                    placeholder="e.g. dietary requirements, special occasion"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={continueToPayment}
                disabled={!isDetailsValid}
                className="mt-5 h-13 w-full rounded-2xl bg-[linear-gradient(135deg,#c39243,#a56f25)] text-base font-bold text-white shadow-[0_12px_28px_rgba(165,111,37,0.32)] transition hover:scale-[1.01] hover:bg-[linear-gradient(135deg,#d19d4d,#ad762b)] disabled:opacity-50"
              >
                Continue to Payment
                <ArrowRight size={20} className="ml-2" />
              </Button>

              <button
                type="button"
                onClick={goBackToBooking}
                className="mt-3 w-full text-center text-sm font-semibold text-[#7a5b32] transition hover:text-[#3d3128]"
              >
                Back to booking
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#8a7c6d]">
                <CheckCircle2 size={14} className="text-[#a8752b]" />
                Your details are used only to confirm this reservation.
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
};