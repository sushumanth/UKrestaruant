import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  PoundSterling, 
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useBookingStore, useTableStore, useAnalyticsStore } from '@/store';
import { formatCurrency, formatDate, statusColors, statusLabels } from '@/restaurantUtils';
import { Button } from '@/components/ui/button';
import { fetchStaffOperationalData } from '@/frontendapis';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AdminDashboard = () => {
  const { bookings, setBookings } = useBookingStore();
  const { tables } = useTableStore();
  const { reports } = useAnalyticsStore();
  const [todayStats, setTodayStats] = useState({
    totalBookings: 0,
    totalGuests: 0,
    revenue: 0,
    noShows: 0,
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setTodayStats({
      totalBookings: bookings.length,
      totalGuests: bookings.reduce((sum, booking) => sum + booking.guests, 0),
      revenue: bookings
        .filter((booking) => booking.paymentStatus === 'paid')
        .reduce((sum, booking) => sum + booking.depositAmount, 0),
      noShows: bookings.filter((booking) => booking.status === 'no_show').length,
    });
  }, [bookings]);

  useEffect(() => {
    if (bookings.length > 0) {
      return;
    }

    let isMounted = true;

    void (async () => {
      try {
        const staffData = await fetchStaffOperationalData();

        if (isMounted) {
          setBookings(staffData.bookings);
        }
      } catch (error) {
        console.warn('Failed to load admin dashboard bookings:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [bookings.length, setBookings]);

  // Get upcoming bookings
  const upcomingBookings = bookings
    .filter(b => b.date >= today && ['confirmed', 'pending'].includes(b.status))
    .slice(0, 5);

  // Get occupied tables count
  const occupiedTables = tables.filter(t => ['booked', 'seated'].includes(t.status)).length;
  const occupancyRate = Math.round((occupiedTables / tables.length) * 100);

  // Chart data
  const chartData = reports.slice(-7).map(r => ({
    date: new Date(r.date).toLocaleDateString('en-GB', { weekday: 'short' }),
    bookings: r.totalBookings,
    guests: r.totalGuests,
    revenue: r.totalRevenue,
  }));

  return (
    <div className="space-y-8" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-amber-900 mb-2">Dashboard</h1>
        <p className="text-amber-700/70">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-amber-200/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Calendar size={22} className="text-amber-700" />
            </div>
            <span className="text-emerald-600 text-sm flex items-center gap-1 font-semibold">
              <TrendingUp size={14} />
              +12%
            </span>
          </div>
          <p className="text-amber-700/60 text-sm mb-1">Today's Bookings</p>
          <p className="font-serif text-3xl text-amber-900">{todayStats.totalBookings}</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Users size={22} className="text-amber-700" />
            </div>
            <span className="text-emerald-600 text-sm flex items-center gap-1 font-semibold">
              <TrendingUp size={14} />
              +8%
            </span>
          </div>
          <p className="text-amber-700/60 text-sm mb-1">Total Guests</p>
          <p className="font-serif text-3xl text-amber-900">{todayStats.totalGuests}</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <PoundSterling size={22} className="text-amber-700" />
            </div>
            <span className="text-emerald-600 text-sm flex items-center gap-1 font-semibold">
              <TrendingUp size={14} />
              +15%
            </span>
          </div>
          <p className="text-amber-700/60 text-sm mb-1">Deposit Revenue</p>
          <p className="font-serif text-3xl text-amber-900">{formatCurrency(todayStats.revenue)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertCircle size={22} className="text-rose-600" />
            </div>
            <span className="text-rose-600 text-sm flex items-center gap-1 font-semibold">
              <TrendingDown size={14} />
              -5%
            </span>
          </div>
          <p className="text-amber-700/60 text-sm mb-1">No Shows</p>
          <p className="font-serif text-3xl text-amber-900">{todayStats.noShows}</p>
        </div>
      </div>

      {/* Charts & Lists */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-amber-200/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl text-amber-900">Revenue Overview</h3>
            <select className="border border-amber-200 rounded-lg px-3 py-2 text-amber-900 bg-white text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2d1b5" />
                <XAxis dataKey="date" stroke="#a18863" fontSize={12} />
                <YAxis stroke="#a18863" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f5f1ed', 
                    border: '1px solid rgba(217, 119, 6, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#20b2aa" 
                  strokeWidth={3}
                  dot={{ fill: '#20b2aa', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-white rounded-2xl border border-amber-200/50 p-6 shadow-lg">
          <h3 className="font-serif text-xl text-amber-900 mb-6">Table Occupancy</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e2d1b5"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#d4a574"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${occupancyRate * 4.4} 440`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-4xl text-amber-700">{occupancyRate}%</span>
                <span className="text-amber-700/60 text-sm">Occupied</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-amber-700/60 text-sm">Available</span>
              <span className="text-amber-900 font-semibold">{tables.filter(t => t.status === 'available').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-700/60 text-sm">Booked</span>
              <span className="text-amber-900 font-semibold">{tables.filter(t => t.status === 'booked').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-700/60 text-sm">Seated</span>
              <span className="text-amber-900 font-semibold">{tables.filter(t => t.status === 'seated').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-2xl border border-amber-200/50 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-amber-900">Upcoming Bookings</h3>
          <Link to="/admin/bookings">
            <Button className="border border-amber-700 text-amber-700 hover:bg-amber-50 text-sm px-4 py-2 rounded-lg">View All</Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-200">
                <th className="text-left py-3 px-4 text-amber-700/70 text-sm font-medium">Booking ID</th>
                <th className="text-left py-3 px-4 text-amber-700/70 text-sm font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-amber-700/70 text-sm font-medium">Date & Time</th>
                <th className="text-left py-3 px-4 text-amber-700/70 text-sm font-medium">Guests</th>
                <th className="text-left py-3 px-4 text-amber-700/70 text-sm font-medium">Table</th>
                <th className="text-left py-3 px-4 text-amber-700/70 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-amber-100 hover:bg-amber-50/30">
                  <td className="py-4 px-4">
                    <span className="font-mono text-amber-700 font-semibold">{booking.bookingId}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-amber-900">{booking.customerName}</p>
                      <p className="text-amber-700/60 text-sm">{booking.customerPhone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-amber-700/60" />
                      <span className="text-amber-900">{formatDate(booking.date)}</span>
                      <span className="text-amber-700/60">at {booking.time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-amber-900">{booking.guests}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-amber-900">
                      {booking.tableNumber ? `T${booking.tableNumber}` : 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors.booking[booking.status]
                    } bg-opacity-20`}>
                      <span className={`w-2 h-2 rounded-full ${statusColors.booking[booking.status]}`} />
                      {statusLabels.booking[booking.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
