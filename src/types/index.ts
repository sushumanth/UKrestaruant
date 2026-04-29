// Types for LuxeReserve Restaurant Booking System

export type UserRole = 'admin' | 'employee' | 'customer';

export type MenuCategory = 'starters' | 'mains' | 'biryani' | 'bread' | 'dessert';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
}

export type TableStatus = 'available' | 'booked' | 'reserved' | 'seated' | 'blocked';

export interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  timeSlot?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'arrived' | 'seated' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  tableId?: string;
  tableNumber?: number;
  status: BookingStatus;
  specialRequests?: string;
  depositAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  availableTables: number;
}

export interface DailyReport {
  date: string;
  totalBookings: number;
  totalGuests: number;
  totalRevenue: number;
  noShows: number;
  cancellations: number;
  averageOccupancy: number;
}

export interface RestaurantSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
  timeSlotInterval: number;
  defaultDepositAmount: number;
  cancellationDeadlineHours: number;
  autoReleaseMinutes: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  rating: number;
  prepTime: number;
  isVeg: boolean;
  tags: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Component Props Types
export interface BookingCardProps {
  onSubmit?: (bookingData: Partial<Booking>) => void;
  compact?: boolean;
}

export interface FloorPlanProps {
  tables: RestaurantTable[];
  bookings: Booking[];
  onTableClick?: (table: RestaurantTable) => void;
  onTableDrag?: (tableId: string, x: number, y: number) => void;
  readOnly?: boolean;
}

export interface TableCardProps {
  table: RestaurantTable;
  booking?: Booking;
  onClick?: () => void;
}

export interface BookingListProps {
  bookings: Booking[];
  onStatusChange?: (bookingId: string, status: BookingStatus) => void;
  onEdit?: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
}

export interface AnalyticsDashboardProps {
  reports: DailyReport[];
}

export interface NavProps {
  onBookClick?: () => void;
}
