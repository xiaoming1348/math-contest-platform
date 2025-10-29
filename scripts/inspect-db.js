const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const orgs = await prisma.organization.findMany();
    console.log('Organizations:', orgs.length, orgs.map(o => o.name));

    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    users.forEach(u => {
      console.log({ email: u.email, role: u.role, hashedStartsWith2b: u.hashedPassword.startsWith('$2b$') });
    });
  } catch (e) {
    console.error('DB check failed:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
