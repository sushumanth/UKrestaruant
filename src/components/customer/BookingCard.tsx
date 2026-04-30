import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Flame,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useBookingStore } from '@/store';
import { useTableStore } from '@/store';
import { formatTime, generateTimeSlots } from '@/lib/mockData';
import { Skeleton } from '@/components/ui/skeleton';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getAvailableSlotsFromSupabase, getOccupiedTableIdsFromSupabase } from '@/lib/supabaseBookingApi';
import type { BookingCardProps } from '@/types';

const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const stepLabels = ['Date', 'Time', 'Guests', 'Table'];

const getNextOpenDate = () => new Date();

const scoreSlot = (slot: { time: string; availableTables: number }) => {
  const [hours, minutes] = slot.time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const primeDinnerMinutes = 20 * 60;
  const primeOffset = Math.abs(totalMinutes - primeDinnerMinutes);

  return slot.availableTables * 2 - primeOffset / 120;
};

const getBestSlot = (slots: { time: string; availableTables: number }[]) => {
  if (slots.length === 0) {
    return undefined;
  }

  return [...slots].sort((a, b) => scoreSlot(b) - scoreSlot(a))[0];
};

const getEstimatedWait = (availableTables: number) => {
  if (availableTables <= 3) {
    return 15;
  }

  if (availableTables <= 6) {
    return 8;
  }

  return 3;
};

const normalizeTimeKey = (value: string) => value.slice(0, 5);

