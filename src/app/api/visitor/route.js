// app/api/visitor/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST(req) {
  const prisma = new PrismaClient();
  try {
    const visitorData = await req.json();

    const existingVisitor = await prisma.visitor.findFirst({
      where: {
        ipAddress: visitorData.ipAddress,
      },
    });

    let result;

    if (existingVisitor) {
      // Tambahkan waktu akses baru ke array visitTime
      result = await prisma.visitor.update({
        where: {
          id: existingVisitor.id,
        },
        data: {
          visitTime: {
            push: new Date(),
          },
        },
      });
    } else {
      // Buat pengunjung baru dengan waktu akses awal dan createdAt
      result = await prisma.visitor.create({
        data: visitorData,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gagal menyimpan atau memperbarui data pengunjung:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
