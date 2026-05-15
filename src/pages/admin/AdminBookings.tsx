import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  Users,
  MoreHorizontal,
  Edit,
  X,
} from 'lucide-react';

import { useBookingStore } from '@/store';
import { formatDate, statusColors, statusLabels } from '@/restaurantUtils';
import { fetchStaffOperationalData } from '@/frontendapis';

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

const statusFilters: BookingStatus[] = [
  'confirmed',
  'arrived',
  'seated',
  'completed',
  'cancelled',
  'no_show',
];

const ITEMS_PER_PAGE = 7;

export const AdminBookings = () => {
  const { bookings, updateBookingStatus, setBookings } =
    useBookingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<BookingStatus | 'all'>('all');

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [dateFilter, setDateFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (bookings.length > 0) return;

    let isMounted = true;

    void (async () => {
      try {
        const staffData = await fetchStaffOperationalData();

        if (isMounted) {
          setBookings(staffData.bookings);
        }
      } catch (error) {
        console.warn('Failed to load admin bookings:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [bookings.length, setBookings]);

  // ================= FILTER BOOKINGS =================

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const matchesSearch =
          booking.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.bookingId
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          booking.customerEmail
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          booking.status === statusFilter;

        const today = new Date()
          .toISOString()
          .split('T')[0];

        const matchesDate =
          dateFilter === 'all' ||
          (dateFilter === 'today' &&
            booking.date === today) ||
          (dateFilter === 'upcoming' &&
            booking.date > today) ||
          (dateFilter === 'past' &&
            booking.date < today);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        );
      }),
    [bookings, searchQuery, statusFilter, dateFilter]
  );

  // ================= PAGINATION =================

  const totalPages = Math.ceil(
    filteredBookings.length / ITEMS_PER_PAGE
  );

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  // ================= STATUS UPDATE =================

  const handleStatusChange = (
    bookingId: string,
    status: BookingStatus
  ) => {
    updateBookingStatus(bookingId, status);
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-amber-900 mb-2">
            Bookings
          </h1>

          <p className="text-amber-700/60">
            Manage all reservations and their status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-700/70">
            {filteredBookings.length} bookings
          </span>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/50"
            />

            <Input
              type="text"
              placeholder="Search by name, booking ID, or email..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="
                pl-10 h-11 rounded-xl
                border border-amber-200
                bg-white
                text-amber-900
                placeholder:text-amber-700/40
                focus:border-amber-300
                focus:ring-amber-200
              "
            />
          </div>
        </div>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(e.target.value)
          }
          className="
            h-11 rounded-xl px-4
            border border-amber-200
            bg-white text-amber-900
            font-medium
            hover:bg-amber-50
            transition
          "
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as BookingStatus | 'all'
            )
          }
          className="
            h-11 rounded-xl px-4
            border border-amber-200
            bg-white text-amber-900
            font-medium
            hover:bg-amber-50
            transition
          "
        >
          <option value="all">All Statuses</option>

          {statusFilters.map((status) => (
            <option
              key={status}
              value={status}
            >
              {statusLabels.booking[status]}
            </option>
          ))}
        </select>
      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-3xl border border-amber-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-amber-50/40 border-b border-amber-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-amber-700/70">
                  Booking ID
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-amber-700/70">
                  Customer
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-amber-700/70">
                  Date & Time
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-amber-700/70">
                  Guests
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-amber-700/70">
                  Table
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-amber-700/70">
                  Status
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-amber-700/70">
                  Payment
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-amber-700/70">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="
                    border-b border-amber-100
                    hover:bg-amber-50/30
                    transition
                  "
                >
                  {/* Booking ID */}
                  <td className="py-5 px-6">
                    <span className="font-mono text-sm font-semibold text-amber-700">
                      {booking.bookingId}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-5 px-6">
                    <div>
                      <p className="font-medium text-amber-900">
                        {booking.customerName}
                      </p>

                      <p className="text-sm text-amber-700/60">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Calendar
                        size={14}
                        className="text-amber-700/50"
                      />

                      <span className="text-amber-900">
                        {formatDate(booking.date)}
                      </span>

                      <Clock
                        size={14}
                        className="text-amber-700/50 ml-1"
                      />

                      <span className="text-amber-700/70">
                        {booking.time}
                      </span>
                    </div>
                  </td>

                  {/* Guests */}
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <Users
                        size={14}
                        className="text-amber-700/50"
                      />

                      <span className="text-amber-900">
                        {booking.guests}
                      </span>
                    </div>
                  </td>

                  {/* Table */}
                  <td className="py-5 px-6">
                    <span className="text-amber-900">
                      {booking.tableNumber
                        ? `T${booking.tableNumber}`
                        : 'Unassigned'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-5 px-6">
                    <span
                      className={`
                        inline-flex items-center gap-2
                        px-3 py-1.5 rounded-full
                        text-xs font-medium
                        ${statusColors.booking[booking.status]}
                        bg-opacity-20
                      `}
                    >
                      <span
                        className={`
                          w-2 h-2 rounded-full
                          ${statusColors.booking[booking.status]}
                        `}
                      />

                      {
                        statusLabels.booking[
                          booking.status
                        ]
                      }
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="py-5 px-6">
                    <span
                      className={`text-sm font-semibold ${
                        booking.paymentStatus === 'paid'
                          ? 'text-emerald-600'
                          : booking.paymentStatus ===
                            'refunded'
                          ? 'text-amber-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {booking.paymentStatus
                        .charAt(0)
                        .toUpperCase() +
                        booking.paymentStatus.slice(1)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-5 px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-xl hover:bg-amber-100 transition">
                          <MoreHorizontal
                            size={18}
                            className="text-amber-700/70"
                          />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="bg-white border border-amber-200">
                        <DropdownMenuItem
                          onClick={() =>
                            setSelectedBooking(
                              booking
                            )
                          }
                          className="cursor-pointer text-amber-900 hover:bg-amber-50"
                        >
                          <Edit
                            size={14}
                            className="mr-2"
                          />
                          Edit Status
                        </DropdownMenuItem>

                        {booking.status !==
                          'cancelled' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(
                                booking.id,
                                'cancelled'
                              )
                            }
                            className="cursor-pointer text-rose-600 hover:bg-rose-50"
                          >
                            <X
                              size={14}
                              className="mr-2"
                            />
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

        {/* ================= PAGINATION ================= */}

        {filteredBookings.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5 border-t border-amber-200 bg-amber-50/10">
            {/* Results */}
            <div className="text-sm text-amber-700/70">
              Showing{' '}
              <span className="font-semibold text-amber-900">
                {(currentPage - 1) *
                  ITEMS_PER_PAGE +
                  1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-amber-900">
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredBookings.length
                )}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-amber-900">
                {filteredBookings.length}
              </span>{' '}
              bookings
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={currentPage === 1}
                className="
                  px-4 py-2 rounded-xl
                  border border-amber-200
                  bg-white
                  text-sm text-amber-800
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-amber-50
                  transition
                "
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              )
                .slice(
                  Math.max(currentPage - 3, 0),
                  Math.min(
                    currentPage + 2,
                    totalPages
                  )
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`
                      w-10 h-10 rounded-xl
                      text-sm font-medium
                      transition

                      ${
                        currentPage === page
                          ? 'bg-amber-700 text-white'
                          : `
                            border border-amber-200
                            bg-white
                            text-amber-800
                            hover:bg-amber-50
                          `
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                  )
                }
                disabled={
                  currentPage === totalPages
                }
                className="
                  px-4 py-2 rounded-xl
                  border border-amber-200
                  bg-white
                  text-sm text-amber-800
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-amber-50
                  transition
                "
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {filteredBookings.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-amber-700/60 text-lg">
              No bookings found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* ================= STATUS DIALOG ================= */}

      <Dialog
        open={!!selectedBooking}
        onOpenChange={() =>
          setSelectedBooking(null)
        }
      >
        <DialogContent className="bg-white border border-amber-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-amber-900">
              Update Booking Status
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
                <p className="text-sm text-amber-700/60 mb-1">
                  Booking
                </p>

                <p className="font-semibold text-amber-900">
                  {selectedBooking.bookingId}
                </p>

                <p className="text-amber-700/70">
                  {selectedBooking.customerName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    'confirmed',
                    'arrived',
                    'seated',
                    'completed',
                    'no_show',
                    'cancelled',
                  ] as BookingStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      handleStatusChange(
                        selectedBooking.id,
                        status
                      )
                    }
                    className={`
                      p-3 rounded-xl border transition

                      ${
                        selectedBooking.status ===
                        status
                          ? `
                            border-amber-700
                            bg-amber-100
                            text-amber-800
                            font-semibold
                          `
                          : `
                            border-amber-200
                            text-amber-700/70
                            hover:bg-amber-50
                            hover:text-amber-800
                          `
                      }
                    `}
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