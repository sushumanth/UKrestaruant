import type { 
  RestaurantTable, 
  Booking, 
  User, 
  DailyReport, 
  RestaurantSettings,
  MenuItem
} from '@/types';

// Generate 50 tables with various capacities
export const generateTables = (): RestaurantTable[] => {
  const tables: RestaurantTable[] = [];
  const capacities = [2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 6, 8, 8, 10];
  
  for (let i = 1; i <= 50; i++) {
    const capacity = capacities[Math.floor(Math.random() * capacities.length)];
    
    tables.push({
      id: `table-${i}`,
      tableNumber: i,
      capacity,
      status: Math.random() > 0.7 ? 'booked' : 'available',
    });
  }
  return tables;
};

// Generate mock bookings
export const generateBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const statuses = ['confirmed', 'arrived', 'seated', 'completed', 'cancelled', 'no_show'] as const;
  const names = [
    'James Wilson', 'Emma Thompson', 'Oliver Brown', 'Sophie Taylor',
    'William Davis', 'Isabella Miller', 'Henry Wilson', 'Mia Johnson',
    'Alexander Moore', 'Charlotte White', 'Daniel Harris', 'Amelia Clark',
    'Matthew Lewis', 'Harper Walker', 'Joseph Hall', 'Evelyn Young',
    'Samuel King', 'Abigail Wright', 'David Lopez', 'Emily Hill'
  ];
  
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + Math.floor(Math.random() * 14) - 3);
    
    const hours = 17 + Math.floor(Math.random() * 5);
    const minutes = Math.random() > 0.5 ? '00' : '30';
    
    bookings.push({
      id: `booking-${i}`,
      bookingId: `LR${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      customerName: names[Math.floor(Math.random() * names.length)],
      customerEmail: `customer${i}@example.com`,
      customerPhone: `+44 7${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      date: date.toISOString().split('T')[0],
      time: `${hours}:${minutes}`,
      guests: [2, 2, 4, 4, 4, 6, 6, 8][Math.floor(Math.random() * 8)],
      tableId: `table-${Math.floor(Math.random() * 50) + 1}`,
      tableNumber: Math.floor(Math.random() * 50) + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      specialRequests: Math.random() > 0.7 ? 'Window seat preferred' : undefined,
      depositAmount: 5,
      paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  return bookings.sort((a, b) => 
    new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()
  );
};

// Mock users
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@luxereserve.co',
    role: 'admin',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    phone: '+44 161 123 4567',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'employee-1',
    email: 'staff@luxereserve.co',
    role: 'employee',
    firstName: 'Tom',
    lastName: 'Anderson',
    phone: '+44 161 123 4568',
    createdAt: '2024-01-15T00:00:00Z',
  },
];

// Mock restaurant settings
export const mockSettings: RestaurantSettings = {
  id: 'settings-1',
  name: 'LuxeReserve',
  address: '12 Royal Exchange, Manchester M2 7EA',
  phone: '+44 (0)161 123 4567',
  email: 'hello@luxereserve.co',
  openingTime: '17:00',
  closingTime: '23:00',
  timeSlotInterval: 30,
  defaultDepositAmount: 5,
  cancellationDeadlineHours: 24,
  autoReleaseMinutes: 15,
};

const mockMenuTimestamp = '2026-04-28T00:00:00Z';

