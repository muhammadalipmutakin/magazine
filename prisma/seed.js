import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const hashedPassword1 = await bcrypt.hash("190919", 10);
  const hashedPassword2 = await bcrypt.hash("admin123", 10);

  const admins = [
    {
      nama: "Muhammad Alip Mutakin",
      username: "superadmin",
      password: hashedPassword1,
    },
    {
      nama: "Admin",
      username: "admin",
      password: hashedPassword2,
    },
  ];

  for (const admin of admins) {
    // Cek apakah username sudah ada
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: admin.username },
    });

    if (!existingAdmin) {
      await prisma.admin.create({ data: admin });
      console.log(`✅ Admin ${admin.username} created successfully`);
    } else {
      console.log(`⚠️ Admin ${admin.username} already exists`);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
