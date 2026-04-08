import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const p = new PrismaClient();
try {
  await p.$connect();
  console.log('DB OK');
  const count = await p.user.count();
  console.log('User count:', count);
  await p.$disconnect();
} catch(e) {
  console.log('DB FAIL:', e.message);
  process.exit(1);
}
