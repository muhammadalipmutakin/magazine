import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { URLSearchParams } from "url";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const authorId = searchParams.get("authorId");
    const exclude = searchParams.get("exclude");
    const limit = searchParams.get("limit");
    const categoryId = searchParams.get("categoryId");

    console.log("Fetching blog posts with params:", {
      authorId,
      exclude,
      limit,
      categoryId,
    });

    if (!prisma.blog) {
      throw new Error("Prisma model 'Blog' not found. Check your schema.");
    }

    let posts;

    if (authorId && exclude && limit && categoryId) {
      posts = await prisma.blog.findMany({
        where: {
          authorId: parseInt(authorId),
          categoryId: parseInt(categoryId),
          NOT: {
            id: parseInt(exclude),
          },
        },
        include: {
          category: true,
          author: true,
        },
        take: parseInt(limit),
      });
    } else if (authorId && exclude && limit) {
      posts = await prisma.blog.findMany({
        where: {
          authorId: parseInt(authorId),
          NOT: {
            id: parseInt(exclude),
          },
        },
        include: {
          category: true,
          author: true,
        },
        take: parseInt(limit),
      });
    } else if (categoryId) {
      posts = await prisma.blog.findMany({
        where: {
          categoryId: parseInt(categoryId),
        },
        include: {
          category: true,
          author: true,
        },
      });
    } else if (authorId) {
      posts = await prisma.blog.findMany({
        where: {
          authorId: parseInt(authorId),
        },
        include: {
          category: true,
          author: true,
        },
      });
    } else {
      posts = await prisma.blog.findMany({
        include: {
          category: true,
          author: true,
        },
      });
    }

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { message: "Failed to fetch blog posts", error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