export const BookingCard = ({ compact = false }: BookingCardProps) => {
  const navigate = useNavigate();
  const { bookings, setSelectedDate, setSelectedTime, setSelectedGuests, setAvailableSlots } = useBookingStore();
  const { tables, setSelectedTable } = useTableStore();
  
  const [date, setDate] = useState<Date>(() => getNextOpenDate());
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [step, setStep] = useState(1);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots(format(getNextOpenDate(), 'yyyy-MM-dd')));
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [recentBookings, setRecentBookings] = useState(15);
  const [occupiedTableIds, setOccupiedTableIds] = useState<string[]>([]);
  const [occupancyRefreshTick, setOccupancyRefreshTick] = useState(0);

  const scrollToTopAfterContinue = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availableHighlightDays = useMemo(() => {
    const highlights: Date[] = [];
    const start = new Date();

    for (let i = 0; i < 21; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);

      if (((day.getDate() + day.getMonth()) % 4) !== 0) {
        highlights.push(day);
      }
    }

    return highlights;
  }, []);

  const selectedSlot = useMemo(
    () => timeSlots.find((slot) => slot.time === time),
    [timeSlots, time]
  );

  const bestSlot = useMemo(() => getBestSlot(timeSlots), [timeSlots]);

  const tableSeatMap = useMemo(() => {
    const dateString = date ? format(date, 'yyyy-MM-dd') : '';
    const activeStatuses = ['pending', 'confirmed', 'arrived', 'seated'];
    const selectedTime = normalizeTimeKey(time);
    const occupiedSet = new Set(occupiedTableIds);

    return tables
      .slice()
      .sort((a, b) => a.tableNumber - b.tableNumber)
      .map((table) => {
        const hasActiveBooking = bookings.some(
          (booking) =>
            booking.tableId === table.id &&
            booking.date === dateString &&
            normalizeTimeKey(booking.time) === selectedTime &&
            activeStatuses.includes(booking.status)
        );

        const isTableOccupiedInSupabase = occupiedSet.has(table.id);

        const isBlocked = ['blocked', 'booked', 'reserved', 'seated'].includes(table.status);
        const canFitParty = table.capacity >= guests;
        const isUnavailable = isBlocked || isTableOccupiedInSupabase || hasActiveBooking || !canFitParty;

        return {
          ...table,
          isTableOccupiedInSupabase,
          hasActiveBooking,
          canFitParty,
          isUnavailable,
        };
      });
  }, [bookings, date, guests, occupiedTableIds, tables, time]);

  const availableTableCount = useMemo(
    () => tableSeatMap.filter((table) => !table.isUnavailable).length,
    [tableSeatMap]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRecentBookings((prev) => {
        const next = prev + (Math.random() > 0.6 ? 1 : 0);
        return next > 24 ? 12 : next;
      });
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!date || !time) {
      setOccupiedTableIds([]);
      return;
    }

    let isMounted = true;

    const loadOccupiedTables = async () => {
      if (!isSupabaseConfigured) {
        setOccupiedTableIds([]);
        return;
      }

      const dateString = format(date, 'yyyy-MM-dd');
      const occupiedResult = await getOccupiedTableIdsFromSupabase(dateString, time);

      if (!isMounted) {
        return;
      }

      if (!occupiedResult.ok) {
        console.warn('Failed to fetch occupied tables from Supabase:', occupiedResult.error);
        setOccupiedTableIds([]);
        return;
      }

      setOccupiedTableIds(occupiedResult.tableIds);
    };

    void loadOccupiedTables();

    return () => {
      isMounted = false;
    };
  }, [date, occupancyRefreshTick, time]);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    const channel = client
      .channel('booking-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecentBookings((prev) => Math.min(prev + 1, 40));
          }

          setOccupancyRefreshTick((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!date) {
      return;
    }

    let isMounted = true;
    setIsLoadingSlots(true);

    const loadSlots = async () => {
      const dateString = format(date, 'yyyy-MM-dd');
      let rawSlots = generateTimeSlots(dateString);

      if (isSupabaseConfigured) {
        const slotResult = await getAvailableSlotsFromSupabase(dateString, guests);

        if (slotResult.ok && slotResult.slots.length > 0) {
          rawSlots = slotResult.slots;
        } else if (!slotResult.ok) {
          console.warn('Failed to fetch available slots from Supabase:', slotResult.error);
        }
      }

      const now = new Date();

      const filteredSlots = rawSlots.filter((slot) => {
        if (!slot.available) {
          return false;
        }

        const [hours, minutes] = slot.time.split(':').map(Number);

        if (format(now, 'yyyy-MM-dd') !== dateString) {
          return true;
        }

        return hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes() + 25);
      });

      const slotsForSelection = filteredSlots.length > 0 ? filteredSlots : rawSlots;

      if (!isMounted) {
        return;
      }

      setTimeSlots(slotsForSelection);
      const recommended = getBestSlot(slotsForSelection);

      setTime((current) => {
        if (current && slotsForSelection.some((slot) => slot.time === current)) {
          return current;
        }

        return recommended?.time ?? '';
      });

      setIsLoadingSlots(false);
    };

    void loadSlots();

    return () => {
      isMounted = false;
    };
  }, [date, guests]);

  useEffect(() => {
    if (step !== 4) {
      return;
    }

    setIsLoadingTables(true);
    const timer = window.setTimeout(() => setIsLoadingTables(false), 650);

    return () => window.clearTimeout(timer);
  }, [step, date, time, guests]);

  useEffect(() => {
    if (step !== 1) {
      setIsDatePickerOpen(false);
    }
  }, [step]);

  useEffect(() => {
    if (step !== 4) {
      return;
    }

    const currentSelection = tableSeatMap.find((table) => table.id === selectedTableId);

    if (currentSelection && !currentSelection.isUnavailable) {
      return;
    }

    const firstAvailable = tableSeatMap.find((table) => !table.isUnavailable);
    setSelectedTableId(firstAvailable?.id ?? '');
  }, [selectedTableId, step, tableSeatMap]);

  useEffect(() => {
    if (!selectedTableId) {
      setSelectedTable(null);
      return;
    }

    const selected = tables.find((table) => table.id === selectedTableId) ?? null;
    setSelectedTable(selected);
  }, [selectedTableId, setSelectedTable, tables]);

  const handleCheckAvailability = () => {
    if (!date || !time) return;
    
    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      const dateStr = format(date, 'yyyy-MM-dd');
      setSelectedDate(dateStr);
      setSelectedTime(time);
      setSelectedGuests(guests);
      
      setAvailableSlots(timeSlots);
      
      setIsChecking(false);
      navigate('/booking');
    }, 800);
  };

  const canGoNext =
    (step === 1 && Boolean(date)) ||
    (step === 2 && Boolean(time)) ||
    (step === 3 && Boolean(guests)) ||
    step === 4;

  const urgencyTablesLeft = Math.max(1, Math.min(selectedSlot?.availableTables ?? 3, 3));
  const estimatedWait = getEstimatedWait(selectedSlot?.availableTables ?? 4);

  return (
    <div className={`glass-card warm-ambient p-5 sm:p-6 ${compact ? 'w-full' : 'w-full max-w-[560px]'}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-serif text-4xl text-[#F4F6FA] leading-none">Book a table</h3>
          <p className="text-[#A9B1BE] mt-1 text-sm">Step-by-step booking in under 10 seconds.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-emerald-300">
          <CheckCircle2 size={14} />
          Instant confirmation
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const active = stepNumber === step;
          const done = stepNumber < step;

          return (
            <div key={label} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  active || done ? 'bg-gradient-to-r from-[#D4AF37] to-[#EB652B]' : 'bg-[#2A2F3A]'
                }`}
              />
              <p className={`text-[11px] uppercase tracking-[0.12em] ${active || done ? 'text-[#F4F6FA]' : 'text-[#7F8795]'}`}>
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <CalendarDays size={16} />
              <span>Select Date</span>
            </div>
            <span className="text-[#A9B1BE]">Fastest table in {estimatedWait} min</span>
          </div>

          <button
            type="button"
            onClick={() => setIsDatePickerOpen((previous) => !previous)}
            className="w-full input-luxury flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2.5">
              <CalendarDays size={16} className="text-[#D4AF37]" />
              <span className="text-[#F4F6FA] font-medium">
                {date ? format(date, 'EEEE, dd MMM yyyy') : 'Select Date'}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-[#A9B1BE] transition-transform duration-200 ${isDatePickerOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDatePickerOpen && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="luxury-panel p-3.5">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (!selectedDate) {
                    return;
                  }

                  setDate(selectedDate);
                  setIsDatePickerOpen(false);
                }}
                weekStartsOn={1}
                modifiers={{ available: availableHighlightDays }}
                modifiersClassNames={{
                  available: 'rounded-xl ring-1 ring-[#D4AF37]/45 bg-[rgba(212,175,55,0.10)]',
                }}
                disabled={(candidate) => candidate < new Date(new Date().setHours(0, 0, 0, 0))}
                className="w-full bg-transparent"
              />
            </motion.div>
          )}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Clock3 size={16} />
              <span>Select Time</span>
            </div>
            {bestSlot && (
              <span className="inline-flex items-center gap-1 text-amber-200">
                <Sparkles size={14} /> Best slot: {formatTime(bestSlot.time)}
              </span>
            )}
          </div>

          {isLoadingSlots ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`slot-skeleton-${index}`} className="h-12 bg-[rgba(255,255,255,0.08)] skeleton-shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setTime(slot.time)}
                  className={`step-chip ${time === slot.time ? 'step-chip-active' : ''}`}
                >
                  <div className="font-medium">{formatTime(slot.time)}</div>
                  <div className="text-[11px] text-[#A9B1BE] mt-0.5">
                    {slot.availableTables} tables
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-[#D4AF37]">
            <Users size={16} />
            <span>Select Guests</span>
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {guestOptions.map((option) => (
              <button
                key={option}
                onClick={() => setGuests(option)}
                className={`step-chip px-0 py-3 text-center ${guests === option ? 'step-chip-active' : ''}`}
              >
                <div className="font-semibold text-base leading-none">{option}</div>
                <Users size={12} className="mx-auto mt-1 opacity-70" />
              </button>
            ))}
          </div>
          <p className="text-xs text-[#A9B1BE]">
            Seating optimized for your group size to minimize waiting time.
          </p>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/35 bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
              <Flame size={14} />
              Only {urgencyTablesLeft} tables left at {time ? formatTime(time) : 'this slot'}
            </p>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/35 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
              <Timer size={14} />
              Estimated wait: {estimatedWait} min
            </p>
          </div>

          {isLoadingTables ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`table-skeleton-${index}`} className="h-16 bg-[rgba(255,255,255,0.08)] skeleton-shimmer" />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <p className="text-[#A9B1BE]">
                  {availableTableCount} of {tableSeatMap.length} tables available for {guests} guests at {time || '--:--'}.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[#A9B1BE]">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/70" /> Available</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37]" /> Selected</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400/70" /> Unavailable</span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto pr-1">
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2.5">
                  {tableSeatMap.map((table) => {
                    const isSelected = selectedTableId === table.id;
                    const isDisabled = table.isUnavailable;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setSelectedTableId(table.id);
                          }
                        }}
                        className={`rounded-lg border px-2 py-2.5 text-center transition-all duration-200 ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.22)] text-[#F8E8B2]'
                            : isDisabled
                              ? 'cursor-not-allowed border-rose-500/30 bg-rose-500/10 text-rose-200/70'
                              : 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.05)] text-[#DDE3ED] hover:border-emerald-400/70 hover:bg-emerald-400/10'
                        }`}
                        title={`Table ${table.tableNumber} · capacity ${table.capacity}`}
                      >
                        <p className="text-xs font-semibold leading-none">T{table.tableNumber}</p>
                        <p className="mt-1 text-[10px] opacity-80">{table.capacity}p</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedTableId && (
                <p className="mt-3 text-xs text-[#D7DDEA]">
                  Selected: Table {tableSeatMap.find((table) => table.id === selectedTableId)?.tableNumber ?? '--'}
                </p>
              )}
            </>
          )}

          <p className="text-xs text-[#A9B1BE] text-center">
            People booked {recentBookings} tables in the last 2 hours.
          </p>
        </motion.div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Button
          onClick={() => setStep((previous) => Math.max(previous - 1, 1))}
          variant="ghost"
          className="flex-1 border border-[rgba(255,255,255,0.16)] text-[#A9B1BE] hover:text-[#F4F6FA]"
          disabled={step === 1 || isChecking}
        >
          Back
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => {
              setStep((previous) => Math.min(previous + 1, 4));
              scrollToTopAfterContinue();
            }}
            disabled={!canGoNext}
            className="flex-[1.4] btn-gold btn-gold-glow"
          >
            Continue <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleCheckAvailability}
            disabled={!date || !time || !selectedTableId || isChecking}
            className="flex-[1.4] btn-gold btn-gold-glow disabled:opacity-50"
          >
            {isChecking ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0B0C0F] border-t-transparent rounded-full animate-spin" />
                Locking table...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check size={16} />
                Book now
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
