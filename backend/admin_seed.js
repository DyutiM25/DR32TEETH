import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmails = [
    'mengjidhanush@gmail.com',
    'mengjidyuti.us@gmail.com',
  ];

  try {
    for (const adminEmail of adminEmails) {
      console.log(`Connecting to database to promote ${adminEmail} to admin...`);

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

      console.log(`SUCCESS! User ${user.email} is now an ADMIN (ID: ${user.id})`);
    }

    console.log('\nAll admin users have been processed.\n');
  } catch (err) {
    console.error(`\nFAILED to seed admin: ${err.message}\n`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
