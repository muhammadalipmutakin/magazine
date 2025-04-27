// app/api/penulis/route.js (atau sesuai struktur Next.js Anda)
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Ambil parameter dari URL
    const { searchParams } = new URL(req.url);
    const deleted = searchParams.get("deleted");
    const deletedFilter =
      deleted === "true" ? { deletedAt: { not: null } } : { deletedAt: null };

    // Ambil semua author yang sesuai dengan filter deleted
    const authors = await prisma.author.findMany({
      where: { ...deletedFilter },
      select: {
        id: true,
        name: true,
        profesi: true,
        foto: true,
        isActive: true,
        blogs: {
          select: { title: true },
        },
      },
    });

    // Format agar blogs menjadi string dengan pemisah ", "
    const formattedAuthors = authors.map((author) => ({
      ...author,
      blogs:
        author.blogs.length > 0
          ? author.blogs.map((b) => b.title).join(", ")
          : "Belum ada blog",
    }));

    return NextResponse.json(formattedAuthors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
