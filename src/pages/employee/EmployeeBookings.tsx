import { useState } from 'react';
import { Search, Calendar, Clock, Users, CheckCircle2, XCircle, UserCheck, Utensils } from 'lucide-react';
import { useBookingStore } from '@/store';
import { formatDate, formatTime, statusColors, statusLabels } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Booking, BookingStatus } from '@/types';

export const EmployeeBookings = () => {
  const { bookings, updateBookingStatus } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const today = new Date().toISOString().split('T')[0];
    const matchesDate = 
      dateFilter === 'all' ||
      (dateFilter === 'today' && booking.date === today) ||
      (dateFilter === 'upcoming' && booking.date > today) ||
      (dateFilter === 'past' && booking.date < today);
    
    return matchesSearch && matchesDate;
  });

  const handleStatusUpdate = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#F4F6FA] mb-2">All Bookings</h1>
          <p className="text-[#A9B1BE]">View and manage reservations.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B1BE]" size={18} />
            <Input
              type="text"
              placeholder="Search by name or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury pl-10 w-full"
            />
          </div>
        </div>
        
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="input-luxury"
        >
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All Dates</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-[#A9B1BE]">No bookings found.</p>
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
  return (
    <div className="glass-card p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Date & Time */}
        <div className="lg:w-48">
          <div className="flex items-center gap-2 text-[#A9B1BE]">
            <Calendar size={14} />
            <span className="text-sm">{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock size={14} className="text-[#D4A23A]" />
            <span className="text-[#F4F6FA] font-medium">{formatTime(booking.time)}</span>
          </div>
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

        {/* Status & Actions */}
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs ${
            statusColors.booking[booking.status]
          }/20 text-${statusColors.booking[booking.status].replace('bg-', '')}-400`}>
            {statusLabels.booking[booking.status]}
          </span>

          <div className="flex items-center gap-2">
            {booking.status === 'confirmed' && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                  onClick={() => onStatusUpdate(booking.id, 'arrived')}
                >
                  <UserCheck size={16} />
                </Button>
                <Button
                  size="sm"
                  className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                  onClick={() => onStatusUpdate(booking.id, 'no_show')}
                >
                  <XCircle size={16} />
                </Button>
              </>
            )}
            {booking.status === 'arrived' && (
              <Button
                size="sm"
                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                onClick={() => onStatusUpdate(booking.id, 'seated')}
              >
                <Utensils size={16} />
              </Button>
            )}
            {booking.status === 'seated' && (
              <Button
                size="sm"
                className="bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 border border-slate-500/30"
                onClick={() => onStatusUpdate(booking.id, 'completed')}
              >
                <CheckCircle2 size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
