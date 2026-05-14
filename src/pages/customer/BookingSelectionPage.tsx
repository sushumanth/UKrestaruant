
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  Search,
  Sparkles,
} from 'lucide-react';

import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { useBookingStore, useMenuCartStore, useTableStore } from '@/store';
import type { RestaurantTable } from '@/types';
import { formatCurrency } from '@/mockData';
import { getAvailableTables } from '@/backendBookingApi';

const baseSlotTimes = [
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00', '20:30',
  '21:00', '21:30',
];
const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const openingTimes = [
  { day: 'Monday',    time: '11:30am - 9:30pm'  },
  { day: 'Tuesday',   time: '11:30am - 9:30pm'  },
  { day: 'Wednesday', time: '11:30am - 9:30pm'  },
  { day: 'Thursday',  time: '11:30am - 9:30pm'  },
  { day: 'Friday',    time: '11:30am - 10:00pm' },
  { day: 'Saturday',  time: '11:30am - 10:00pm' },
  { day: 'Sunday',    time: '11:30am - 8:00pm'  },
];

const getUpcomingSlot = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const allSlots = [...LUNCH_SLOTS, ...DINNER_SLOTS];
  return (
    allSlots.find((t) => {
      const [sh, sm] = t.split(':').map(Number);
      if (sh > h) return true;
      if (sh === h && sm > m + 25) return true;
      return false;
    }) ?? allSlots[0]
  );
};

type Step = 0 | 1 | 2 | 3;
type Period = 'lunch' | 'dinner';
type MenuCartItem = ReturnType<typeof useMenuCartStore.getState>['items'][number];

// ─── Main Component ───────────────────────────────────────────────────────────

