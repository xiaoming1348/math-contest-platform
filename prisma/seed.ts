import { prisma } from "../src/lib/db/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

function generateRandomPassword(length = 24) {
  // hex yields 2 chars per byte — ensure length requested
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

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
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@berkeley-math.org";

  // Password handling: Prefer SEED_ADMIN_PASSWORD via env. If missing, generate a secure random
  // password and print it to stdout so the operator can record it. Avoid committing plaintext.
  const providedPassword = process.env.SEED_ADMIN_PASSWORD;
  const plainPassword = providedPassword ?? generateRandomPassword(24);
  if (!providedPassword) {
    console.warn(
      "No SEED_ADMIN_PASSWORD provided — generated a random admin password. Save it because it will NOT be committed."
    );
    console.log("Generated admin password:", plainPassword);
  }

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
