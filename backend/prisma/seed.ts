import { Prisma, PrismaClient, UserRole, TableStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const adminAccount = {
  email: 'admin@gmail.com',
  password: 'admin@123',
  firstName: 'Main',
  lastName: 'Admin',
};

const initialTables = [
  { tableNumber: 1, capacity: 2, status: TableStatus.available },
  { tableNumber: 2, capacity: 2, status: TableStatus.available },
  { tableNumber: 3, capacity: 4, status: TableStatus.available },
  { tableNumber: 4, capacity: 4, status: TableStatus.available },
  { tableNumber: 5, capacity: 6, status: TableStatus.available },
  { tableNumber: 6, capacity: 6, status: TableStatus.available },
];

const initialMenuItems = [
  {
    name: 'Paneer Tikka',
    description: 'Char-grilled paneer with spices and herbs.',
    price: 9.5,
    category: 'starters' as Prisma.MenuItemCreateManyInput['category'],
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8',
    rating: 4.8,
    prepTime: 18,
    isVeg: true,
    tags: ['grill', 'signature'],
    sortOrder: 1,
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice with marinated chicken.',
    price: 14.25,
    category: 'biryani' as Prisma.MenuItemCreateManyInput['category'],
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d8f5',
    rating: 4.9,
    prepTime: 30,
    isVeg: false,
    tags: ['best-seller'],
    sortOrder: 2,
  },
  {
    name: 'Garlic Naan',
    description: 'Soft flatbread brushed with garlic butter.',
    price: 3.75,
    category: 'bread' as Prisma.MenuItemCreateManyInput['category'],
    imageUrl: 'https://images.unsplash.com/photo-1574653853027-5382a3d6d3b0',
    rating: 4.7,
    prepTime: 12,
    isVeg: true,
    tags: ['bread'],
    sortOrder: 3,
  },
];

async function main() {
  const settings = await prisma.restaurantSettings.findFirst();

  if (!settings) {
    await prisma.restaurantSettings.create({
      data: {
        name: 'UK Restaurant',
        address: '1 Example Street, London, UK',
        phone: '+44 20 0000 0000',
        email: 'hello@ukrestaurant.example',
        openingTime: '10:00',
        closingTime: '22:00',
        timeSlotInterval: 30,
        defaultDepositAmount: 20,
        cancellationDeadlineHours: 24,
        autoReleaseMinutes: 15,
      },
    });
  }

  const tableCount = await prisma.restaurantTable.count();
  if (tableCount === 0) {
    await prisma.restaurantTable.createMany({ data: initialTables });
  }

  const menuCount = await prisma.menuItem.count();
  if (menuCount === 0) {
    await prisma.menuItem.createMany({ data: initialMenuItems });
  }

  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || adminAccount.email).toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || adminAccount.password;
  const adminFirstName = process.env.INITIAL_ADMIN_FIRST_NAME || adminAccount.firstName;
  const adminLastName = process.env.INITIAL_ADMIN_LAST_NAME || adminAccount.lastName;

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.admin,
      firstName: adminFirstName,
      lastName: adminLastName,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.admin,
      firstName: adminFirstName,
      lastName: adminLastName,
    },
  });

  const bookingCount = await prisma.booking.count();
  if (bookingCount === 0) {
    const table = await prisma.restaurantTable.findFirst();
    if (table) {
      const bookingStart = new Date();
      bookingStart.setHours(19, 0, 0, 0);
      const durationMinutes = 90;
      const bookingEnd = new Date(bookingStart.getTime() + durationMinutes * 60 * 1000);
      const releaseTime = new Date(bookingEnd.getTime() + 15 * 60 * 1000);

      await prisma.booking.create({
        data: {
          bookingCode: 'BK-DEMO-001',
          customerName: 'Demo Customer',
          customerEmail: 'customer@example.com',
          customerPhone: '+44 7000 000000',
          bookingDate: new Date(),
          bookingStart,
          bookingEnd,
          releaseTime,
          durationMinutes,
          guests: 2,
          tableId: table.id,
          tableNumber: table.tableNumber,
          status: BookingStatus.confirmed,
          specialRequests: 'Window seat if possible',
          depositAmount: 20,
          paymentStatus: PaymentStatus.paid,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
