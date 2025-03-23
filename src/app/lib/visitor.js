// lib/visitor.js
import { PrismaClient } from "@prisma/client";

export async function createOrUpdateVisitor(visitorData) {
  const prisma = new PrismaClient(); // Buat instance Prisma di sini
  try {
    const existingVisitor = await prisma.visitor.findFirst({
      where: {
        ipAddress: visitorData.ipAddress,
      },
    });

    if (existingVisitor) {
      // Tambahkan waktu akses baru ke array visitTime
      const updatedVisitor = await prisma.visitor.update({
        where: {
          id: existingVisitor.id,
        },
        data: {
          visitTime: {
            push: new Date(),
          },
        },
      });
      return updatedVisitor;
    } else {
      // Buat pengunjung baru dengan waktu akses awal dan createdAt
      const newVisitor = await prisma.visitor.create({
        data: visitorData,
      });
      return newVisitor;
    }
  } catch (error) {
    console.error("Gagal menyimpan atau memperbarui data pengunjung:", error);
    return null;
  } finally {
    await prisma.$disconnect(); // Penting untuk menutup koneksi Prisma
  }
}
