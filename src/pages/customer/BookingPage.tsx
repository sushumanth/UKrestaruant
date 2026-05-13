import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Clock,
  Search,
  Users,
  LockKeyhole,
} from 'lucide-react';
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useBookingStore, useTableStore } from '@/store';
import { formatDate, formatTime } from '@/lib/mockData';

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

const openingTimes = [
  { day: 'Monday', time: '11:30am – 9:30pm' },
  { day: 'Tuesday', time: '11:30am – 9:30pm' },
  { day: 'Wednesday', time: '11:30am – 9:30pm' },
  { day: 'Thursday', time: '11:30am – 9:30pm' },
  { day: 'Friday', time: '11:30am – 10:00pm' },
  { day: 'Saturday', time: '11:30am – 10:00pm' },
  { day: 'Sunday', time: '11:30am – 8:00pm' },
];

export const BookingPage = () => {
  const navigate = useNavigate();

  const {
    bookings,
    setSelectedDate,
    setSelectedTime,
    setSelectedGuests,
  } = useBookingStore();

  const { tables, selectedTable, setSelectedTable } = useTableStore();

  const [activeSearchSection, setActiveSearchSection] = useState<'guests' | 'date' | 'time' | null>(null);
  const [draftGuests, setDraftGuests] = useState(2);
  const [draftDate, setDraftDate] = useState(new Date());
  const [draftTimeFilter, setDraftTimeFilter] = useState('14:00');
  const [selectedSlotTime, setSelectedSlotTime] = useState('14:00');
  const [hasSearched, setHasSearched] = useState(false);

  const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const timeFilterOptions = [
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
  ];

  const selectedBookingDate = useMemo(() => {
    return format(draftDate, 'yyyy-MM-dd');
  }, [draftDate]);

  const visibleSlots = useMemo(() => {
    const filteredTimes = baseSlotTimes.filter((time) =>
      time.startsWith(draftTimeFilter.slice(0, 2))
    );

    return filteredTimes.map((time, index) => {
      const seed = draftDate.getDate() + draftGuests + index * 2;
      const available = seed % 7 !== 0;

      return {
        time,
        available,
      };
    });
  }, [draftDate, draftGuests, draftTimeFilter]);

  const availableTables = useMemo(() => {
    if (!selectedSlotTime) {
      return [];
    }

    const occupiedStatuses = ['pending', 'confirmed', 'arrived', 'seated'];
    const selectedTime = selectedSlotTime.slice(0, 5);

    return tables
      .slice()
      .sort((left, right) => left.tableNumber - right.tableNumber)
      .filter((table) => {
        const isTooSmall = table.capacity < draftGuests;

        const isBookedForSlot = bookings.some(
          (booking) =>
            booking.date === selectedBookingDate &&
            booking.time.slice(0, 5) === selectedTime &&
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
    setSelectedSlotTime(time);
    setActiveSearchSection(null);
    setHasSearched(false);
    setSelectedTable(null);
  };

  const applySearchFilters = () => {
    const firstAvailableSlot = visibleSlots.find((slot) => slot.available);

    if (!selectedSlotTime && firstAvailableSlot) {
      setSelectedSlotTime(firstAvailableSlot.time);
    }

    setHasSearched(true);
    setActiveSearchSection(null);
  };

  const continueWithSelectedSlot = () => {
    if (!selectedSlotTime) {
      return;
    }

    const dateString = format(draftDate, 'yyyy-MM-dd');
    const tableQuery = selectedTable?.id ? `&tableId=${selectedTable.id}` : '';

    setSelectedDate(dateString);
    setSelectedTime(selectedSlotTime);
    setSelectedGuests(draftGuests);

    navigate(
      `/book/checkout?date=${dateString}&time=${selectedSlotTime}&guests=${draftGuests}${tableQuery}`
    );
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

      <div className="mt-20 relative z-10 mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#fffaf1]/90 shadow-[0_22px_55px_rgba(65,42,25,0.2)] backdrop-blur-xl">
          {/* Top hero area */}
          <div className="px-3 pb-3 pt-4 text-center sm:px-5 lg:px-6">
            <div className='flex flex-row items-center justify-center gap-4'>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-amber-700/40 border border-amber-600/50">
                  <span className="text-xl font-serif text-amber-200">🍽️</span>
                </div>
            <p className="font-serif text-[clamp(1.15rem,2.2vw,1.7rem)] tracking-[0.26em] text-[#1f1813]">
              LUXE RESERVE
            </p>
            </div>

            <div className="mt-1 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-[#b98b42]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#b98b42]">
                Premium Dining Experience
              </p>
              <span className="h-px w-10 bg-[#b98b42]" />
            </div>

            <h1 className="mt-3 font-serif text-[clamp(1.9rem,3vw,3rem)] leading-none text-[#2b2018]">
              Book Your Perfect Table
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-[#776b5e] sm:text-sm">
              Just a stone&apos;s throw from the iconic Birmingham Bull Ring is our vibrant restaurant.
              Experience authentic cuisine in an elegant setting designed for unforgettable moments.
            </p>

            {/* Small selected summary */}
            {/* <div className="mx-auto mt-4 grid max-w-lg grid-cols-3 overflow-hidden rounded-xl border border-[#d9cbb8] bg-white/45 text-[#4b3e33] shadow-sm">
              <div className="flex items-center justify-center gap-2 border-r border-[#d9cbb8] px-2 py-2.5 text-xs sm:text-sm font-medium">
                <Users size={17} className="text-[#9a7338]" />
                {draftGuests} Guests
              </div>

              <div className="flex items-center justify-center gap-2 border-r border-[#d9cbb8] px-2 py-2.5 text-sm font-medium">
                <Calendar size={17} className="text-[#9a7338]" />
                {draftDate.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>

              <div className="flex items-center justify-center gap-2 px-2 py-2.5 text-sm font-medium">
                <Clock size={17} className="text-[#9a7338]" />
                {selectedSlotTime || draftTimeFilter}
              </div>
            </div> */}
          </div>

          {/* Search controls */}
          <div className="border-y border-[#eadfce] bg-white/35 px-4 py-3 sm:px-5 lg:px-7">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
              {/* Guests */}
              <div className="relative">
                <p className="mb-1.5 text-xs font-semibold text-[#3d3128]">
                  Number of Guests
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSearchSection(activeSearchSection === 'guests' ? null : 'guests')
                  }
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-[#d9cbb8] bg-[#fffdf8] px-5 text-left shadow-sm transition hover:border-[#b98b42]"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-[#4b3e33]">
                    <Users size={18} className="text-[#9a7338]" />
                    {draftGuests} Guests
                  </span>
                  <ChevronDown size={18} className="text-[#8a7c6d]" />
                </button>

                {activeSearchSection === 'guests' && (
                  <div className="absolute z-30 mt-2 grid w-full grid-cols-5 gap-2 rounded-2xl border border-[#e1d2bf] bg-white p-3 shadow-xl">
                    {guestOptions.map((guest) => (
                      <button
                        key={guest}
                        type="button"
                        onClick={() => {
                          setDraftGuests(guest);
                          setActiveSearchSection(null);
                          setSelectedTable(null);
                          setHasSearched(false);
                        }}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          draftGuests === guest
                            ? 'bg-[#b98b42] text-white'
                            : 'bg-[#f8f1e8] text-[#4b3e33] hover:bg-[#efdfc9]'
                        }`}
                      >
                        {guest}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="relative">
                <p className="mb-1.5 text-xs font-semibold text-[#3d3128]">
                  Select Date
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSearchSection(activeSearchSection === 'date' ? null : 'date')
                  }
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-[#d9cbb8] bg-[#fffdf8] px-5 text-left shadow-sm transition hover:border-[#b98b42]"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-[#4b3e33]">
                    <Calendar size={18} className="text-[#9a7338]" />
                    {draftDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <ChevronDown size={18} className="text-[#8a7c6d]" />
                </button>

                {activeSearchSection === 'date' && (
                  <div className="absolute z-30 mt-2 rounded-2xl border border-[#e1d2bf] bg-white p-3 shadow-xl">
                    <DateCalendar
                      mode="single"
                      selected={draftDate}
                      onSelect={(date) => {
                        if (!date) return;
                        setDraftDate(date);
                        setActiveSearchSection(null);
                        setSelectedTable(null);
                        setHasSearched(false);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-xl bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="relative">
                <p className="mb-1.5 text-xs font-semibold text-[#3d3128]">
                  Time Preference
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveSearchSection(activeSearchSection === 'time' ? null : 'time')
                  }
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-[#d9cbb8] bg-[#fffdf8] px-5 text-left shadow-sm transition hover:border-[#b98b42]"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-[#4b3e33]">
                    <Clock size={18} className="text-[#9a7338]" />
                    {draftTimeFilter}
                  </span>
                  <ChevronDown size={18} className="text-[#8a7c6d]" />
                </button>

                {activeSearchSection === 'time' && (
                  <div className="absolute z-30 mt-2 grid w-full grid-cols-3 gap-2 rounded-2xl border border-[#e1d2bf] bg-white p-3 shadow-xl">
                    {timeFilterOptions.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeFilterSelect(time)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          draftTimeFilter === time
                            ? 'bg-[#b98b42] text-white'
                            : 'bg-[#f8f1e8] text-[#4b3e33] hover:bg-[#efdfc9]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={applySearchFilters}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#c39243,#a56f25)] px-8 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_rgba(165,111,37,0.32)] transition hover:scale-[1.01] hover:shadow-[0_16px_34px_rgba(165,111,37,0.4)]"
              >
                <Search size={17} />
                Search Available Slots
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Bottom content */}
          <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[240px_1fr] lg:px-7 lg:py-5">
            {/* Opening times card */}
            <aside className="rounded-[1.2rem] border border-[#eadfce] bg-white/45 p-4 shadow-sm backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d5b77a] bg-[#fff7e8] text-[#a8752b]">
                  <Clock size={18} />
                </span>
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#a8752b]">
                  Opening Times
                </h2>
              </div>

              <div className="space-y-2">
                {openingTimes.map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center justify-between border-b border-[#eadfce]/70 pb-1.5 last:border-b-0"
                  >
                    <span className="text-sm font-medium text-[#5e5146]">
                      {item.day}
                    </span>
                    <span className="text-sm text-[#7e7165]">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 rounded-xl bg-[#fff7e8]/70 p-3 text-[11px] leading-5 text-[#806947]">
                <span className="font-bold">Note:</span> A small deposit of £5 secures your reservation
                and helps us reduce no-shows. Fully refundable with 24 hours notice.
              </p>
            </aside>

            {/* Tables area */}
            <section className="rounded-[1.2rem] border border-[#eadfce] bg-white/45 p-4 shadow-sm backdrop-blur-md sm:p-5">
              {/* Exact time slots */}
              {hasSearched && (
                <div className="mb-4 rounded-xl border border-[#eadfce] bg-[#fffaf1]/70 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#a8752b]">
                    Available Times
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {visibleSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => {
                          setSelectedSlotTime(slot.time);
                          setSelectedTable(null);
                        }}
                        className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition ${
                          slot.available
                            ? selectedSlotTime === slot.time
                              ? 'bg-[#6d2131] text-white shadow-md'
                              : 'bg-white text-[#5b4c3f] ring-1 ring-[#d9cbb8] hover:ring-[#b98b42]'
                            : 'cursor-not-allowed bg-[#ede5da] text-[#b1a597]'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-serif text-xl uppercase tracking-[0.12em] text-[#2b2018]">
                    Available Tables
                  </h2>

                  <p className="mt-0.5 text-xs text-[#7a6c60]">
                    {formatDate(selectedBookingDate)} at{' '}
                    {selectedSlotTime ? formatTime(selectedSlotTime) : 'select a time'}
                  </p>
                </div>

                <span className="rounded-full bg-[#f2dfbf] px-4 py-2 text-sm font-bold text-[#7f5621]">
                  {availableTables.length} open
                </span>
              </div>

              {hasSearched && selectedSlotTime ? (
                <>
                  {availableTables.length > 0 ? (
                    <div className="grid max-h-[260px] gap-3 overflow-y-auto pr-2 sm:grid-cols-2 xl:grid-cols-3">
                      {availableTables.map((table) => {
                        const isSelected = selectedTable?.id === table.id;

                        return (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => setSelectedTable(table)}
                            className={`group relative min-h-[88px] rounded-xl border p-4 text-left transition ${
                              isSelected
                                ? 'border-[#b98b42] bg-[#fff4df] shadow-[0_14px_32px_rgba(185,139,66,0.22)] ring-2 ring-[#d7b56f]/40'
                                : 'border-[#e4d7c6] bg-[#fffdf8]/80 hover:border-[#b98b42] hover:bg-[#fffaf1]'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute right-4 top-4 rounded-full bg-[#fff8e7] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a8752b]">
                                Selected
                              </span>
                            )}

                            <div className="flex h-full items-center justify-between gap-4">
                              <div>
                                <p className="font-serif text-3xl leading-none text-[#2b2018]">
                                  T{table.tableNumber}
                                </p>

                                <p className="mt-2 text-xs font-medium text-[#74675a]">
                                  {table.capacity} guests
                                </p>
                              </div>

                              <div className="text-right opacity-45 transition group-hover:opacity-70">
                                <div className="text-3xl">♨</div>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#9a7338]">
                                  Dining
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#eadfce] bg-[#fff7e8] px-5 py-5 text-sm text-[#7a5b32]">
                      No tables are available for this date and time. Choose another slot.
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-[#eadfce] bg-[#fffaf1]/70 p-3 text-center">
                    <button
                      type="button"
                      onClick={continueWithSelectedSlot}
                      className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#c39243,#a56f25)] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_rgba(165,111,37,0.32)] transition hover:scale-[1.01]"
                    >
                      Continue with {selectedSlotTime}
                      <ArrowRight size={18} />
                    </button>

                    <p className="mt-2 flex items-center justify-center gap-2 text-xs leading-4 text-[#8a7c6d]">
                      <LockKeyhole size={13} />
                      Selecting a table is optional. If you skip it, the system will assign the best available table when you complete the booking.
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d7c7b3] bg-[#fffaf1]/60 px-5 py-12 text-center">
                  <p className="text-sm font-semibold text-[#6b5d51]">
                    Choose guests, date, and time, then search available slots.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
};