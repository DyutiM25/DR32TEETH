import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully to the database.');
  } catch (error) {
    console.error('Unable to connect to the database via Prisma:', error.message);
    process.exit(1);
  }
};

export { prisma };
export default connectDB;