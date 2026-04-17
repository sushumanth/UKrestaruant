import { useState } from 'react';
import { Download, Calendar, Users, PoundSterling, Clock } from 'lucide-react';
import { useAnalyticsStore } from '@/store';
import { formatCurrency } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminAnalytics = () => {
  const { reports } = useAnalyticsStore();
  const [dateRange, setDateRange] = useState('7');

  // Filter reports based on date range
  const filteredReports = reports.slice(-parseInt(dateRange));

  // Calculate totals
  const totals = filteredReports.reduce(
    (acc, report) => ({
      bookings: acc.bookings + report.totalBookings,
      guests: acc.guests + report.totalGuests,
      revenue: acc.revenue + report.totalRevenue,
      noShows: acc.noShows + report.noShows,
      cancellations: acc.cancellations + report.cancellations,
    }),
    { bookings: 0, guests: 0, revenue: 0, noShows: 0, cancellations: 0 }
  );

  // Chart data
  const bookingsData = filteredReports.map((r) => ({
    date: new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    bookings: r.totalBookings,
    guests: r.totalGuests,
  }));

  const revenueData = filteredReports.map((r) => ({
    date: new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    revenue: r.totalRevenue,
  }));

  const occupancyData = filteredReports.map((r) => ({
    date: new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    occupancy: r.averageOccupancy,
  }));

  // Peak hours data (mock)
  const peakHoursData = [
    { hour: '17:00', bookings: 12 },
    { hour: '18:00', bookings: 28 },
    { hour: '19:00', bookings: 45 },
    { hour: '20:00', bookings: 52 },
    { hour: '21:00', bookings: 38 },
    { hour: '22:00', bookings: 18 },
  ];

  // Status distribution
  const statusData = [
    { name: 'Completed', value: 245, color: '#10B981' },
    { name: 'Confirmed', value: 38, color: '#F59E0B' },
    { name: 'Cancelled', value: 18, color: '#EF4444' },
    { name: 'No Show', value: 12, color: '#6B7280' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#F4F6FA] mb-2">Analytics</h1>
          <p className="text-[#A9B1BE]">Track performance and key metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-luxury"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <Button className="btn-gold-outline flex items-center gap-2">
            <Download size={18} />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
              <Calendar size={18} className="text-[#D4A23A]" />
            </div>
            <span className="text-[#A9B1BE] text-sm">Total Bookings</span>
          </div>
          <p className="font-serif text-3xl text-[#F4F6FA]">{totals.bookings}</p>
          <p className="text-emerald-400 text-sm mt-1">+12% vs last period</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
              <Users size={18} className="text-[#D4A23A]" />
            </div>
            <span className="text-[#A9B1BE] text-sm">Total Guests</span>
          </div>
          <p className="font-serif text-3xl text-[#F4F6FA]">{totals.guests}</p>
          <p className="text-emerald-400 text-sm mt-1">+8% vs last period</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
              <PoundSterling size={18} className="text-[#D4A23A]" />
            </div>
            <span className="text-[#A9B1BE] text-sm">Revenue</span>
          </div>
          <p className="font-serif text-3xl text-[#F4F6FA]">{formatCurrency(totals.revenue)}</p>
          <p className="text-emerald-400 text-sm mt-1">+15% vs last period</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <Clock size={18} className="text-rose-500" />
            </div>
            <span className="text-[#A9B1BE] text-sm">No Shows</span>
          </div>
          <p className="font-serif text-3xl text-[#F4F6FA]">{totals.noShows}</p>
          <p className="text-rose-400 text-sm mt-1">{((totals.noShows / totals.bookings) * 100).toFixed(1)}% rate</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings Trend */}
        <div className="glass-card p-6">
          <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Bookings Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingsData}>
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
                  dataKey="bookings" 
                  stroke="#D4A23A" 
                  strokeWidth={2}
                  dot={{ fill: '#D4A23A', strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="guests" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="glass-card p-6">
          <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" />
                <XAxis dataKey="date" stroke="#A9B1BE" fontSize={12} />
                <YAxis stroke="#A9B1BE" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#14171C', 
                    border: '1px solid rgba(244,246,250,0.10)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="#D4A23A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Occupancy Rate */}
        <div className="glass-card p-6">
          <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Occupancy Rate</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" />
                <XAxis dataKey="date" stroke="#A9B1BE" fontSize={10} />
                <YAxis stroke="#A9B1BE" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#14171C', 
                    border: '1px solid rgba(244,246,250,0.10)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${value}%`}
                />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="glass-card p-6">
          <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Peak Hours</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" />
                <XAxis dataKey="hour" stroke="#A9B1BE" fontSize={10} />
                <YAxis stroke="#A9B1BE" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#14171C', 
                    border: '1px solid rgba(244,246,250,0.10)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="bookings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="glass-card p-6">
          <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Status Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#14171C', 
                    border: '1px solid rgba(244,246,250,0.10)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#A9B1BE] text-xs">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
