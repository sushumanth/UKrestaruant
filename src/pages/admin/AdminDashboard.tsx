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
import { formatCurrency, formatDate, statusColors, statusLabels } from '@/lib/mockData';
import { Button } from '@/components/ui/button';

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
  const { bookings } = useBookingStore();
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
    const todayBookings = bookings.filter(b => b.date === today);
    setTodayStats({
      totalBookings: todayBookings.length,
      totalGuests: todayBookings.reduce((sum, b) => sum + b.guests, 0),
      revenue: todayBookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.depositAmount, 0),
      noShows: todayBookings.filter(b => b.status === 'no_show').length,
    });
  }, [bookings, today]);

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[#F4F6FA] mb-2">Dashboard</h1>
        <p className="text-[#A9B1BE]">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
              <Calendar size={22} className="text-[#D4A23A]" />
            </div>
            <span className="text-emerald-400 text-sm flex items-center gap-1">
              <TrendingUp size={14} />
              +12%
            </span>
          </div>
          <p className="text-[#A9B1BE] text-sm mb-1">Today's Bookings</p>
          <p className="font-serif text-3xl text-[#F4F6FA]">{todayStats.totalBookings}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
              <Users size={22} className="text-[#D4A23A]" />
            </div>
            <span className="text-emerald-400 text-sm flex items-center gap-1">
              <TrendingUp size={14} />
              +8%
            </span>
          </div>
          <p className="text-[#A9B1BE] text-sm mb-1">Total Guests</p>
          <p className="font-serif text-3xl text-[#F4F6FA]">{todayStats.totalGuests}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
              <PoundSterling size={22} className="text-[#D4A23A]" />
            </div>
            <span className="text-emerald-400 text-sm flex items-center gap-1">
              <TrendingUp size={14} />
              +15%
            </span>
          </div>
          <p className="text-[#A9B1BE] text-sm mb-1">Deposit Revenue</p>
          <p className="font-serif text-3xl text-[#F4F6FA]">{formatCurrency(todayStats.revenue)}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertCircle size={22} className="text-rose-500" />
            </div>
            <span className="text-rose-400 text-sm flex items-center gap-1">
              <TrendingDown size={14} />
              -5%
            </span>
          </div>
          <p className="text-[#A9B1BE] text-sm mb-1">No Shows</p>
          <p className="font-serif text-3xl text-[#F4F6FA]">{todayStats.noShows}</p>
        </div>
      </div>

      {/* Charts & Lists */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl text-[#F4F6FA]">Revenue Overview</h3>
            <select className="input-luxury text-sm py-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" />
                <XAxis dataKey="date" stroke="#A9B1BE" fontSize={12} />
                <YAxis stroke="#A9B1BE" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#14171C', 
                    border: '1px solid rgba(244,246,250,0.10)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#D4A23A" 
                  strokeWidth={2}
                  dot={{ fill: '#D4A23A', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy */}
        <div className="glass-card p-6">
          <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Table Occupancy</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#2A2F3A"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#D4A23A"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${occupancyRate * 4.4} 440`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-4xl text-[#F4F6FA]">{occupancyRate}%</span>
                <span className="text-[#A9B1BE] text-sm">Occupied</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#A9B1BE] text-sm">Available</span>
              <span className="text-[#F4F6FA]">{tables.filter(t => t.status === 'available').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A9B1BE] text-sm">Booked</span>
              <span className="text-[#F4F6FA]">{tables.filter(t => t.status === 'booked').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A9B1BE] text-sm">Seated</span>
              <span className="text-[#F4F6FA]">{tables.filter(t => t.status === 'seated').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-[#F4F6FA]">Upcoming Bookings</h3>
          <Link to="/admin/bookings">
            <Button className="btn-gold-outline text-sm">View All</Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(244,246,250,0.08)]">
                <th className="text-left py-3 px-4 text-[#A9B1BE] text-sm font-medium">Booking ID</th>
                <th className="text-left py-3 px-4 text-[#A9B1BE] text-sm font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-[#A9B1BE] text-sm font-medium">Date & Time</th>
                <th className="text-left py-3 px-4 text-[#A9B1BE] text-sm font-medium">Guests</th>
                <th className="text-left py-3 px-4 text-[#A9B1BE] text-sm font-medium">Table</th>
                <th className="text-left py-3 px-4 text-[#A9B1BE] text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-[rgba(244,246,250,0.05)] hover:bg-[rgba(244,246,250,0.02)]">
                  <td className="py-4 px-4">
                    <span className="font-mono text-[#D4A23A]">{booking.bookingId}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-[#F4F6FA]">{booking.customerName}</p>
                      <p className="text-[#A9B1BE] text-sm">{booking.customerPhone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#A9B1BE]" />
                      <span className="text-[#F4F6FA]">{formatDate(booking.date)}</span>
                      <span className="text-[#A9B1BE]">at {booking.time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#F4F6FA]">{booking.guests}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[#F4F6FA]">
                      {booking.tableNumber ? `T${booking.tableNumber}` : 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
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
