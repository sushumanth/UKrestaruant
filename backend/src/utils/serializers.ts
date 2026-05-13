import type { Asset, Booking, MenuItem, Order, OrderItem, RestaurantSettings, RestaurantTable, User } from '@prisma/client';

const toNumber = (value: unknown) => Number(value);

export const serializeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const serializeRestaurantSettings = (settings: RestaurantSettings) => ({
  id: settings.id,
  name: settings.name,
  address: settings.address,
  phone: settings.phone,
  email: settings.email,
  openingTime: settings.openingTime,
  closingTime: settings.closingTime,
  timeSlotInterval: settings.timeSlotInterval,
  defaultDepositAmount: toNumber(settings.defaultDepositAmount),
  cancellationDeadlineHours: settings.cancellationDeadlineHours,
  autoReleaseMinutes: settings.autoReleaseMinutes,
  createdAt: settings.createdAt,
  updatedAt: settings.updatedAt,
});

export const serializeRestaurantTable = (table: RestaurantTable) => ({
  id: table.id,
  tableNumber: table.tableNumber,
  capacity: table.capacity,
  status: table.status,
  timeSlot: table.timeSlot,
  createdAt: table.createdAt,
  updatedAt: table.updatedAt,
});

export const serializeMenuItem = (item: MenuItem) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  price: toNumber(item.price),
  category: item.category,
  imageUrl: item.imageUrl,
  rating: item.rating,
  prepTime: item.prepTime,
  isVeg: item.isVeg,
  tags: item.tags,
  isActive: item.isActive,
  sortOrder: item.sortOrder,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const serializeBooking = (booking: Booking) => ({
  id: booking.id,
  bookingCode: booking.bookingCode,
  customerName: booking.customerName,
  customerEmail: booking.customerEmail,
  customerPhone: booking.customerPhone,
  bookingDate: booking.bookingDate,
  // provide a bookingTime string for legacy clients (HH:mm)
  bookingTime: booking.bookingStart ? new Date(booking.bookingStart).toISOString().slice(11, 16) : (booking.bookingTime ?? ''),
  guests: booking.guests,
  tableId: booking.tableId,
  tableNumber: booking.tableNumber,
  status: booking.status,
  specialRequests: booking.specialRequests,
  depositAmount: toNumber(booking.depositAmount),
  paymentStatus: booking.paymentStatus,
  stripePaymentIntentId: booking.stripePaymentIntentId,
  customerId: booking.customerId,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});

export const serializeOrderItem = (item: OrderItem) => ({
  id: item.id,
  orderId: item.orderId,
  menuItemId: item.menuItemId,
  quantity: item.quantity,
  unitPrice: toNumber(item.unitPrice),
  totalPrice: toNumber(item.totalPrice),
});

export const serializeOrder = (order: Order & { items?: OrderItem[] }) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  customerPhone: order.customerPhone,
  totalAmount: toNumber(order.totalAmount),
  status: order.status,
  stripePaymentIntentId: order.stripePaymentIntentId,
  customerId: order.customerId,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  items: order.items?.map(serializeOrderItem) ?? [],
});

export const serializeAsset = (asset: Asset) => ({
  id: asset.id,
  url: asset.url,
  key: asset.key,
  originalName: asset.originalName,
  mimeType: asset.mimeType,
  size: asset.size,
  uploadedById: asset.uploadedById,
  createdAt: asset.createdAt,
});
