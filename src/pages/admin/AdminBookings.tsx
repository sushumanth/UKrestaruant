import { useState } from 'react';
import { Search, Calendar, Clock, Users, MoreHorizontal, Edit, X } from 'lucide-react';
import { useBookingStore } from '@/store';
import { formatDate, statusColors, statusLabels } from '@/lib/mockData';

import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Booking, BookingStatus } from '@/types';

const statusFilters: BookingStatus[] = ['confirmed', 'arrived', 'seated', 'completed', 'cancelled', 'no_show'];

export const AdminBookings = () => {
  const { bookings, updateBookingStatus } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dateFilter, setDateFilter] = useState('all');

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && booking.date === new Date().toISOString().split('T')[0]) ||
      (dateFilter === 'upcoming' && booking.date > new Date().toISOString().split('T')[0]) ||
      (dateFilter === 'past' && booking.date < new Date().toISOString().split('T')[0]);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#F4F6FA] mb-2">Bookings</h1>
          <p className="text-[#A9B1BE]">Manage all reservations and their status.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#A9B1BE] text-sm">
            {filteredBookings.length} bookings
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B1BE]" size={18} />
            <Input
              type="text"
              placeholder="Search by name, booking ID, or email..."
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
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
          className="input-luxury"
        >
          <option value="all">All Statuses</option>
          {statusFilters.map((status) => (
            <option key={status} value={status}>
              {statusLabels.booking[status]}
            </option>
          ))}
        </select>
      </div>

      {/* Bookings Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(244,246,250,0.02)]">
                <th className="text-left py-4 px-6 text-[#A9B1BE] text-sm font-medium">Booking ID</th>
                <th className="text-left py-4 px-6 text-[#A9B1BE] text-sm font-medium">Customer</th>
                <th className="text-left py-4 px-6 text-[#A9B1BE] text-sm font-medium">Date & Time</th>
                <th className="text-left py-4 px-6 text-[#A9B1BE] text-sm font-medium">Guests</th>
                <th className="text-left py-4 px-6 text-[#A9B1BE] text-sm font-medium">Table</th>
                <th className="text-left py-4 px-6 text-[#A9B1BE] text-sm font-medium">Status</th>
                <th className="text-left py-4 px-6 text-[#A9B1BE] text-sm font-medium">Payment</th>
                <th className="text-left py-4 px-6 text-[#A9B1BE] text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className="border-b border-[rgba(244,246,250,0.05)] hover:bg-[rgba(244,246,250,0.02)] transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="font-mono text-[#D4A23A]">{booking.bookingId}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-[#F4F6FA] font-medium">{booking.customerName}</p>
                      <p className="text-[#A9B1BE] text-sm">{booking.customerEmail}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#A9B1BE]" />
                      <span className="text-[#F4F6FA]">{formatDate(booking.date)}</span>
                      <Clock size={14} className="text-[#A9B1BE] ml-2" />
                      <span className="text-[#A9B1BE]">{booking.time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[#A9B1BE]" />
                      <span className="text-[#F4F6FA]">{booking.guests}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#F4F6FA]">
                      {booking.tableNumber ? `T${booking.tableNumber}` : 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                      statusColors.booking[booking.status]
                    }/20 text-${statusColors.booking[booking.status].replace('bg-', '')}-400`}>
                      <span className={`w-2 h-2 rounded-full ${statusColors.booking[booking.status]}`} />
                      {statusLabels.booking[booking.status]}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm ${
                      booking.paymentStatus === 'paid' ? 'text-emerald-400' : 
                      booking.paymentStatus === 'refunded' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-[rgba(244,246,250,0.05)] rounded-lg transition-colors">
                          <MoreHorizontal size={18} className="text-[#A9B1BE]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#14171C] border border-[rgba(244,246,250,0.10)]">
                        <DropdownMenuItem 
                          onClick={() => setSelectedBooking(booking)}
                          className="text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.05)] cursor-pointer"
                        >
                          <Edit size={14} className="mr-2" />
                          Edit Status
                        </DropdownMenuItem>
                        {booking.status !== 'cancelled' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <X size={14} className="mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[#A9B1BE]">No bookings found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Status Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="bg-[#14171C] border border-[rgba(244,246,250,0.10)]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#F4F6FA]">
              Update Booking Status
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="glass-card p-4">
                <p className="text-[#A9B1BE] text-sm mb-1">Booking</p>
                <p className="text-[#F4F6FA] font-medium">{selectedBooking.bookingId}</p>
                <p className="text-[#A9B1BE]">{selectedBooking.customerName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(['confirmed', 'arrived', 'seated', 'completed', 'no_show', 'cancelled'] as BookingStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedBooking.id, status)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedBooking.status === status
                        ? 'border-[#D4A23A] bg-[#D4A23A]/10 text-[#D4A23A]'
                        : 'border-[rgba(244,246,250,0.10)] text-[#A9B1BE] hover:bg-[rgba(244,246,250,0.05)]'
                    }`}
                  >
                    {statusLabels.booking[status]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
