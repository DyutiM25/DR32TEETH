import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'mengjidhanush@gmail.com';
  
  console.log(`Connecting to database to promote ${adminEmail} to admin...`);
  
  try {
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'admin' },
      create: {
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isApproved: true,
        profileCompleted: true,
      },
    });

    console.log(`\nSUCCESS! User ${user.email} is now an ADMIN (ID: ${user.id})`);
    console.log(`You can now login at http://localhost:5173/login and access the Admin Dashboard.\n`);
  } catch (err) {
    console.error(`\nFAILED to seed admin: ${err.message}\n`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