export const BookingSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    setSelectedGuests,
  } = useBookingStore();

  const { selectedTable, setSelectedTable } = useTableStore();

  const { items: cartItems } = useMenuCartStore();

  const params            = new URLSearchParams(location.search);
  const skipSelectionFlag = Boolean(params.get('skipSelection'));

  const [activeSection, setActiveSection] = useState<'guests' | 'date' | 'time' | null>('date');

  const [draftGuests, setDraftGuests] = useState(2);
  const [draftDate, setDraftDate] = useState(new Date());

  const [draftTimeFilter, setDraftTimeFilter] = useState('All Times');

  const [selectedSlotTime, setSelectedSlotTime] = useState('');

  const [isLoadingTables, setIsLoadingTables] = useState(false);

  const [availableTables, setAvailableTables] = useState<
    Array<{
      id: string;
      tableNumber: number;
      capacity: number;
      status: string;
    }>
  >([]);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const hasInitializedSelectionRef = useRef(false);

  const baseDepositAmount = 5;

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const totalChargeNow = baseDepositAmount + cartSubtotal;

  const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const timeFilterOptions = [
    'All Times',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
  ];

  useEffect(() => {
    hasInitializedSelectionRef.current = false;
  }, [location.search]);

  // ── Init store values ──
  useEffect(() => {
    if (hasInitializedSelectionRef.current) {
      return;
    }

    const params = new URLSearchParams(location.search);

    const skip = params.get('skipSelection');

    const now = new Date();

    const today = format(now, 'yyyy-MM-dd');

    const [hoursNow, minutesNow] = [
      now.getHours(),
      now.getMinutes(),
    ];

    const upcoming =
      baseSlotTimes.find((t) => {
        const [h, m] = t.split(':').map(Number);

        if (h > hoursNow) return true;

        if (h === hoursNow && m > minutesNow + 25) return true;

        return false;
      }) || baseSlotTimes[0];

    if (!skip) {
      setSelectedDate(today);

      setSelectedTime(upcoming);

      const cartCount = cartItems
        ? cartItems.reduce(
            (total, item) => total + (item.quantity ?? 0),
            0
          )
        : 0;

      setSelectedGuests(
        cartCount > 0
          ? Math.min(10, Math.max(1, cartCount))
          : 2
      );

      hasInitializedSelectionRef.current = true;

      return;
    }

    if (selectedDate && selectedTime) {
      hasInitializedSelectionRef.current = true;
      return;
    }

    setSelectedDate(today);

    setSelectedTime(upcoming);

    const cartCount = cartItems
      ? cartItems.reduce(
          (total, item) => total + (item.quantity ?? 0),
          0
        )
      : 0;

    setSelectedGuests(
      cartCount > 0
        ? Math.min(10, Math.max(1, cartCount))
        : 2
    );

    hasInitializedSelectionRef.current = true;
  }, [
    cartItems,
    location.search,
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedGuests,
    setSelectedTime,
  ]);

  const visibleSlots = useMemo(() => {
    const filteredTimes =
      draftTimeFilter === 'All Times'
        ? baseSlotTimes
        : baseSlotTimes.filter((time) =>
            time.startsWith(draftTimeFilter.slice(0, 2))
          );

    return filteredTimes.map((time, index) => {
      const seed =
        draftDate.getDate() + draftGuests + index * 2;

      const available = seed % 7 !== 0;

      return {
        time,
        available,
      };
    });
  }, [draftDate, draftGuests, draftTimeFilter]);

  const selectedBookingDate = useMemo(
    () => format(draftDate, 'yyyy-MM-dd'),
    [draftDate]
  );

  useEffect(() => {
    if (!draftTime) { setAvailableTables([]); return; }
    let active = true;
    const run = async () => {
      setIsLoadingTables(true);

      setFetchError(null);

      const result = await getAvailableTables(
        selectedBookingDate,
        selectedSlotTime,
        draftGuests
      );

      if (result.ok) {
        setAvailableTables(result.tables);
      } else {
        setAvailableTables([]);

        setFetchError(
          result.error || 'Unable to fetch available tables.'
        );
      }

      setIsLoadingTables(false);
    };
    const t = setTimeout(run, 300);
    return () => { active = false; clearTimeout(t); };
  }, [draftTime, guests, selectedBookingDate]);

    const debounceTimer = setTimeout(fetchTables, 300);

    return () => clearTimeout(debounceTimer);
  }, [
    selectedSlotTime,
    draftGuests,
    selectedBookingDate,
  ]);

  useEffect(() => {
    if (!selectedTable) return;

    const stillAvailable = availableTables.some(
      (table) => table.id === selectedTable.id
    );

    if (!stillAvailable) {
      setSelectedTable(null);
    }
  }, [
    availableTables,
    selectedTable,
    setSelectedTable,
  ]);

  const goStep = (n: Step) => setStep(n);

  const handleConfirm = () => {
    if (!draftTime || !guests) return;
    if (!selectedTable) {
      setTableRequiredError('Please select a table before proceeding.');
      return;
    }

    setSelectedSlotTime(time);
  };

  const applySearchFilters = () => {
    setSelectedSlotTime('');
    setActiveSection(null);
  };

  const continueWithSelectedSlot = () => {
    if (!selectedSlotTime) return;

    setSelectedDate(format(draftDate, 'yyyy-MM-dd'));

    setSelectedTime(selectedSlotTime);

    setSelectedGuests(draftGuests);

    navigate('/booking/details');
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0908] text-zinc-100 overflow-y-auto relative flex flex-col">

      {/* Background */}
      <div className="absolute inset-0 z-0 fixed">
        <img
          src="/bookfirstpage.png"
          className="w-full h-full object-cover opacity-20"
          alt=""
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0908] via-transparent to-[#0a0908]/50" />
      </div>

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 flex items-center py-6">

        <div className="grid lg:grid-cols-12 gap-8 items-start w-full">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="space-y-4">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Sparkles size={14} className="text-amber-500" />

                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-200">
                  Premium Dining
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-serif leading-[1.1]">
                Book Your <br />

                <span className="text-amber-500 italic">
                  Perfect Table
                </span>
              </h1>

              <p className="text-lg font-light opacity-80 leading-relaxed">
                Experience luxury dining with authentic flavors crafted with passion and elegance.
              </p>

              {/* Opening Hours */}
              <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/10">

                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-4">
                  Opening Hours
                </h3>

                <div className="space-y-2">
                  {[
                    { day: 'Monday', time: '11:30am – 9:30pm' },
                    { day: 'Tuesday', time: '11:30am – 9:30pm' },
                    { day: 'Wednesday', time: '11:30am – 9:30pm' },
                    { day: 'Thursday', time: '11:30am – 9:30pm' },
                    { day: 'Friday', time: '11:30am – 10:00pm' },
                    { day: 'Saturday', time: '11:30am – 10:00pm' },
                    { day: 'Sunday', time: '11:30am – 8:00pm' },
                  ].map((item) => (
                    <div
                      key={item.day}
                      className="flex justify-between text-sm text-zinc-400"
                    >
                      <span className="font-medium text-zinc-300">
                        {item.day}
                      </span>

                      <span className="font-mono text-amber-400">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deposit */}
              <div className="mt-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  <span className="font-semibold">Note:</span>{' '}
                  A small deposit of £5 secures your reservation.
                </p>
              </div>

              {/* CART SUMMARY */}
              {skipSelectionFlag && cartItems.length > 0 && (
                <div className="bg-zinc-900/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden mt-8">

                  <div className="bg-[#5c2e0a] p-6 text-center">
                    <h2 className="text-xl font-serif tracking-[0.3em] uppercase text-white italic">
                      Your Pre-Order
                    </h2>
                  </div>

                  <div className="p-5 space-y-4">

                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between">

                            <div>
                              <p className="font-semibold text-white">
                                {item.name}
                              </p>

                              <p className="text-xs text-amber-400">
                                {formatCurrency(item.price)} each
                              </p>
                            </div>

                            <div className="text-sm text-zinc-300">
                              x{item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-white/10 pt-4 space-y-2">

                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>

                        <span>
                          {formatCurrency(cartSubtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Deposit</span>

                        <span>
                          {formatCurrency(baseDepositAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>

                        <span className="text-amber-400">
                          {formatCurrency(totalChargeNow)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-6 flex justify-end"
          >
            <div className="w-full max-w-[520px] bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

              <div className="bg-[#5c2e0a] p-6 text-center">
                <h2 className="text-xl font-serif tracking-[0.3em] uppercase text-white italic">
                  Luxe Reserve
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">

                {/* TOP SUMMARY */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 border border-white/10 rounded-xl p-4 bg-white/5">

                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {draftGuests}
                  </div>

                  <div className="w-px h-4 bg-white/10" />

                  <div className="flex items-center gap-1">
                    <Calendar size={14} />

                    {draftDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </div>

                  <div className="w-px h-4 bg-white/10" />

                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {draftTimeFilter}
                  </div>
                </div>

                {/* GUESTS */}
                <SectionItem
                  title="Number of Guests"
                  active={activeSection === 'guests'}
                  onClick={() =>
                    setActiveSection(
                      activeSection === 'guests'
                        ? null
                        : 'guests'
                    )
                  }
                >
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {guestOptions.map((num) => (
                      <button
                        key={num}
                        onClick={() => setDraftGuests(num)}
                        className={`py-2 rounded-lg border text-xs transition-all ${
                          draftGuests === num
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'bg-white/5 border-white/10 text-zinc-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </SectionItem>

                {/* DATE */}
                <SectionItem
                  title="Select Date"
                  active={activeSection === 'date'}
                  onClick={() =>
                    setActiveSection(
                      activeSection === 'date'
                        ? null
                        : 'date'
                    )
                  }
                >
                  <div className="mt-3 bg-white/5 rounded-2xl p-4 border border-white/10">
                    <DateCalendar
                      mode="single"
                      selected={draftDate}
                      onSelect={(date) => {
                        if (date) setDraftDate(date);
                      }}
                      disabled={(date) =>
                        date < new Date()
                      }
                      className="text-white"
                    />
                  </div>
                </SectionItem>

                {/* TIME */}
                <SectionItem
                  title="Preferred Time"
                  active={activeSection === 'time'}
                  onClick={() =>
                    setActiveSection(
                      activeSection === 'time'
                        ? null
                        : 'time'
                    )
                  }
                >
                  <div className="grid grid-cols-3 gap-2 mt-3">

                    {timeFilterOptions.map((time) => (
                      <button
                        key={time}
                        onClick={() =>
                          handleTimeFilterSelect(time)
                        }
                        className={`py-2 rounded-lg border text-xs transition-all ${
                          selectedSlotTime === time ||
                          draftTimeFilter === time
                            ? 'bg-amber-600 border-amber-600 text-white shadow-lg'
                            : 'bg-white/5 border-white/10 text-zinc-400'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </SectionItem>

                {/* SEARCH BUTTON */}
                <button
                  onClick={applySearchFilters}
                  className="w-full py-4 mt-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold uppercase tracking-[0.2em] shadow-xl transition-all"
                >
                  Search Available Slots
                </button>

                {/* SLOT RESULTS */}
                {draftTimeFilter !== 'All Times' && (
                  <AnimatePresence>

                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-6 space-y-6 border-t border-white/10 mt-4"
                    >

                      {/* SLOTS */}
                      <div className="grid grid-cols-4 gap-3">

                        {visibleSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              slot.available &&
                              setSelectedSlotTime(slot.time)
                            }
                            disabled={!slot.available}
                            className={`py-3 px-2 rounded-xl font-medium text-sm transition-all ${
                              slot.available
                                ? selectedSlotTime === slot.time
                                  ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-800'
                                  : 'bg-white/5 border border-white/10 text-zinc-300 hover:border-amber-500'
                                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-40'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>

                      {/* TABLES */}
                      {selectedSlotTime && (
                        <div className="space-y-4">

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                                Available Tables
                              </p>

                              <p className="text-xs text-zinc-500 mt-1">
                                {formatDate(
                                  draftDate
                                    .toISOString()
                                    .split('T')[0]
                                )}{' '}
                                at {formatTime(selectedSlotTime)}
                              </p>
                            </div>

                            <span className="bg-amber-500/10 text-amber-600 text-[10px] px-2 py-1 rounded-full font-bold border border-amber-500/20">
                              {isLoadingTables
                                ? 'Loading...'
                                : `${availableTables.length} open`}
                            </span>
                          </div>

                          {isLoadingTables ? (
                            <div className="text-sm text-amber-400">
                              Checking available tables...
                            </div>
                          ) : fetchError ? (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                              {fetchError}
                            </div>
                          ) : availableTables.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">

                              {availableTables.map((table) => (
                                <button
                                  key={table.id}
                                  onClick={() =>
                                    setSelectedTable(table)
                                  }
                                  className={`p-4 rounded-2xl border transition-all text-left relative group ${
                                    selectedTable?.id === table.id
                                      ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                      : 'bg-white/5 border-white/10 hover:border-amber-500/30'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">

                                    <p
                                      className={`font-serif text-xl ${
                                        selectedTable?.id === table.id
                                          ? 'text-amber-500'
                                          : 'text-white'
                                      }`}
                                    >
                                      T{table.tableNumber}
                                    </p>

                                    {selectedTable?.id ===
                                      table.id && (
                                      <span className="bg-amber-700 text-[8px] text-white px-1.5 py-0.5 rounded-md font-bold uppercase">
                                        Selected
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[10px] text-zinc-500 mt-1">
                                    {table.capacity} guests
                                  </p>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
                              No tables available for this slot.
                            </div>
                          )}

                          <p className="text-[11px] text-amber-700/70 leading-relaxed italic">
                            Selecting a table is optional.
                            System can auto-assign the best
                            available table.
                          </p>

                          {/* CONTINUE */}
                          <button
                            onClick={
                              continueWithSelectedSlot
                            }
                            disabled={!selectedSlotTime}
                            className="w-full py-4 mt-4 rounded-xl bg-[#854d2b] text-white font-bold uppercase tracking-widest shadow-xl transition-all hover:bg-amber-700 disabled:opacity-40"
                          >
                            Continue with{' '}
                            {selectedSlotTime}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>

    <div className="p-3.5 rounded-2xl bg-amber-100/40 border border-amber-300/50">
      <p className="text-[11px] text-amber-900/85 leading-relaxed">
        <span className="font-semibold">Note:</span> A small deposit of £5 secures your reservation and helps us reduce no-shows. Fully refundable with 24 hours notice.
      </p>
    </div>
  </motion.div>
);

const RightColumn = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="lg:col-span-6 flex justify-end"
  >
    <div className="w-full max-w-[460px] bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-xl overflow-hidden sticky top-20">
      {children}
    </div>
  </motion.div>
);

const PanelHeader = ({ icon, subtitle }: { icon: string; subtitle: string }) => (
  <div className="bg-gradient-to-r from-amber-100/60 to-amber-50/60 p-4.5 text-center border-b border-amber-200/40 backdrop-blur-sm">
    <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-200/40 border border-amber-300/60 mb-2.5">
      <span className="text-lg">{icon}</span>
    </div>
    <h2 className="text-lg font-serif tracking-[0.25em] uppercase text-amber-900 italic">Singh's
Dining
By Rangrez</h2>
    <p className="text-[11px] text-amber-800/70 mt-1.5 uppercase tracking-[0.2em]">{subtitle}</p>
  </div>
);

const StepPanel = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.2 }}
    className="p-4 space-y-0"
  >
    {children}
  </motion.div>
);

const StepLabel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <p className={`text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500 mb-2.5 ${className}`}>
    {children}
  </p>
);

const StepCTA = ({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 disabled:bg-zinc-300 disabled:text-zinc-500 text-white text-[13px] font-semibold uppercase tracking-wide transition-all shadow-lg shadow-amber-700/20 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const DepositNote = () => (
  <div className="flex items-center gap-2.5 rounded-xl bg-amber-100/40 border border-amber-300/40 px-3 py-2 mb-3.5">
    <ShieldCheck size={14} className="text-amber-700 shrink-0" />
    <p className="text-[11px] text-amber-900/75 leading-snug">
      <strong className="text-amber-800 font-semibold">£5 deposit</strong> secures your table — fully refundable with 24 hrs notice.
    </p>
  </div>
);

// ─── Mini Calendar ────────────────────────────────────────────────────────────

const MiniCalendar = ({
  value,
  calDate,
  onChange,
  onPrev,
  onNext,
}: {
  value: Date;
  calDate: Date;
  onChange: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const year      = calDate.getFullYear();
  const month     = calDate.getMonth();
  const daysCount = getDaysInMonth(calDate);
  const firstDow  = getDay(startOfMonth(calDate)); // 0=Sun
  const startOffset = firstDow === 0 ? 6 : firstDow - 1; // Mo-first grid

  return (
    <div className="mb-3.5 bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 border border-white/80">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2.5">
        <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-amber-100/40 text-amber-700 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="font-serif italic text-amber-900 text-[13px] font-medium">
          {MONTHS[month]} {year}
        </span>
        <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-amber-100/40 text-amber-700 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-amber-800/70 uppercase py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysCount }, (_, i) => i + 1).map((d) => {
          const date    = new Date(year, month, d);
          const isPast  = date < today;
          const isToday = date.toDateString() === today.toDateString();
          const isSel   = value.toDateString() === date.toDateString();
          const hasAvail = !isPast && d % 3 !== 0; // demo: most days have availability

          return (
            <button
              key={d}
              disabled={isPast}
              onClick={() => onChange(date)}
              className={[
                'relative flex flex-col items-center justify-center rounded-lg h-7 text-[11px] transition-all',
                isPast
                  ? 'text-zinc-400 cursor-not-allowed'
                  : isSel
                  ? 'bg-amber-600 text-white font-semibold shadow-md'
                  : isToday
                  ? 'text-amber-800 font-bold bg-amber-100/50'
                  : 'text-zinc-800 hover:bg-amber-100/40 cursor-pointer',
              ].join(' ')}
            >
              {d}
              {hasAvail && !isSel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 opacity-80" />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 opacity-80" />
        Dates with availability shown
      </p>
    </div>
  );
};

const SectionItem = ({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <div className="border-b border-white/5 pb-3 last:border-0">

    <button
      onClick={onClick}
      className="w-full flex justify-between items-center group"
    >
      <span
        className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
          active
            ? 'text-amber-500'
            : 'text-zinc-500 group-hover:text-zinc-300'
        }`}
      >
        {title}
      </span>

      <ChevronDown
        size={14}
        className={`text-zinc-600 transition-transform ${
          active ? 'rotate-180 text-amber-500' : ''
        }`}
      />
    </button>

    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default BookingSelectionPage;
