import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Ambil parameter dari URL
    const { searchParams } = new URL(req.url);
    const best = searchParams.get("best");

    let authors;

    if (best === "true") {
      // Ambil 6 author dengan jumlah blog terbanyak
      authors = await prisma.author.findMany({
        where: { deletedAt: null },
        orderBy: {
          blogs: { _count: "desc" },
        },
        take: 6,
        select: {
          id: true,
          name: true,
          profesi: true,
          foto: true,
          blogs: {
            select: { id: true },
          },
        },
      });
    } else {
      // Ambil semua author yang belum dihapus
      authors = await prisma.author.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          profesi: true,
          foto: true,
          blogs: {
            select: { title: true },
          },
        },
      });
    }

    // Format agar blogs menjadi string dengan pemisah ", "
    const formattedAuthors = authors.map((author) => ({
      ...author,
      blogs:
        author.blogs.length > 0
          ? author.blogs.map((b) => b.title).join(", ")
          : "Belum ada blog",
      blogCount: author.blogs.length, // Tambahkan jumlah blog jika best=true
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
