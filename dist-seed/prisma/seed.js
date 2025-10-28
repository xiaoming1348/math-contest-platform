"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function main() {
    console.log("🌱 Seeding database...");
    // 1. Upsert Organization
    const org = await prisma_1.prisma.organization.upsert({
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
    const hashedPassword = await bcrypt_1.default.hash(plainPassword, 10);
    const adminUser = await prisma_1.prisma.user.upsert({
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
    await prisma_1.prisma.$disconnect();
})
    .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma_1.prisma.$disconnect();
    process.exit(1);
});
