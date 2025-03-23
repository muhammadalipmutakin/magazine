import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Fetch categories with their associated blog count and recent blog details
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null, // Exclude soft-deleted categories
      },
      include: {
        _count: {
          select: { blogs: true }, // Count blogs in each category
        },
        blogs: {
          where: {
            deletedAt: null, // Exclude soft-deleted blogs
          },
          orderBy: {
            createdAt: "desc", // Sort blogs by createdAt (most recent first)
          },
          take: 6, // Limit the number of blogs fetched per category
          select: {
            id: true,
            headline: true,
            title: true,
            content: true,
            isFeature: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true, // Assuming the Author model has a 'name' field
              },
            },
          },
        },
      },
    });

    // Return the categories with the blog count and blog details
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching categories with blogs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories with blogs." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}
