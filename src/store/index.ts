import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSupabaseConfigured } from '@/lib/supabase';
import { updateBookingStatusInSupabase, updateTableStatusInSupabase } from '@/lib/supabaseAdminApi';
import type { 
  User, 
  RestaurantTable, 
  Booking, 
  BookingStatus, 
  TableStatus,
  DailyReport,
  RestaurantSettings,
  TimeSlot 
} from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);

// Booking Store
interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  selectedDate: string;
  selectedTime: string;
  selectedGuests: number;
  availableSlots: TimeSlot[];
  isLoading: boolean;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setSelectedGuests: (guests: number) => void;
  setAvailableSlots: (slots: TimeSlot[]) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useBookingStore = create<BookingState>()((set) => ({
  bookings: [],
  currentBooking: null,
  selectedDate: '',
  selectedTime: '',
  selectedGuests: 2,
  availableSlots: [],
  isLoading: false,
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ 
    bookings: [booking, ...state.bookings] 
  })),
  updateBooking: (booking) => set((state) => ({
    bookings: state.bookings.map((b) => 
      b.id === booking.id ? booking : b
    ),
  })),
  deleteBooking: (bookingId) => set((state) => ({
    bookings: state.bookings.filter((b) => b.id !== bookingId),
  })),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setSelectedGuests: (guests) => set({ selectedGuests: guests }),
  setAvailableSlots: (slots) => set({ availableSlots: slots }),
  updateBookingStatus: (bookingId, status) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      ),
    }));

    if (isSupabaseConfigured) {
      void updateBookingStatusInSupabase(bookingId, status).catch((error: unknown) => {
        console.warn('Failed to sync booking status to Supabase:', error);
      });
    }
  },
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

// Table Store
interface TableState {
  tables: RestaurantTable[];
  selectedTable: RestaurantTable | null;
  setTables: (tables: RestaurantTable[]) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  updateTablePosition: (tableId: string, x: number, y: number) => void;
  setSelectedTable: (table: RestaurantTable | null) => void;
}

export const useTableStore = create<TableState>()((set) => ({
  tables: [],
  selectedTable: null,
  setTables: (tables) => set({ tables }),
  updateTableStatus: (tableId, status) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status } : t
      ),
    }));

    if (isSupabaseConfigured) {
      void updateTableStatusInSupabase(tableId, status).catch((error: unknown) => {
        console.warn('Failed to sync table status to Supabase:', error);
      });
    }
  },
  updateTablePosition: (tableId, x, y) => set((state) => ({
    tables: state.tables.map((t) =>
      t.id === tableId ? { ...t, x, y } : t
    ),
  })),
  setSelectedTable: (table) => set({ selectedTable: table }),
}));

// UI Store
interface UIState {
  activePanel: 'customer' | 'admin' | 'employee';
  isSidebarOpen: boolean;
  theme: 'dark' | 'light';
  setActivePanel: (panel: 'customer' | 'admin' | 'employee') => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activePanel: 'customer',
      isSidebarOpen: true,
      theme: 'dark',
      setActivePanel: (panel) => set({ activePanel: panel }),
      toggleSidebar: () => set((state) => ({ 
        isSidebarOpen: !state.isSidebarOpen 
      })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ui-storage' }
  )
);

// Analytics Store
interface AnalyticsState {
  reports: DailyReport[];
  selectedDateRange: { start: string; end: string };
  setReports: (reports: DailyReport[]) => void;
  setSelectedDateRange: (range: { start: string; end: string }) => void;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  reports: [],
  selectedDateRange: { start: '', end: '' },
  setReports: (reports) => set({ reports }),
  setSelectedDateRange: (range) => set({ selectedDateRange: range }),
}));

// Settings Store
interface SettingsState {
  settings: RestaurantSettings | null;
  setSettings: (settings: RestaurantSettings) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
}));

// Mock Data Store for Demo
interface MockDataState {
  isMockMode: boolean;
  toggleMockMode: () => void;
}

export const useMockDataStore = create<MockDataState>()((set) => ({
  isMockMode: !isSupabaseConfigured,
  toggleMockMode: () => set((state) => ({ isMockMode: !state.isMockMode })),
}));
