import { useMemo, useState } from 'react';
import { Search, Calendar, Clock, Users, CheckCircle2, XCircle, UserCheck, Utensils, Sparkles } from 'lucide-react';
import { useBookingStore } from '@/store';
import { formatDate, formatTime, statusLabels } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Booking, BookingStatus } from '@/types';

const bookingStatusChipClass: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  confirmed: 'bg-sky-100 text-sky-800 border border-sky-200',
  arrived: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  seated: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  completed: 'bg-slate-100 text-slate-700 border border-slate-200',
  cancelled: 'bg-rose-100 text-rose-800 border border-rose-200',
  no_show: 'bg-rose-100 text-rose-800 border border-rose-200',
};

export const EmployeeBookings = () => {
  const { bookings, updateBookingStatus } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'upcoming' | 'past' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter bookings
  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerPhone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate =
      dateFilter === 'all' ||
      (dateFilter === 'today' && booking.date === today) ||
      (dateFilter === 'upcoming' && booking.date > today) ||
      (dateFilter === 'past' && booking.date < today);

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  }).sort((a, b) => {
    const first = new Date(`${a.date}T${a.time}`).getTime();
    const second = new Date(`${b.date}T${b.time}`).getTime();
    return second - first;
  }), [bookings, dateFilter, searchQuery, statusFilter, today]);

  const overview = useMemo(() => {
    return {
      total: filteredBookings.length,
      confirmed: filteredBookings.filter((booking) => booking.status === 'confirmed').length,
      arrived: filteredBookings.filter((booking) => booking.status === 'arrived').length,
      seated: filteredBookings.filter((booking) => booking.status === 'seated').length,
      noShow: filteredBookings.filter((booking) => booking.status === 'no_show').length,
    };
  }, [filteredBookings]);

  const handleStatusUpdate = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-white/95 via-amber-50/75 to-yellow-50/70 p-6 shadow-[0_10px_30px_rgba(93,62,22,0.08)]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.13em] text-amber-700">
            <Sparkles size={13} /> Front Desk
          </span>
          <h1 className="font-serif text-[clamp(34px,4.2vw,54px)] leading-[0.9] text-amber-950 mt-3 mb-1">All Bookings</h1>
          <p className="text-amber-900/70">View and manage reservations with clear service status tracking.</p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        <OverviewCard label="Results" value={overview.total} tone="amber" />
        <OverviewCard label="Confirmed" value={overview.confirmed} tone="sky" />
        <OverviewCard label="Arrived" value={overview.arrived} tone="emerald" />
        <OverviewCard label="Seated" value={overview.seated} tone="blue" />
        <OverviewCard label="No Show" value={overview.noShow} tone="rose" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/50" size={18} />
            <Input
              type="text"
              placeholder="Search by name or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-xl border border-amber-200 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
            />
          </div>
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as 'today' | 'upcoming' | 'past' | 'all')}
          className="rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 shadow-sm outline-none focus:ring-2 focus:ring-amber-300"
        >
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All Dates</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | BookingStatus)}
          className="rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 shadow-sm outline-none focus:ring-2 focus:ring-amber-300"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="arrived">Arrived</option>
          <option value="seated">Seated</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-amber-200/70 bg-white/80 p-12 text-center">
            <p className="text-amber-900/70">No bookings found for this filter.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Booking Row Component
interface BookingRowProps {
  booking: Booking;
  onStatusUpdate: (bookingId: string, status: BookingStatus) => void;
}

const BookingRow = ({ booking, onStatusUpdate }: BookingRowProps) => {
  const isPastDue = booking.status === 'confirmed' && new Date(`${booking.date}T${booking.time}`) < new Date();

  return (
    <div className={`rounded-2xl border p-5 shadow-[0_8px_22px_rgba(60,45,28,0.08)] transition-all duration-200 ${
      isPastDue
        ? 'border-amber-300 bg-amber-50/80'
        : 'border-amber-200/70 bg-white/85'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Date & Time */}
        <div className="lg:w-52">
          <div className="flex items-center gap-2 text-amber-900/65">
            <Calendar size={14} />
            <span className="text-sm">{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock size={14} className="text-amber-700" />
            <span className="text-amber-950 font-semibold text-xl leading-none">{formatTime(booking.time)}</span>
          </div>
          {isPastDue && (
            <p className="text-xs text-amber-800 font-medium mt-1">Overdue confirmation</p>
          )}
          <div className="mt-1">
            <span className="font-mono text-[11px] text-amber-800/80">{booking.bookingId}</span>
          </div>
        </div>

        {/* Guest Info */}
        <div className="flex-1">
          <p className="text-amber-950 text-[1.65rem] font-serif leading-none">{booking.customerName}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-amber-900/65 mt-1.5">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {booking.guests} guests
            </span>
            <span>•</span>
            <span>{booking.customerPhone}</span>
            <span>•</span>
            <span>{booking.tableNumber ? `Table T${booking.tableNumber}` : 'Table TBD'}</span>
          </div>
          {booking.specialRequests && (
            <p className="text-amber-700 text-sm mt-2">
              Note: {booking.specialRequests}
            </p>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-4 flex-wrap justify-end">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bookingStatusChipClass[booking.status]}`}>
            {statusLabels.booking[booking.status]}
          </span>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {booking.status === 'confirmed' && (
              <>
                <Button
                  size="sm"
                  className="rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300"
                  onClick={() => onStatusUpdate(booking.id, 'arrived')}
                >
                  <UserCheck size={16} className="mr-1" /> Arrived
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300"
                  onClick={() => onStatusUpdate(booking.id, 'no_show')}
                >
                  <XCircle size={16} className="mr-1" /> No Show
                </Button>
              </>
            )}
            {booking.status === 'arrived' && (
              <Button
                size="sm"
                className="rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
                onClick={() => onStatusUpdate(booking.id, 'seated')}
              >
                <Utensils size={16} className="mr-1" /> Seat
              </Button>
            )}
            {booking.status === 'seated' && (
              <Button
                size="sm"
                className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                onClick={() => onStatusUpdate(booking.id, 'completed')}
              >
                <CheckCircle2 size={16} className="mr-1" /> Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface OverviewCardProps {
  label: string;
  value: number;
  tone: 'amber' | 'sky' | 'emerald' | 'blue' | 'rose';
}

const OverviewCard = ({ label, value, tone }: OverviewCardProps) => {
  const toneClass = {
    amber: 'border-amber-200/70 bg-amber-50/70 text-amber-900',
    sky: 'border-sky-200/70 bg-sky-50/70 text-sky-900',
    emerald: 'border-emerald-200/70 bg-emerald-50/70 text-emerald-900',
    blue: 'border-blue-200/70 bg-blue-50/70 text-blue-900',
    rose: 'border-rose-200/70 bg-rose-50/70 text-rose-900',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${toneClass[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.12em] opacity-75">{label}</p>
      <p className="font-serif text-[2rem] leading-none mt-1">{value}</p>
    </div>
  );
};
