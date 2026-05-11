import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Calendar, Clock3, CreditCard, Hash, MapPin, Users } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/mockData';
import { getCustomerBookings, getCustomerOrders } from '@/backendBookingApi';
import { useCustomerAuthStore } from '@/store';
import type { Booking } from '@/types';

const statusLabel: Record<Booking['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  arrived: 'Arrived',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

const statusClass: Record<Booking['status'], string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  arrived: 'bg-sky-100 text-sky-800 border-sky-200',
  seated: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-violet-100 text-violet-800 border-violet-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  no_show: 'bg-slate-200 text-slate-700 border-slate-300',
};

export const CustomerDashboardPage = () => {
  const { customer, isCustomerAuthenticated } = useCustomerAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!customer || !isCustomerAuthenticated) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        const bookingsResult = await getCustomerBookings(customer.email);
        const ordersResult = await getCustomerOrders(customer.email);

        if (!bookingsResult.ok) {
          setError(bookingsResult.error ?? 'Unable to load your bookings right now.');
          setBookings([]);
        } else {
          setBookings(bookingsResult.bookings);
        }

        if (ordersResult.ok) {
          void ordersResult.orders;
        }

        setIsLoading(false);
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        setBookings([]);
        setIsLoading(false);
      }
    })();
  }, [customer, isCustomerAuthenticated]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();

    return bookings.filter((booking) => {
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      return bookingDateTime >= now && booking.status !== 'cancelled' && booking.status !== 'no_show';
    });
  }, [bookings]);

  if (!isCustomerAuthenticated || !customer) {
    return <Navigate to="/customer/auth?redirect=/customer/dashboard" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'linear-gradient(135deg, #eee5d7 0%, #faf5eb 100%)' }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-amber-200/70 bg-white px-6 py-7 shadow-[0_18px_40px_rgba(90,58,22,0.14)] sm:px-8 sm:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700/80">Customer Dashboard</p>
          <h1 className="mt-2 font-serif text-[clamp(34px,4.6vw,52px)] leading-[0.92] text-amber-950">Welcome, {customer.firstName}</h1>
          <p className="mt-3 text-sm text-amber-900/75 sm:text-base">
            Manage your reservations and view your booking history.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-800/70">Upcoming Bookings</p>
              <p className="mt-2 text-3xl font-semibold text-amber-900">{upcomingBookings.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-800/70">Total Bookings</p>
              <p className="mt-2 text-3xl font-semibold text-amber-900">{bookings.length}</p>
            </div>
          </div>

          <div className="mt-7">
            <Link
              to="/booking"
              className="inline-flex rounded-full bg-amber-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-800"
            >
              Book a New Table
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading && <p className="text-sm text-amber-900/70">Loading your bookings...</p>}
          {error && <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}

          {!isLoading && !error && bookings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/65 px-6 py-8 text-center text-amber-900/80">
              You have no bookings yet. Reserve your first table now.
            </div>
          )}

          {!isLoading && !error &&
            bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-2xl border border-amber-200/80 bg-white px-5 py-5 shadow-[0_10px_26px_rgba(89,57,22,0.08)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 pb-3">
                  <div className="inline-flex items-center gap-2">
                    <Hash size={14} className="text-amber-700" />
                    <p className="font-mono text-sm font-semibold text-amber-900">{booking.bookingId}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass[booking.status]}`}>
                    {statusLabel[booking.status]}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-amber-900/80 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="inline-flex items-center gap-2">
                    <Calendar size={14} className="text-amber-700" />
                    {formatDate(booking.date)}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Clock3 size={14} className="text-amber-700" />
                    {formatTime(booking.time)}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Users size={14} className="text-amber-700" />
                    {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <MapPin size={14} className="text-amber-700" />
                    {booking.tableNumber ? `Table ${booking.tableNumber}` : 'Table pending'}
                  </div>
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  <CreditCard size={13} /> Paid {formatCurrency(booking.depositAmount)}
                </div>
              </article>
            ))}
        </div>
      </div>
    </div>
  );
};
