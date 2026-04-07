import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  console.log('Connected to database');

  const adminEmail = 'mengjidhanush@gmail.com';
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'admin' },
    create: {
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'Mengji',
      role: 'admin',
      isApproved: true,
      profileCompleted: true,
    },
  });

  console.log(`Admin user set: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
