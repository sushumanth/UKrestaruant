import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  Check,
  Shield,
  LockKeyhole,
  BadgeCheck,
  ChevronDown,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useBookingStore, useCustomerAuthStore, useMenuCartStore, useTableStore } from '@/store';
import { formatDate, formatTime, generateBookingId, findOptimalTable, formatCurrency } from '@/mockData';
import { saveBooking, getAvailableTables } from '@/backendBookingApi';
import { sendBookingConfirmationEmail } from '@/bookingEmailApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Mock Stripe key - in production, use environment variable
const stripePromise = loadStripe('pk_test_your_publishable_key');

const baseSlotTimes = [
  '11:00',  '11:30', 
  '12:00',  '12:30', 
  '13:00',  '13:30', 
  '14:00',  '14:30', 
  '18:00',  '18:30', 
  '19:00', '19:30', 
  '20:00',  '20:30', 
  '21:00',  '21:30',
];

const PaymentForm = ({ 
  onSuccess, 
  amount 
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

    // Simulate payment processing, then persist booking.
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
          <Label className="text-amber-950 text-base font-semibold block">Card Details</Label>
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

export const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer } = useCustomerAuthStore();
  const { 
    bookings,
    selectedDate, 
    selectedTime, 
    selectedGuests, 
    addBooking,
    setSelectedDate,
    setSelectedTime,
    setSelectedGuests,
  } = useBookingStore();
  const { tables, selectedTable, setSelectedTable, updateTableStatus } = useTableStore();
  const { items: cartItems, clearCart } = useMenuCartStore();

  const params = new URLSearchParams(location.search);
  const skipSelectionFlag = Boolean(params.get('skipSelection'));

  // Form state - MUST be before early return
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [saveError, setSaveError] = useState('');
  const hasInitializedSelectionRef = useRef(false);

  useEffect(() => {
    if (!customer) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: prev.phone || customer.phone,
    }));
  }, [customer]);

  useEffect(() => {
    hasInitializedSelectionRef.current = false;
  }, [location.search]);

  // Initialize selection once per query-state change to avoid resetting after user continues.
  useEffect(() => {
    if (hasInitializedSelectionRef.current) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const skip = params.get('skipSelection');

    // If NOT coming from cart redirect, clear selection once so user sees selection UI first.
    if (!skip) {
      setSelectedDate('');
      setSelectedTime('');
      setSelectedGuests(0);
      hasInitializedSelectionRef.current = true;
      return;
    }

    // If coming from cart with skipSelection=1 and already selected, keep existing selection.
    if (selectedDate && selectedTime) {
      hasInitializedSelectionRef.current = true;
      return;
    }

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    // Choose the first upcoming slot from baseSlotTimes, otherwise fallback to first slot.
    const [hoursNow, minutesNow] = [now.getHours(), now.getMinutes()];
    const upcoming = baseSlotTimes.find((t) => {
      const [h, m] = t.split(':').map(Number);
      if (h > hoursNow) return true;
      if (h === hoursNow && m > minutesNow + 25) return true;
      return false;
    }) || baseSlotTimes[0];

    setSelectedDate(today);
    setSelectedTime(upcoming);
    const cartCount = cartItems ? cartItems.reduce((total, item) => total + (item.quantity ?? 0), 0) : 0;
    setSelectedGuests(cartCount > 0 ? Math.min(10, Math.max(1, cartCount)) : 2);
    hasInitializedSelectionRef.current = true;
  }, [cartItems, location.search, selectedDate, selectedTime, setSelectedDate, setSelectedTime, setSelectedGuests]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Booking entry state
  const [activeSearchSection, setActiveSearchSection] = useState<'guests' | 'date' | 'time' | null>('guests');
  const [draftGuests, setDraftGuests] = useState(2);
  const [draftDate, setDraftDate] = useState(new Date());
  const [draftTimeFilter, setDraftTimeFilter] = useState('All Times');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [availableTables, setAvailableTables] = useState<Array<{ id: string; tableNumber: number; capacity: number; status: string }>>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const baseDepositAmount = 5;
  const cartSubtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const totalChargeNow = baseDepositAmount + cartSubtotal;
  const hasPreOrder = cartSubtotal > 0;

  // Time slot generation
  const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const timeFilterOptions = [
    'All Times',
    '11:00', '12:00', '13:00', '14:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  // Memoized slot computation - uses draft values for real-time updates
  const visibleSlots = useMemo(() => {
    const filteredTimes = draftTimeFilter === 'All Times'
      ? baseSlotTimes
      : baseSlotTimes.filter(time => time.startsWith(draftTimeFilter.slice(0, 2)));

    return filteredTimes.map((time, index) => {
      const seed = draftDate.getDate() + draftGuests + (index * 2);
      const available = seed % 7 !== 0;
      return { time, available };
    });
  }, [draftDate, draftGuests, draftTimeFilter]);

  const selectedBookingDate = useMemo(() => format(draftDate, 'yyyy-MM-dd'), [draftDate]);

  // Fetch available tables when date, time, or guest count changes
  useEffect(() => {
    if (!selectedSlotTime) {
      setAvailableTables([]);
      setFetchError(null);
      return;
    }

    const fetchTables = async () => {
      setIsLoadingTables(true);
      setFetchError(null);
      
      const result = await getAvailableTables(selectedBookingDate, selectedSlotTime, draftGuests);
      
      if (result.ok) {
        setAvailableTables(result.tables);
      } else {
        setAvailableTables([]);
        setFetchError(result.error || 'Unable to fetch available tables.');
      }
      
      setIsLoadingTables(false);
    };

    const debounceTimer = setTimeout(fetchTables, 300);
    return () => clearTimeout(debounceTimer);
  }, [selectedSlotTime, draftGuests, selectedBookingDate]);

  useEffect(() => {
    if (!selectedTable) {
      return;
    }

    const stillAvailable = availableTables.some((table) => table.id === selectedTable.id);

    if (!stillAvailable) {
      setSelectedTable(null);
    }
  }, [availableTables, selectedTable, setSelectedTable]);

  const handleTimeFilterSelect = (time: string) => {
    setDraftTimeFilter(time);

    if (time === 'All Times') {
      setSelectedSlotTime('');
      return;
    }

    setSelectedSlotTime(time);
  };

  const applySearchFilters = () => {
    // Collapse all sections and reset slot selection for a clean UX
    setSelectedSlotTime('');
    setActiveSearchSection(null);
  };

  const continueWithSelectedSlot = () => {
    if (!selectedSlotTime) return;
    setSelectedDate(format(draftDate, 'yyyy-MM-dd'));
    setSelectedTime(selectedSlotTime);
    setSelectedGuests(draftGuests);
  };

  // If no slot is selected yet, show premium booking entry
  if (!selectedDate || !selectedTime) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f1ed 0%, #faf8f6 100%)' }}>
        
        {/* Full-height decorative rose - left side (mirrored) */}
        <div className="absolute inset-0 opacity-35 pointer-events-none">
          <img
            src="/bookfirstpage.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 items-start">
            
            {/* LEFT PANEL - Light Premium Info (No Scroll) */}
            <div className="pr-4">
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-black/8 shadow-lg p-8 sm:p-10">
              <div className="mb-8">
                <p className="text-sm font-medium text-black/60 mb-2 tracking-widest uppercase">Premium Dining Experience</p>
                <h2 className="text-2xl sm:text-3xl font-serif text-black/90 leading-tight">
                  Book Your Perfect Table
                </h2>
              </div>

              <p className="text-black/70 leading-relaxed mb-8 text-base">
                Just a stone's throw from the iconic Birmingham Bull Ring is our vibrant restaurant. Experience authentic cuisine in an elegant setting designed for unforgettable moments.
              </p>

              <div className="border-t border-black/10 pt-6">
                <h3 className="text-lg font-serif text-black/90 mb-5">Opening Times</h3>
                <div className="space-y-3">
                  {[
                    { day: 'Monday', time: '11:30am – 9:30pm' },
                    { day: 'Tuesday', time: '11:30am – 9:30pm' },
                    { day: 'Wednesday', time: '11:30am – 9:30pm' },
                    { day: 'Thursday', time: '11:30am – 9:30pm' },
                    { day: 'Friday', time: '11:30am – 10:00pm' },
                    { day: 'Saturday', time: '11:30am – 10:00pm' },
                    { day: 'Sunday', time: '11:30am – 8:00pm' },
                  ].map((item) => (
                    <div key={item.day} className="flex justify-between items-center">
                      <span className="text-black/70 font-medium">{item.day}</span>
                      <span className="text-black/50 text-sm">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-amber-50/60 border border-amber-200/40">
                <p className="text-xs text-amber-900/70 leading-relaxed">
                  <span className="font-semibold">Note:</span> A small deposit of £5 secures your reservation and helps us reduce no-shows. Fully refundable with 24 hours notice.
                </p>
              </div>
            </div>
            </div>

            {/* RIGHT PANEL - Premium Dark Booking Card or Order Items when skipping selection */}
            {skipSelectionFlag && cartItems.length > 0 ? (
              <div className="rounded-2xl overflow-hidden shadow-2xl sticky top-6 h-fit pb-2">
                <div className="bg-gradient-to-b from-amber-900/95 to-amber-950 px-8 py-6 text-center border-b border-amber-800/40">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-700/40 border border-amber-600/50 mb-3">
                    <span className="text-xl font-serif text-amber-200">🧾</span>
                  </div>
                  <h3 className="text-white font-serif text-xl tracking-wide">YOUR PRE-ORDER</h3>
                  <p className="text-amber-200/70 text-xs mt-1 tracking-widest uppercase">Review and edit your order before checkout</p>
                </div>

                <div className="bg-white/95 px-6 py-4 border-b border-black/8">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-amber-900">{item.name}</p>
                              <p className="text-xs text-amber-700">{formatCurrency(item.price)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => useMenuCartStore.getState().updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                                className="rounded-full border border-[#dbc7a2] bg-[#fff7ea] p-1 text-[#7d531f]"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => useMenuCartStore.getState().updateItemQuantity(item.id, item.quantity + 1)}
                                className="rounded-full border border-[#dbc7a2] bg-[#fff7ea] p-1 text-[#7d531f]"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-6 bg-amber-50/60 border-t border-black/8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatCurrency(cartSubtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Deposit</span>
                      <span className="font-semibold">{formatCurrency(baseDepositAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span>Total Charge Now</span>
                      <span>{formatCurrency(totalChargeNow)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => {
                          // set sensible date/time and proceed to details/payment
                          const now = new Date();
                          const today = format(now, 'yyyy-MM-dd');
                          const [hoursNow, minutesNow] = [now.getHours(), now.getMinutes()];
                          const upcoming = baseSlotTimes.find((t) => {
                            const [h, m] = t.split(':').map(Number);
                            if (h > hoursNow) return true;
                            if (h === hoursNow && m > minutesNow + 25) return true;
                            return false;
                          }) || baseSlotTimes[0];

                          setSelectedDate(today);
                          setSelectedTime(upcoming);
                          const _cartCount = cartItems ? cartItems.reduce((t, i) => t + (i.quantity ?? 0), 0) : 0;
                          setSelectedGuests(_cartCount > 0 ? Math.min(10, Math.max(1, _cartCount)) : 2);
                        }}
                        className="w-full inline-flex items-center justify-center rounded-lg bg-amber-700 px-4 py-3 text-white font-semibold"
                      >
                        Proceed to Details
                      </button>
                      <button
                        onClick={() => {
                          // go back to cart for large edits
                          window.location.href = '/cart';
                        }}
                        className="w-full inline-flex items-center justify-center rounded-lg border border-amber-200 bg-white px-4 py-3 text-amber-700 font-semibold"
                      >
                        Edit Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-2xl sticky top-6 h-fit pb-2">
              {/* Header */}
              <div className="bg-gradient-to-b from-amber-900/95 to-amber-950 px-8 py-6 text-center border-b border-amber-800/40">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-700/40 border border-amber-600/50 mb-3">
                  <span className="text-xl font-serif text-amber-200">🍽️</span>
                </div>
                <h3 className="text-white font-serif text-xl tracking-wide">LUXE RESERVE</h3>
                <p className="text-amber-200/70 text-xs mt-1 tracking-widest uppercase">Select Your Dining Slot</p>
              </div>

              {/* Filter Bar - Real-time Updates */}
              <div className="bg-white/95 px-6 py-4 border-b border-black/8 flex flex-wrap items-center gap-3 sm:gap-4">
                <Search size={18} className="text-black/40" />
                <span className="text-black/60 text-sm font-medium flex items-center gap-1.5 transition-all">
                  <Users size={16} /> {draftGuests}
                </span>
                <span className="w-px h-4 bg-black/15" />
                <span className="text-black/60 text-sm font-medium flex items-center gap-1.5 transition-all">
                  <Calendar size={16} /> {draftDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
                <span className="w-px h-4 bg-black/15" />
                <span className="text-black/60 text-sm font-medium flex items-center gap-1.5 transition-all">
                  <Clock size={16} /> {draftTimeFilter}
                </span>
              </div>

              {/* Search Sections - Scrollable */}
              <div className="bg-amber-50/50 px-6 py-5 space-y-3">
                
                {/* Guests Section */}
                <div className="bg-white rounded-lg overflow-hidden border border-black/10 hover:border-black/20 transition-colors">
                  <button
                    onClick={() => setActiveSearchSection(activeSearchSection === 'guests' ? null : 'guests')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
                  >
                    <span className="font-medium text-black/80">Number of Guests</span>
                    <ChevronDown size={18} className={`text-black/40 transition-transform ${activeSearchSection === 'guests' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSearchSection === 'guests' && (
                    <div className="px-4 py-4 bg-gradient-to-br from-white to-amber-50/30 border-t border-black/8 grid grid-cols-5 gap-2">
                      {guestOptions.map(num => (
                        <button
                          key={num}
                          onClick={() => setDraftGuests(num)}
                          className={`py-2 rounded-lg font-medium text-sm transition-all ${
                            draftGuests === num
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-white border border-black/15 text-black/70 hover:border-amber-400'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Section */}
                <div className="bg-white rounded-lg overflow-hidden border border-black/10 hover:border-black/20 transition-colors">
                  <button
                    onClick={() => setActiveSearchSection(activeSearchSection === 'date' ? null : 'date')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
                  >
                    <span className="font-medium text-black/80">Select Date</span>
                    <ChevronDown size={18} className={`text-black/40 transition-transform ${activeSearchSection === 'date' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSearchSection === 'date' && (
                    <div className="px-4 py-4 bg-gradient-to-br from-white to-amber-50/30 border-t border-black/8 flex justify-center">
                      <DateCalendar
                        mode="single"
                        selected={draftDate}
                        onSelect={(date) => {
                          if (date) setDraftDate(date);
                        }}
                        disabled={(date) => date < new Date()}
                        className="scale-90 origin-top"
                      />
                    </div>
                  )}
                </div>

                {/* Time Section */}
                <div className="bg-white rounded-lg overflow-hidden border border-black/10 hover:border-black/20 transition-colors">
                  <button
                    onClick={() => setActiveSearchSection(activeSearchSection === 'time' ? null : 'time')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
                  >
                    <span className="font-medium text-black/80">Time Preference</span>
                    <ChevronDown size={18} className={`text-black/40 transition-transform ${activeSearchSection === 'time' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeSearchSection === 'time' && (
                    <div className="px-4 py-3 bg-gradient-to-br from-white to-amber-50/30 border-t border-black/8 grid grid-cols-3 gap-2">
                      {timeFilterOptions.map(time => (
                        <button
                          key={time}
                          onClick={() => handleTimeFilterSelect(time)}
                          className={`py-2 rounded-lg font-medium text-sm transition-all ${
                            selectedSlotTime === time || draftTimeFilter === time
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-white border border-black/15 text-black/70 hover:border-amber-400'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={applySearchFilters}
                  className="w-full mt-2 px-4 py-3 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium transition-all shadow-md hover:shadow-lg text-sm uppercase tracking-wide"
                >
                  Search Available Slots
                </button>
              </div>

              {/* Slots Grid - Only show after Time Preference is selected */}
              {draftTimeFilter !== 'All Times' && (
                <>
                  <div className="bg-white px-6 py-6 border-t border-black/8">
                    <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto">
                      {visibleSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => slot.available && setSelectedSlotTime(slot.time)}
                          disabled={!slot.available}
                          className={`py-3 px-2 rounded-lg font-medium text-sm transition-all ${
                            slot.available
                              ? selectedSlotTime === slot.time
                                ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-800'
                                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 cursor-pointer'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="bg-gradient-to-t from-black/5 to-transparent px-6 py-5 border-t border-black/8">
                    <button
                      onClick={continueWithSelectedSlot}
                      disabled={!selectedSlotTime}
                      className="w-full px-6 py-3.5 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white font-medium transition-all shadow-lg hover:shadow-xl uppercase tracking-wide text-sm disabled:cursor-not-allowed"
                    >
                      {selectedSlotTime ? `Continue with ${selectedSlotTime}` : 'Select a Time Slot'}
                    </button>
                  </div>

                  {selectedSlotTime && (
                    <div className="border-t border-black/8 bg-white px-6 py-5 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700/70">Available Tables</p>
                          <p className="text-sm text-amber-900/75">
                            {formatDate(draftDate.toISOString().split('T')[0])} at {formatTime(selectedSlotTime)}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          {isLoadingTables ? 'Loading...' : `${availableTables.length} open`}
                        </span>
                      </div>

                      {isLoadingTables ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-amber-700/70">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-r-amber-700" />
                            Checking available tables...
                          </div>
                        </div>
                      ) : fetchError ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {fetchError}
                        </div>
                      ) : availableTables.length > 0 ? (
                        <div className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                          {availableTables.map((table) => (
                            <button
                              key={table.id}
                              type="button"
                              onClick={() => setSelectedTable(table)}
                              className={`rounded-2xl border px-3 py-3 text-left transition-all ${selectedTable?.id === table.id
                                ? 'border-amber-700 bg-amber-100 shadow-md ring-2 ring-amber-200'
                                : 'border-amber-200 bg-amber-50/70 hover:border-amber-400 hover:bg-amber-50'
                                }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-serif text-lg text-amber-950">T{table.tableNumber}</p>
                                  <p className="text-xs text-amber-700/70">{table.capacity} guests</p>
                                </div>
                                {selectedTable?.id === table.id && (
                                  <span className="rounded-full bg-amber-700 px-2 py-1 text-[10px] font-semibold text-white">
                                    Selected
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                          <p className="font-medium mb-1">No tables available</p>
                          <p className="text-xs text-amber-700/70">Please choose another date or time slot.</p>
                        </div>
                      )}

                      <p className="text-xs text-amber-700/60">
                        Selecting a table is optional. If you skip it, the system will assign the best available table when you complete the booking.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handlePaymentSuccess = async (): Promise<{ ok: boolean; error?: string }> => {
    setSaveError('');

    // Use customer's explicit table selection when available; otherwise fallback to auto-allocation.
    const chosenTable = selectedTable && selectedTable.capacity >= selectedGuests && selectedTable.status !== 'blocked'
      ? selectedTable
      : findOptimalTable(
          selectedGuests,
          tables,
          [],
          selectedDate,
          selectedTime
        );

    // Create booking
    const newBooking = {
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
      status: 'confirmed' as const,
      specialRequests: formData.specialRequests,
      depositAmount: totalChargeNow,
      paymentStatus: 'paid' as const,
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

    // Navigate to confirmation page after brief delay
    setTimeout(() => {
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
    }, 1500);

    return { ok: true };
  };

  const isDetailsValid = Boolean(customer?.firstName && customer?.lastName && customer?.email && formData.phone);

  return (
    <div className="min-h-screen pt-20 pb-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      
      {/* Full-height decorative rose - left side (mirrored) */}
      <div className="absolute inset-y-0 -left-32 w-[450px] opacity-15 pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
        <img src="/bookpagerose.png" alt="" className="w-full h-full object-cover" />
      </div>
      
      {/* Full-height decorative rose - right side */}
      <div className="absolute inset-y-0 -right-32 w-[450px] opacity-15 pointer-events-none">
        <img src="/bookpagerose.png" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 items-start">
          
          {/* LEFT PANEL - Booking Summary (No Scroll) */}
          <div className="pr-4">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-b from-amber-50 to-yellow-50 border border-amber-200/50">
              {/* Header */}
              <div className="bg-white px-8 py-6 text-center border-b border-amber-100">
                <div className="text-4xl mb-2">🍽️</div>
                <h3 className="text-amber-900 font-serif text-sm tracking-widest uppercase font-semibold">LUXE RESERVE / YOUR RESERVATION</h3>
              </div>

              {/* Reservation Details */}
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

                {/* Edit Selection Button */}
                <button
                  onClick={() => {
                    setSelectedDate('');
                    setSelectedTime('');
                    setSelectedGuests(0);
                    setSelectedSlotTime('');
                    setSelectedTable(null);
                    setDraftGuests(2);
                    setDraftDate(new Date());
                    setDraftTimeFilter('All Times');
                    setActiveSearchSection('guests');
                    setStep(1);
                  }}
                  className="w-full mt-8 px-4 py-2.5 rounded-lg border border-amber-700 text-amber-700 hover:bg-amber-50 font-medium transition-all text-sm"
                >
                  Change Selection
                </button>
              </div>

              {/* Step Indicator */}
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
                  
                  <div className={`flex-1 h-0.5 ${step >= 3 ? 'bg-amber-700' : 'bg-amber-200'}`} />
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-700'}`}>
                      3
                    </div>
                    <p className={`text-xs mt-2 font-medium ${step >= 3 ? 'text-amber-900' : 'text-amber-700/60'}`}>Confirm</p>
                  </div>
                </div>
              </div>

              {/* Info Card */}
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

          {/* RIGHT PANEL - Form Steps */}
          <div className="rounded-3xl overflow-hidden border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,252,245,0.95),rgba(255,247,231,0.9))] shadow-[0_18px_40px_rgba(85,54,21,0.16)] h-fit sticky top-6">
            {/* Header */}
            <div className="px-8 py-6 text-center border-b border-amber-200/70 bg-[linear-gradient(130deg,rgba(44,26,15,0.95),rgba(73,45,22,0.96),rgba(27,23,30,0.95))]">
              <h3 className="text-[#FFF8EE] font-serif text-[1.7rem] leading-none tracking-[0.01em]">Complete Your Details</h3>
              <p className="text-amber-200/80 text-[11px] mt-2 tracking-[0.18em] uppercase">Secure Checkout</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-amber-300' : 'bg-white/30'}`} />
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-amber-300' : 'bg-white/30'}`} />
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 3 || isConfirmed ? 'bg-amber-300' : 'bg-white/30'}`} />
              </div>
            </div>

            {/* Step 1: Contact Details */}
            {step === 1 && (
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
                        onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      className="w-full h-24 resize-none rounded-xl bg-white border border-amber-200/80 px-3 py-2 text-sm text-amber-950 placeholder:text-amber-700/45 outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="e.g., dietary requirements, special occasion"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
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
                  }}
                  className="w-full text-center text-amber-700 hover:text-amber-900 transition-colors mt-3 text-sm font-semibold"
                >
                  Back to booking
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
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
                  <PaymentForm 
                    onSuccess={handlePaymentSuccess}
                    amount={totalChargeNow}
                  />
                </Elements>
                
                {saveError && (
                  <p className="mt-4 text-center text-sm text-red-600 font-semibold">{saveError}</p>
                )}
                
                <button
                  onClick={() => setStep(1)}
                  className="w-full text-center text-amber-700 hover:text-amber-900 transition-colors mt-4 font-semibold"
                >
                  Back to details
                </button>
              </div>
            )}

            {/* Step 3: Confirmation */}
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