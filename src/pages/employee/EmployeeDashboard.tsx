import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2,
  XCircle,
  UserCheck,
  Utensils
} from 'lucide-react';
import { useBookingStore } from '@/store';
import { statusColors, statusLabels } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import type { Booking, BookingStatus } from '@/types';

export const EmployeeDashboard = () => {
  const { bookings, updateBookingStatus } = useBookingStore();
  const [todayStats, setTodayStats] = useState({
    totalBookings: 0,
    arrived: 0,
    seated: 0,
    noShows: 0,
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const todayBookings = bookings.filter(b => b.date === today);
    setTodayStats({
      totalBookings: todayBookings.length,
      arrived: todayBookings.filter(b => b.status === 'arrived').length,
      seated: todayBookings.filter(b => b.status === 'seated').length,
      noShows: todayBookings.filter(b => b.status === 'no_show').length,
    });
  }, [bookings, today]);

  // Get today's bookings sorted by time
  const todayBookings = bookings
    .filter(b => b.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleStatusUpdate = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[#F4F6FA] mb-2">Staff Dashboard</h1>
        <p className="text-[#A9B1BE]">Manage today's reservations and guest flow.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#D4A23A]/10 flex items-center justify-center">
              <Calendar size={18} className="text-[#D4A23A]" />
            </div>
            <span className="text-[#A9B1BE] text-sm">Today's Bookings</span>
          </div>
          <p className="font-serif text-2xl text-[#F4F6FA]">{todayStats.totalBookings}</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <UserCheck size={18} className="text-emerald-500" />
            </div>
            <span className="text-[#A9B1BE] text-sm">Arrived</span>
          </div>
          <p className="font-serif text-2xl text-[#F4F6FA]">{todayStats.arrived}</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Utensils size={18} className="text-blue-500" />
            </div>
            <span className="text-[#A9B1BE] text-sm">Seated</span>
          </div>
          <p className="font-serif text-2xl text-[#F4F6FA]">{todayStats.seated}</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <XCircle size={18} className="text-rose-500" />
            </div>
            <span className="text-[#A9B1BE] text-sm">No Shows</span>
          </div>
          <p className="font-serif text-2xl text-[#F4F6FA]">{todayStats.noShows}</p>
        </div>
      </div>

      {/* Today's Timeline */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-xl text-[#F4F6FA]">Today's Bookings</h3>
          <span className="text-[#A9B1BE] text-sm">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {todayBookings.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[#A9B1BE]">No bookings for today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Button className="btn-gold flex items-center justify-center gap-2">
          <CheckCircle2 size={18} />
          Mark All Arrived
        </Button>
        <Button className="btn-ghost flex items-center justify-center gap-2">
          <Utensils size={18} />
          Clear Completed Tables
        </Button>
        <Button className="btn-ghost flex items-center justify-center gap-2">
          <Clock size={18} />
          View Late Arrivals
        </Button>
      </div>
    </div>
  );
};

// Booking Card Component
interface BookingCardProps {
  booking: Booking;
  onStatusUpdate: (bookingId: string, status: BookingStatus) => void;
}

const BookingCard = ({ booking, onStatusUpdate }: BookingCardProps) => {
  const isPastTime = new Date(`${booking.date}T${booking.time}`) < new Date();
  
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isPastTime && booking.status === 'confirmed'
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-[rgba(244,246,250,0.08)] bg-[rgba(244,246,250,0.02)]'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Time & Status */}
        <div className="flex items-center gap-4 lg:w-48">
          <div className="text-center">
            <p className="font-serif text-xl text-[#F4F6FA]">{booking.time}</p>
            {isPastTime && booking.status === 'confirmed' && (
              <span className="text-amber-400 text-xs">Overdue</span>
            )}
          </div>
          <span className={`px-2 py-1 rounded text-xs ${
            statusColors.booking[booking.status]
          }/20 text-${statusColors.booking[booking.status].replace('bg-', '')}-400`}>
            {statusLabels.booking[booking.status]}
          </span>
        </div>

        {/* Guest Info */}
        <div className="flex-1">
          <p className="text-[#F4F6FA] font-medium">{booking.customerName}</p>
          <div className="flex items-center gap-4 text-sm text-[#A9B1BE]">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {booking.guests} guests
            </span>
            <span>•</span>
            <span>{booking.customerPhone}</span>
          </div>
          {booking.specialRequests && (
            <p className="text-amber-400 text-sm mt-1">
              Note: {booking.specialRequests}
            </p>
          )}
        </div>

        {/* Table & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[#A9B1BE] text-sm">Table</p>
            <p className="text-[#F4F6FA] font-medium">
              {booking.tableNumber ? `T${booking.tableNumber}` : 'TBD'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {booking.status === 'confirmed' && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                  onClick={() => onStatusUpdate(booking.id, 'arrived')}
                >
                  <CheckCircle2 size={16} className="mr-1" />
                  Arrived
                </Button>
                <Button
                  size="sm"
                  className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                  onClick={() => onStatusUpdate(booking.id, 'no_show')}
                >
                  <XCircle size={16} className="mr-1" />
                  No Show
                </Button>
              </>
            )}
            {booking.status === 'arrived' && (
              <Button
                size="sm"
                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                onClick={() => onStatusUpdate(booking.id, 'seated')}
              >
                <Utensils size={16} className="mr-1" />
                Seat
              </Button>
            )}
            {booking.status === 'seated' && (
              <Button
                size="sm"
                className="bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 border border-slate-500/30"
                onClick={() => onStatusUpdate(booking.id, 'completed')}
              >
                <CheckCircle2 size={16} className="mr-1" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
