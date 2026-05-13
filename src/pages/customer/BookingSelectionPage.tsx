import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  ChevronDown,
  Search,
} from 'lucide-react';
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { useBookingStore, useMenuCartStore, useTableStore } from '@/store';
import { formatCurrency, formatDate, formatTime } from '@/mockData';

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

export const BookingSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookings, selectedDate, selectedTime, setSelectedDate, setSelectedTime, setSelectedGuests } = useBookingStore();
  const { tables, selectedTable, setSelectedTable } = useTableStore();
  const { items: cartItems } = useMenuCartStore();

  const params = new URLSearchParams(location.search);
  const skipSelectionFlag = Boolean(params.get('skipSelection'));

  const [activeSearchSection, setActiveSearchSection] = useState<'guests' | 'date' | 'time' | null>('guests');
  const [draftGuests, setDraftGuests] = useState(2);
  const [draftDate, setDraftDate] = useState(new Date());
  const [draftTimeFilter, setDraftTimeFilter] = useState('All Times');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const hasInitializedSelectionRef = useRef(false);

  const baseDepositAmount = 5;
  const cartSubtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const totalChargeNow = baseDepositAmount + cartSubtotal;

  const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const timeFilterOptions = [
    'All Times',
    '11:00', '12:00', '13:00', '14:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  useEffect(() => {
    hasInitializedSelectionRef.current = false;
  }, [location.search]);

  useEffect(() => {
    if (hasInitializedSelectionRef.current) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const skip = params.get('skipSelection');

    if (!skip) {
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
      const cartCount = cartItems ? cartItems.reduce((total, item) => total + (item.quantity ?? 0), 0) : 0;
      setSelectedGuests(cartCount > 0 ? Math.min(10, Math.max(1, cartCount)) : 2);
      hasInitializedSelectionRef.current = true;
      return;
    }

    if (selectedDate && selectedTime) {
      hasInitializedSelectionRef.current = true;
      return;
    }

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
    const cartCount = cartItems ? cartItems.reduce((total, item) => total + (item.quantity ?? 0), 0) : 0;
    setSelectedGuests(cartCount > 0 ? Math.min(10, Math.max(1, cartCount)) : 2);
    hasInitializedSelectionRef.current = true;
  }, [cartItems, location.search, selectedDate, selectedTime, setSelectedDate, setSelectedGuests, setSelectedTime]);

  const visibleSlots = useMemo(() => {
    const filteredTimes = draftTimeFilter === 'All Times'
      ? baseSlotTimes
      : baseSlotTimes.filter((time) => time.startsWith(draftTimeFilter.slice(0, 2)));

    return filteredTimes.map((time, index) => {
      const seed = draftDate.getDate() + draftGuests + (index * 2);
      const available = seed % 7 !== 0;
      return { time, available };
    });
  }, [draftDate, draftGuests, draftTimeFilter]);

  const selectedBookingDate = useMemo(() => format(draftDate, 'yyyy-MM-dd'), [draftDate]);

  const availableTables = useMemo(() => {
    if (!selectedSlotTime) {
      return [];
    }

    const occupiedStatuses = ['pending', 'confirmed', 'arrived', 'seated'];
    const selectedTimeValue = selectedSlotTime.slice(0, 5);

    return tables
      .slice()
      .sort((left, right) => left.tableNumber - right.tableNumber)
      .filter((table) => {
        const isTooSmall = table.capacity < draftGuests;
        const isBookedForSlot = bookings.some(
          (booking) =>
            booking.date === selectedBookingDate &&
            booking.time.slice(0, 5) === selectedTimeValue &&
            occupiedStatuses.includes(booking.status) &&
            (booking.tableId === table.id || booking.tableNumber === table.tableNumber)
        );

        return table.status !== 'blocked' && !isTooSmall && !isBookedForSlot;
      });
  }, [bookings, draftGuests, selectedBookingDate, selectedSlotTime, tables]);

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
    setSelectedSlotTime('');
    setActiveSearchSection(null);
  };

  const continueWithSelectedSlot = () => {
    if (!selectedSlotTime) return;
    setSelectedDate(format(draftDate, 'yyyy-MM-dd'));
    setSelectedTime(selectedSlotTime);
    setSelectedGuests(draftGuests);
    navigate('/booking/details');
  };

  if (skipSelectionFlag && cartItems.length > 0) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f1ed 0%, #faf8f6 100%)' }}>
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
                        const cartCount = cartItems ? cartItems.reduce((t, i) => t + (i.quantity ?? 0), 0) : 0;
                        setSelectedGuests(cartCount > 0 ? Math.min(10, Math.max(1, cartCount)) : 2);
                        navigate('/booking/details');
                      }}
                      className="w-full inline-flex items-center justify-center rounded-lg bg-amber-700 px-4 py-3 text-white font-semibold"
                    >
                      Proceed to Details
                    </button>
                    <button
                      onClick={() => {
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f1ed 0%, #faf8f6 100%)' }}>
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

          <div className="rounded-2xl overflow-hidden shadow-2xl sticky top-6 h-fit pb-2">
            <div className="bg-gradient-to-b from-amber-900/95 to-amber-950 px-8 py-6 text-center border-b border-amber-800/40">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-amber-700/40 border border-amber-600/50 mb-3">
                <span className="text-xl font-serif text-amber-200">🍽️</span>
              </div>
              <h3 className="text-white font-serif text-xl tracking-wide">LUXE RESERVE</h3>
              <p className="text-amber-200/70 text-xs mt-1 tracking-widest uppercase">Select Your Dining Slot</p>
            </div>

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

            <div className="bg-amber-50/50 px-6 py-5 space-y-3">
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
                    {guestOptions.map((num) => (
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
                    {timeFilterOptions.map((time) => (
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
                        {availableTables.length} open
                      </span>
                    </div>

                    {availableTables.length > 0 ? (
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
                        No tables are available for this date and time. Choose another slot.
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
        </div>
      </div>
    </div>
  );
};

export default BookingSelectionPage;
