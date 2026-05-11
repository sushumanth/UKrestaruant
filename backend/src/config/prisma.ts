// Keep the Prisma client boundary loose so the generated client can be resolved
// consistently across the editor and the build toolchain.
const prismaClientPackage: any = require('@prisma/client');

const globalForPrisma = globalThis as unknown as { prisma?: any };

export const prisma = globalForPrisma.prisma ?? new prismaClientPackage.PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
