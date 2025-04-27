import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        author: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { message: "Failed to fetch blog" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
