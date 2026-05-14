import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, getDay, getDaysInMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  Armchair,
  ShieldCheck,
  Receipt,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  PartyPopper
} from 'lucide-react';
import { useBookingStore, useMenuCartStore, useTableStore } from '@/store';
import type { RestaurantTable } from '@/types';
import { formatCurrency } from '@/mockData';
import { getAvailableTables } from '@/backendBookingApi';

// ─── Constants ───────────────────────────────────────────────────────────────

const LUNCH_SLOTS = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
const DINNER_SLOTS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
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
  const navigate  = useNavigate();
  const location  = useLocation();

  const { setSelectedDate, setSelectedTime, setSelectedGuests } = useBookingStore();
  const { selectedTable, setSelectedTable } = useTableStore();
  const [tableRequiredError, setTableRequiredError] = useState('');
  const { items: cartItems } = useMenuCartStore();

  const params            = new URLSearchParams(location.search);
  const skipSelectionFlag = Boolean(params.get('skipSelection'));

  // ── Booking step state ──
  const [step, setStep]           = useState<Step>(0);
  const [guests, setGuests]       = useState<number | null>(null);
  const [draftDate, setDraftDate] = useState<Date>(new Date());
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const [period, setPeriod]       = useState<Period>('lunch');
  const [calDate, setCalDate]     = useState(new Date()); // for month navigation

  // ── Table fetching ──
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [availableTables, setAvailableTables] = useState<
    Array<{ id: string; tableNumber: number; capacity: number; status: string; location?: string }>
  >([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const hasInitializedRef = useRef(false);

  const baseDepositAmount = 5;
  const cartSubtotal      = useMemo(
    () => cartItems.reduce((t, i) => t + i.price * i.quantity, 0),
    [cartItems],
  );
  const totalChargeNow = baseDepositAmount + cartSubtotal;

  const selectedBookingDate = useMemo(() => format(draftDate, 'yyyy-MM-dd'), [draftDate]);

  // ── Init store values ──
  useEffect(() => {
    if (hasInitializedRef.current) return;
    const today   = format(new Date(), 'yyyy-MM-dd');
    const upcoming = getUpcomingSlot();
    setSelectedDate(today);
    setSelectedTime(upcoming);
    const cartCount = cartItems.reduce((t, i) => t + (i.quantity ?? 0), 0);
    setSelectedGuests(cartCount > 0 ? Math.min(10, Math.max(1, cartCount)) : 2);
    hasInitializedRef.current = true;
  }, [cartItems, setSelectedDate, setSelectedGuests, setSelectedTime]);

  // ── Fetch tables when time selected ──
  useEffect(() => {
    if (!draftTime) { setAvailableTables([]); return; }
    let active = true;
    const run = async () => {
      setIsLoadingTables(true);
      setFetchError(null);
      try {
        const result = await getAvailableTables(selectedBookingDate, draftTime, guests ?? 2);
        if (!active) return;
        if (result.ok) {
          setAvailableTables(result.tables);
        } else {
          setFetchError(result.error ?? 'Unable to load tables.');
        }
      } catch {
        if (active) setFetchError('Unable to load tables.');
      } finally {
        if (active) setIsLoadingTables(false);
      }
    };
    const t = setTimeout(run, 300);
    return () => { active = false; clearTimeout(t); };
  }, [draftTime, guests, selectedBookingDate]);

  // ── Deselect table if no longer available ──
  useEffect(() => {
    if (selectedTable && !availableTables.some((t) => t.id === selectedTable.id)) {
      setSelectedTable(null);
    }
  }, [availableTables, selectedTable, setSelectedTable]);

  const goStep = (n: Step) => setStep(n);

  const handleConfirm = () => {
    if (!draftTime || !guests) return;
    if (!selectedTable) {
      setTableRequiredError('Please select a table before proceeding.');
      return;
    }
    setSelectedDate(format(draftDate, 'yyyy-MM-dd'));
    setSelectedTime(draftTime);
    setSelectedGuests(guests);
    navigate('/booking/details');
  };

  const handleProceedToDetails = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedTime(getUpcomingSlot());
    const cartCount = cartItems.reduce((t, i) => t + (i.quantity ?? 0), 0);
    setSelectedGuests(cartCount > 0 ? Math.min(10, Math.max(1, cartCount)) : 2);
    navigate('/booking/details');
  };

  const currentSlots = period === 'lunch' ? LUNCH_SLOTS : DINNER_SLOTS;

  // Pseudo-unavailability seeded by date+guest combo for demo
  const unavailableSlots = useMemo(() => {
    const seed = draftDate.getDate() + (guests ?? 2);
    return currentSlots.filter((_, i) => (seed + i * 3) % 7 === 0);
  }, [draftDate, guests, currentSlots]);

  // ─── Cart helpers (skipSelection flow) ───────────────────────────────────
  const CartItemRow = ({ item }: { item: MenuCartItem }) => {
    const updateItemQuantity = useMenuCartStore((s) => s.updateItemQuantity);
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200/40 bg-white/50 p-2.5">
        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-amber-900 truncate">{item.name}</p>
              <p className="text-xs text-amber-800/70">{formatCurrency(item.price)} each</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => updateItemQuantity(item.id, Math.max(0, item.quantity - 1))}
                className="rounded-full border border-amber-400/50 bg-amber-100/40 px-2 py-0.5 text-amber-800 hover:bg-amber-100/70 transition-colors"
              >
                −
              </button>
              <span className="w-7 text-center text-sm text-zinc-800">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                className="rounded-full border border-amber-400/50 bg-amber-100/40 px-2 py-0.5 text-amber-800 hover:bg-amber-100/70 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── skipSelection + cart flow ─────────────────────────────────────────────
  if (skipSelectionFlag && cartItems.length > 0) {
    return (
      <PageShell>
        <LeftColumn variant="preorder" />
        <RightColumn>
          <PanelHeader icon="🧾" subtitle="Review your pre-order" />
          <div className="p-5 space-y-3">
            {cartItems.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
          <div className="px-5 py-4 bg-amber-50/30 border-t border-amber-200/40 space-y-3">
            <SummaryRow label="Subtotal" value={formatCurrency(cartSubtotal)} />
            <SummaryRow label="Deposit"  value={formatCurrency(baseDepositAmount)} />
            <SummaryRow label="Total charge now" value={formatCurrency(totalChargeNow)} bold />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={handleProceedToDetails} className="btn-primary">Proceed to Details</button>
              <button onClick={() => navigate('/cart')} className="btn-ghost">Edit Cart</button>
            </div>
          </div>
        </RightColumn>
      </PageShell>
    );
  }

  // ─── Main booking flow ─────────────────────────────────────────────────────
  const stepsDone: boolean[] = [
    guests !== null,
    draftDate > new Date(new Date().setHours(0,0,0,0) - 1),
    draftTime !== null,
    true, // table optional
  ];
  return (
    <PageShell>
      <LeftColumn variant="default" />

      <RightColumn>
        {/* ── Header ── */}
        <PanelHeader icon="🍽️" subtitle="Reserve your table" />

        {/* ── Step tabs ── */}
        <div className="flex border-b border-amber-200/30 bg-amber-50/40">
          {(['Guests', 'Date', 'Time', 'Table'] as const).map((label, i) => (
            <button
              key={label}
              onClick={() => i <= step || stepsDone[i - 1] ? goStep(i as Step) : undefined}
              className={[
                'flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors relative',
                step === i
                  ? 'text-amber-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber-600'
                  : i < step
                  ? 'text-emerald-700/80 cursor-pointer'
                  : 'text-zinc-500 cursor-default',
              ].join(' ')}
            >
              {i < step ? <Check size={10} className="inline mr-1 mb-0.5" /> : null}
              {label}
            </button>
          ))}
        </div>

        {/* ── Live summary bar ── */}
        <div className="grid grid-cols-4 divide-x divide-amber-200/30 bg-amber-50/30 border-b border-amber-200/25">
          {[
            { icon: <Users size={12} />,     val: guests ? `${guests}` : '—',                         label: 'guests'  },
            { icon: <Calendar size={12} />,  val: draftDate ? format(draftDate, 'dd MMM') : '—',      label: 'date'    },
            { icon: <Clock size={12} />,     val: draftTime ?? '—',                                   label: 'time'    },
            { icon: <Armchair size={12} />,  val: selectedTable ? `T${selectedTable.tableNumber}` : '—', label: 'table' },
          ].map(({ icon, val, label }) => (
            <div key={label} className="flex flex-col items-center py-2.5 gap-0.5">
              <span className="text-amber-700/60">{icon}</span>
              <span className="text-[11px] font-medium text-zinc-700">{val}</span>
            </div>
          ))}
        </div>

        {/* ── Step panels ── */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">

            {/* STEP 0 — GUESTS */}
            {step === 0 && (
              <StepPanel key="guests">
                <StepLabel>How many guests?</StepLabel>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setGuests(n)}
                      className={[
                        'flex flex-col items-center justify-center gap-1 rounded-xl border py-3 text-xs font-semibold transition-all',
                        guests === n
                          ? 'border-amber-600 bg-amber-200/50 text-amber-900'
                          : 'border-amber-200/40 bg-white/50 text-zinc-700 hover:border-amber-400/60 hover:bg-amber-50/60',
                      ].join(' ')}
                    >
                      <span className="text-[#f0c27a]">
  {n === 1 ? (
    <User size={18} strokeWidth={2.2} />
  ) : n <= 2 ? (
    <Users size={18} strokeWidth={2.2} />
  ) : n <= 4 ? (
    <Users size={20} strokeWidth={2.2} />
  ) : (
    <PartyPopper size={18} strokeWidth={2.2} />
  )}
</span>
                      {n}
                    </button>
                  ))}

                </div>
               
                <button className="w-full text-center py-2.5 rounded-xl border border-amber-200/40 bg-white/30 text-xs text-zinc-600 hover:text-zinc-800 transition-colors mb-4">
                  More than 10? <span className="text-amber-700 font-semibold">Contact us directly →</span>
                </button>
                <DepositNote />
                <StepCTA disabled={!guests} onClick={() => goStep(1)}>
                  Choose a date →
                </StepCTA>
              </StepPanel>
            )}

            {/* STEP 1 — DATE */}
            {step === 1 && (
              <StepPanel key="date">
                <StepLabel>Pick a date</StepLabel>
                <MiniCalendar
                  value={draftDate}
                  calDate={calDate}
                  onChange={(d) => { setDraftDate(d); }}
                  onPrev={() => setCalDate((c) => subMonths(c, 1))}
                  onNext={() => setCalDate((c) => addMonths(c, 1))}
                />
                <StepCTA disabled={false} onClick={() => goStep(2)}>
                  Choose a time →
                </StepCTA>
              </StepPanel>
            )}

            {/* STEP 2 — TIME */}
            {step === 2 && (
              <StepPanel key="time">
                <StepLabel>Select a time slot</StepLabel>
                {/* Period toggle */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {(['lunch', 'dinner'] as Period[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPeriod(p); setDraftTime(null); }}
                      className={[
                        'flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all',
                        period === p
                          ? 'border-amber-600/70 bg-amber-200/60 text-amber-900'
                          : 'border-amber-200/40 bg-white/50 text-zinc-700 hover:border-amber-300/60',
                      ].join(' ')}
                    >
                      {p === 'lunch' ? <Sun size={13} /> : <Moon size={13} />}
                      {p === 'lunch' ? 'Lunch' : 'Dinner'}
                    </button>
                  ))}
                </div>
                {/* Slots */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {currentSlots.map((t) => {
                    const isUnavail = unavailableSlots.includes(t);
                    const isSelected = draftTime === t;
                    return (
                      <button
                        key={t}
                        disabled={isUnavail}
                        onClick={() => setDraftTime(t)}
                        className={[
                          'py-2.5 rounded-xl border text-xs font-semibold transition-all',
                          isUnavail
                            ? 'border-zinc-300/40 bg-zinc-100/40 text-zinc-500 line-through cursor-not-allowed'
                            : isSelected
                            ? 'border-amber-600 bg-amber-200/60 text-amber-900 ring-1 ring-amber-400/40'
                            : 'border-amber-200/40 bg-white/50 text-zinc-700 hover:border-amber-400/60 hover:bg-amber-50/50',
                        ].join(' ')}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <StepCTA disabled={!draftTime} onClick={() => goStep(3)}>
                  {draftTime ? `Continue with ${draftTime} →` : 'Select a time slot'}
                </StepCTA>
              </StepPanel>
            )}

            {/* STEP 3 — TABLE */}
            {step === 3 && (
              <StepPanel key="table">
                <div className="flex items-baseline gap-2 mb-3">
                  <StepLabel className="mb-0">Your table</StepLabel>
                  <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Optional</span>
                </div>

                {isLoadingTables && (
                  <div className="flex items-center gap-2 py-4 text-xs text-amber-700/70">
                    <span className="w-3.5 h-3.5 rounded-full border border-amber-600 border-r-amber-200 animate-spin" />
                    Checking available tables…
                  </div>
                )}

                {fetchError && (
                  <div className="rounded-xl border border-red-400/40 bg-red-100/30 px-4 py-3 text-xs text-red-700 mb-3">
                    {fetchError}
                  </div>
                )}

                {!isLoadingTables && !fetchError && (
                  <>
                    {availableTables.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mb-3 max-h-48 overflow-y-auto pr-0.5">
                        {availableTables.map((table) => {
                          const isSelected = selectedTable?.id === table.id;
                          return (
                            <button
                              key={table.id}
                              onClick={() => {
                                setSelectedTable(isSelected ? null : (table as RestaurantTable));
                                setTableRequiredError('');
                              }}
                              className={[
                                'rounded-xl border p-3 text-left transition-all',
                                isSelected
                                  ? 'border-amber-600 bg-amber-200/50 ring-1 ring-amber-400/40'
                                  : 'border-amber-200/40 bg-white/50 hover:border-amber-400/60 hover:bg-amber-50/40',
                              ].join(' ')}
                            >
                              <p className="font-serif italic text-lg text-amber-900 leading-none">T{table.tableNumber}</p>
                              <p className="text-[10px] text-zinc-700 mt-1">{table.capacity} guests</p>
                              {table.location && (
                                <p className="text-[9px] text-amber-700/70 uppercase tracking-wide mt-1">{table.location}</p>
                              )}
                              {isSelected && (
                                <span className="mt-2 inline-flex items-center gap-0.5 text-[9px] bg-amber-700/80 text-white rounded-full px-1.5 py-0.5">
                                  <Check size={8} /> Selected
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-300/40 bg-amber-100/30 px-4 py-3 text-xs text-amber-900/80 mb-3">
                        <p className="font-medium mb-0.5">No tables available</p>
                        <p className="text-amber-800/60">Try another date or time slot.</p>
                      </div>
                    )}
                    <p className="text-[11px] text-zinc-700 leading-relaxed mb-4">
                      Skipping table selection? We'll assign the best available when you complete the booking.
                    </p>
                  </>
                )}

                {/* Final receipt note */}
                <div className="flex items-center gap-2.5 rounded-xl bg-amber-100/40 border border-amber-300/40 px-3.5 py-2.5 mb-4">
                  <Receipt size={14} className="text-amber-700 shrink-0" />
                  <p className="text-[11px] text-amber-900/75 leading-snug">
                    Charged today: <strong className="text-amber-800 font-semibold">£5 deposit</strong>. Balance settled at the restaurant.
                  </p>
                </div>

                {tableRequiredError && (
                  <div className="text-sm text-rose-600 mb-2">{tableRequiredError}</div>
                )}

                <StepCTA disabled={false} onClick={handleConfirm}>
                  Confirm reservation
                </StepCTA>
              </StepPanel>
            )}

          </AnimatePresence>
        </div>
      </RightColumn>
    </PageShell>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PageShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#faf8f3] via-[#f5f2ed] to-[#f0eae0] text-zinc-900 pt-20">
    <div className="absolute inset-0 z-0">
      <img src="/bookfirstpage.png" className="w-full h-full object-cover opacity-8" alt="" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#faf8f3]/40 via-transparent to-[#f5f2ed]/30" />
    </div>
    <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
      <div className="grid lg:grid-cols-12 gap-6 items-start">{children}</div>
    </main>
  </div>
);

const LeftColumn = ({ variant }: { variant: 'default' | 'preorder' }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className="lg:col-span-6 space-y-4"
  >
    

    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif leading-[1.02] text-zinc-900">
      Book Your <br />
      <span className="text-amber-700 italic">Perfect Table</span>
    </h1>
 <div className="p-3.5 rounded-2xl bg-amber-100/10 border border-amber-300/30">
   <p className="text-[11px] text-amber-900/85 leading-relaxed">
      {variant === 'preorder'
        ? 'Join us for an unforgettable culinary journey. Reserve your table now and experience authentic flavours crafted with passion.'
        : "Just a stone's throw from the iconic Birmingham Bull Ring is our vibrant restaurant. Experience authentic cuisine in an elegant setting designed for unforgettable moments."}
    </p>
    </div>

    <div className="rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 p-5 sm:p-6 shadow-lg">
      <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-amber-700 mb-3">Opening Hours</h3>
      <div className="space-y-1.5">
        {openingTimes.map((item) => (
          <div key={item.day} className="flex justify-between gap-4 text-[13px]">
            <span className="font-medium text-zinc-800">{item.day}</span>
            <span className="font-mono text-amber-700 text-right">{item.time}</span>
          </div>
        ))}
      </div>
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

// ─── Cart helpers (skipSelection flow) ───────────────────────────────────────
 
const SummaryRow = ({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <div className={`flex items-center justify-between ${bold ? 'text-[13px] font-semibold text-amber-900 pt-1' : 'text-[11px] text-zinc-700'}`}>
    <span>{label}</span>
    <span className={bold ? '' : 'font-semibold text-amber-900'}>{value}</span>
  </div>
);

export default BookingSelectionPage;