export const mockMenuItems: MenuItem[] = [
  {
    id: 'starter-1',
    name: 'Paneer Tikka',
    description: 'Char-grilled cottage cheese with smoky spice marinade.',
    price: 8.5,
    category: 'starters',
    image: '/dining_room.jpg',
    rating: 4.8,
    prepTime: 14,
    isVeg: true,
    tags: ['signature', 'starter'],
    isActive: true,
    sortOrder: 1,
    createdAt: mockMenuTimestamp,
    updatedAt: mockMenuTimestamp,
  },
  {
    id: 'starter-2',
    name: 'Chicken 65',
    description: 'Crispy fried chicken tossed in South Indian spices.',
    price: 9.5,
    category: 'starters',
    image: '/kitchen_team.jpg',
    rating: 4.7,
    prepTime: 12,
    isVeg: false,
    tags: ['popular', 'starter'],
    isActive: true,
    sortOrder: 2,
    createdAt: mockMenuTimestamp,
    updatedAt: mockMenuTimestamp,
  },
  {
    id: 'main-1',
    name: 'Butter Chicken',
    description: 'Tender chicken in creamy tomato butter gravy.',
    price: 13.9,
    category: 'mains',
    image: '/chef_plating.jpg',
    rating: 4.9,
    prepTime: 18,
    isVeg: false,
    tags: ['signature', 'main'],
    isActive: true,
    sortOrder: 1,
    createdAt: mockMenuTimestamp,
    updatedAt: mockMenuTimestamp,
  },
  {
    id: 'main-2',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils finished with cream.',
    price: 11.5,
    category: 'mains',
    image: '/homepa1.png',
    rating: 4.7,
    prepTime: 16,
    isVeg: true,
    tags: ['vegetarian', 'main'],
    isActive: true,
    sortOrder: 2,
    createdAt: mockMenuTimestamp,
    updatedAt: mockMenuTimestamp,
  },
  {
    id: 'biryani-1',
    name: 'Lamb Biryani',
    description: 'Fragrant basmati rice with slow-cooked lamb.',
    price: 14.9,
    category: 'biryani',
    image: '/dessert.jpg',
    rating: 4.8,
    prepTime: 22,
    isVeg: false,
    tags: ['signature', 'biryani'],
    isActive: true,
    sortOrder: 1,
    createdAt: mockMenuTimestamp,
    updatedAt: mockMenuTimestamp,
  },
  {
    id: 'biryani-2',
    name: 'Veg Dum Biryani',
    description: 'Saffron basmati layered with vegetables and herbs.',
    price: 12.2,
    category: 'biryani',
    image: '/backgroundtheme1.png',
    rating: 4.6,
    prepTime: 20,
    isVeg: true,
    tags: ['vegetarian', 'biryani'],
    isActive: true,
    sortOrder: 2,
    createdAt: mockMenuTimestamp,
    updatedAt: mockMenuTimestamp,
  },
  {
    id: 'bread-1',
    name: 'Garlic Naan',
    description: 'Tandoor-baked naan topped with butter and garlic.',
    price: 3.5,
    category: 'bread',
    image: '/homepa1.png',
    rating: 4.7,
    prepTime: 8,
    isVeg: true,
    tags: ['bread', 'side'],
    isActive: true,
    sortOrder: 1,
    createdAt: mockMenuTimestamp,
    updatedAt: mockMenuTimestamp,
  },
  {
    id: 'dessert-1',
    name: 'Gulab Jamun',
    description: 'Warm milk-solid dumplings in cardamom syrup.',
    price: 5.2,
    category: 'dessert',
    image: '/dessert.jpg',
    rating: 4.9,
    prepTime: 6,
    isVeg: true,
    tags: ['dessert', 'sweet'],
    isActive: true,
    sortOrder: 1,
    createdAt: mockMenuTimestamp,
    updatedAt: mockMenuTimestamp,
  },
];

// Generate mock reports
export const generateReports = (): DailyReport[] => {
  const reports: DailyReport[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const totalBookings = Math.floor(Math.random() * 40) + 20;
    const noShows = Math.floor(totalBookings * 0.08);
    const cancellations = Math.floor(totalBookings * 0.05);
    
    reports.push({
      date: date.toISOString().split('T')[0],
      totalBookings,
      totalGuests: totalBookings * 3,
      totalRevenue: (totalBookings - cancellations - noShows) * 5,
      noShows,
      cancellations,
      averageOccupancy: Math.floor(Math.random() * 30) + 60,
    });
  }
  
  return reports;
};

// Time slots generation
export const generateTimeSlots = (date: string): { time: string; available: boolean; availableTables: number }[] => {
  void date;
  const slots: { time: string; available: boolean; availableTables: number }[] = [];

  const windows = [
    { startHour: 11, endHour: 15 },
    { startHour: 18, endHour: 22 },
  ];

  for (const window of windows) {
    for (let hour = window.startHour; hour < window.endHour; hour += 1) {
      for (const minutes of [0, 15, 30, 45]) {
        const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const availableTables = Math.floor(Math.random() * 15) + 5;

        slots.push({
          time,
          available: availableTables > 0,
          availableTables,
        });
      }
    }
  }
  
  return slots;
};

// Table allocation algorithm
export const findOptimalTable = (
  guests: number,
  tables: RestaurantTable[],
  existingBookings: Booking[],
  date: string,
  time: string
): RestaurantTable | null => {
  // Filter available tables
  const normalizedTime = time.slice(0, 5);
  const availableTables = tables.filter((table) => {
    // Check capacity
    if (table.capacity < guests) return false;
    
    // Check if table is already booked for this time
    const isBooked = existingBookings.some(
      (b) => 
        (b.tableId === table.id || b.tableNumber === table.tableNumber) &&
        b.date === date &&
        b.time.slice(0, 5) === normalizedTime &&
        ['confirmed', 'arrived', 'seated'].includes(b.status)
    );
    
    return !isBooked && table.status !== 'blocked';
  });
  
  if (availableTables.length === 0) return null;
  
  // Sort by capacity (closest match first to optimize table usage)
  availableTables.sort((a, b) => a.capacity - b.capacity);
  
  return availableTables[0];
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate booking ID
export const generateBookingId = (): string => {
  return 'LR' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Status colors
export const statusColors = {
  table: {
    available: 'bg-emerald-500',
    booked: 'bg-rose-500',
    reserved: 'bg-amber-500',
    seated: 'bg-blue-500',
    blocked: 'bg-slate-600',
  },
  booking: {
    pending: 'bg-amber-500',
    confirmed: 'bg-emerald-500',
    arrived: 'bg-blue-500',
    seated: 'bg-indigo-500',
    completed: 'bg-slate-500',
    cancelled: 'bg-rose-500',
    no_show: 'bg-slate-700',
  },
};

// Status labels
export const statusLabels = {
  table: {
    available: 'Available',
    booked: 'Booked',
    reserved: 'Reserved',
    seated: 'Seated',
    blocked: 'Blocked',
  },
  booking: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    arrived: 'Arrived',
    seated: 'Seated',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  },
};
