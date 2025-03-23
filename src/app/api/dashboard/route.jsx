import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [categoryCount, blogCount, authorCount, iklanCount, visitorCount] =
      await Promise.all([
        prisma.category.count({ where: { deletedAt: null } }),
        prisma.blog.count({ where: { deletedAt: null } }),
        prisma.author.count({ where: { deletedAt: null } }),
        prisma.iklan.count({ where: { deletedAt: null } }),
        prisma.visitor.count({ where: { deletedAt: null } }),
      ]);

    console.log("Dashboard Data:", {
      category: categoryCount,
      blog: blogCount,
      author: authorCount,
      iklan: iklanCount,
      visitor: visitorCount,
    });

    return NextResponse.json(
      {
        category: categoryCount,
        blog: blogCount,
        author: authorCount,
        iklan: iklanCount,
        visitor: visitorCount,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
