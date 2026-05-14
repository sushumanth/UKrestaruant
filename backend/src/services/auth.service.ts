import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { serializeUser } from '../utils/serializers';
import type { AppUserRole } from '../types/app';

const staffRoles: AppUserRole[] = ['admin', 'employee'];

const buildTokenResponse = (user: { id: string; email: string; role: AppUserRole; firstName: string; lastName: string }) => ({
  token: signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  }),
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  },
});

export const registerUser = async (input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      passwordHash: await hashPassword(input.password),
      role: 'customer',
      isBlocked: false,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim(),
    },
  });

  return buildTokenResponse(user);
};

export const loginUser = async (input: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase().trim() } });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.isBlocked) {
    throw new AppError(403, 'This account is blocked');
  }

  return buildTokenResponse(user);
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return serializeUser(user);
};

export const createStaffMember = async (input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      passwordHash: await hashPassword(input.password),
      role: 'employee',
      isBlocked: false,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim(),
    },
  });

  return buildTokenResponse(user);
};

export const listStaffMembers = async () => {
  const staff = await prisma.user.findMany({
    where: { role: { in: staffRoles } },
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
  });

  return staff.map(serializeUser);
};

export const updateStaffMember = async (staffId: string, input: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { id: staffId } });

  if (!existing || !staffRoles.includes(existing.role)) {
    throw new AppError(404, 'Staff member not found');
  }

  const updated = await prisma.user.update({
    where: { id: staffId },
    data: {
      email: input.email?.toLowerCase().trim(),
      passwordHash: input.password ? await hashPassword(input.password) : undefined,
      firstName: input.firstName?.trim(),
      lastName: input.lastName?.trim(),
      phone: input.phone === undefined ? undefined : input.phone.trim() || null,
    },
  });

  return serializeUser(updated);
};

export const setStaffBlockedState = async (staffId: string, isBlocked: boolean) => {
  const existing = await prisma.user.findUnique({ where: { id: staffId } });

  if (!existing || !staffRoles.includes(existing.role)) {
    throw new AppError(404, 'Staff member not found');
  }

  const updated = await prisma.user.update({
    where: { id: staffId },
    data: { isBlocked },
  });

  return serializeUser(updated);
};

export const deleteStaffMember = async (staffId: string) => {
  const existing = await prisma.user.findUnique({ where: { id: staffId } });

  if (!existing || !staffRoles.includes(existing.role)) {
    throw new AppError(404, 'Staff member not found');
  }

  await prisma.user.delete({ where: { id: staffId } });
};
