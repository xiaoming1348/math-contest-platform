import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Upsert Organization
  const org = await prisma.organization.upsert({
    where: { name: "Berkeley Math Circle" },
    update: {},
    create: {
      name: "Berkeley Math Circle",
    },
  });

  console.log("Organization:", org);

  // 2. Create an admin user
  const adminEmail = "admin@berkeley-math.org";
  const plainPassword = "admin123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      hashedPassword,
      firstName: "Site",
      lastName: "Admin",
      role: "ADMIN",
      organizationId: org.id,
      createdByUserId: null,
    },
  });

  console.log("Admin user:", {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  });

  console.log("✅ Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
