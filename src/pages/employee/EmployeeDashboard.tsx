import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle2,
  XCircle,
  UserCheck,
  Utensils
} from 'lucide-react';
import { useBookingStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Booking, BookingStatus } from '@/types';

// Matching premium light theme status configurations
const staffStatusConfig: Record<BookingStatus, { label: string; class: string }> = {
  pending: { label: 'Pending Payment', class: 'bg-amber-100/50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  arrived: { label: 'Arrived', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  seated: { label: 'Seated', class: 'bg-purple-50 text-purple-700 border-purple-200' },
  completed: { label: 'Completed', class: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelled: { label: 'Cancelled', class: 'bg-rose-50 text-rose-700 border-rose-200' },
  no_show: { label: 'No Show', class: 'bg-red-50 text-red-700 border-red-200' }
};

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
    .filter(b => b.date === today && b.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleStatusUpdate = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="font-serif tracking-tight text-3xl text-slate-900 mb-2">Staff Dashboard</h1>
        <p className="text-slate-500">Manage today's reservations and guest flow.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100/50">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-slate-600 font-medium text-sm">Today's Bookings</span>
          </div>
          <p className="font-serif text-3xl text-slate-900">{todayStats.totalBookings}</p>
        </div>

        {/* Arrived Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-slate-600 font-medium text-sm">Arrived</span>
          </div>
          <p className="font-serif text-3xl text-slate-900">{todayStats.arrived}</p>
        </div>

        {/* Seated Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100/50">
              <Utensils className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-slate-600 font-medium text-sm">Seated</span>
          </div>
          <p className="font-serif text-3xl text-slate-900">{todayStats.seated}</p>
        </div>

        {/* No Shows Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100/50">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-slate-600 font-medium text-sm">No Shows</span>
          </div>
          <p className="font-serif text-3xl text-slate-900">{todayStats.noShows}</p>
        </div>
      </div>

      {/* Today's Timeline Content */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="font-serif text-xl tracking-tight text-slate-900">Today's Timeline</h3>
          </div>
          <span className="text-slate-500 font-medium text-sm bg-white px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm inline-flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div className="p-6">
          {todayBookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-900">No bookings found</p>
              <p className="text-slate-500 text-sm">There are no reservations scheduled for today.</p>
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
  const statusDecor = staffStatusConfig[booking.status] || staffStatusConfig['completed'];
  const isOverdue = isPastTime && booking.status === 'confirmed';
  
  return (
    <div className={`group p-5 rounded-2xl border transition-all duration-300 ${
      isOverdue 
        ? 'border-amber-200 bg-amber-50/30'
        : 'border-slate-100 bg-white hover:border-amber-200 hover:shadow-md'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* Time & Status Column */}
        <div className="flex sm:flex-col items-center sm:items-start justify-between sm:w-32 sm:border-r border-slate-100 sm:pr-6 shrink-0">
          <div>
            <p className="font-serif text-2xl text-slate-900 tracking-tight">{booking.time}</p>
            {isOverdue && (
              <span className="inline-block mt-1 text-amber-600 text-xs font-semibold px-2 py-0.5 bg-amber-100 rounded-full">
                Overdue
              </span>
            )}
          </div>
          <Badge variant="outline" className={`mt-2 font-medium border hidden sm:inline-flex ${statusDecor.class}`}>
            {statusDecor.label}
          </Badge>
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <p className="text-lg font-medium text-slate-900 truncate">
              {booking.customerName}
            </p>
            <Badge variant="outline" className={`font-medium border sm:hidden ${statusDecor.class}`}>
              {statusDecor.label}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md text-slate-600 border border-slate-100">
              <Users className="w-4 h-4 text-emerald-600" />
              {booking.guests} Guests
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md text-slate-600 border border-slate-100">
              <MapPin className="w-4 h-4 text-rose-500" />
              Table {booking.tableNumber || 'TBA'}
            </span>
            <span className="text-slate-400">•</span>
            <span>{booking.customerPhone}</span>
          </div>

          {booking.specialRequests && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50 flex gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-amber-700 text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-amber-800 leading-tight">
                {booking.specialRequests}
              </p>
            </div>
          )}
        </div>

        {/* Actions Column */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:w-32 shrink-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
          {booking.status === 'confirmed' && (
            <>
              <Button
                onClick={() => onStatusUpdate(booking.id, 'arrived')}
                className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 shadow-sm transition-all"
                size="sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Arrived
              </Button>
              <Button
                onClick={() => onStatusUpdate(booking.id, 'no_show')}
                variant="outline"
                className="w-full bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 shadow-sm transition-all"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                No Show
              </Button>
            </>
          )}

          {booking.status === 'arrived' && (
            <Button
              onClick={() => onStatusUpdate(booking.id, 'seated')}
              className="w-full bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 shadow-sm transition-all"
              size="sm"
            >
              <Utensils className="w-4 h-4 mr-1.5" />
              Seat Guest
            </Button>
          )}

          {booking.status === 'seated' && (
            <Button
              onClick={() => onStatusUpdate(booking.id, 'completed')}
              className="w-full bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm transition-all"
              size="sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Complete
            </Button>
          )}

          {['completed', 'cancelled', 'no_show'].includes(booking.status) && (
            <div className="h-8 flex flex-col justify-center">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Processed
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
