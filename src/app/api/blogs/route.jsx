import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Function to handle GET requests
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const searchQuery = searchParams.get("search") || "";
    const showDeleted = searchParams.get("showDeleted") === "true";

    // Define where clause for filtering
    const whereClause = {
      title: {
        contains: searchQuery,
        // Use `mode: 'insensitive'` if your database is configured for case-insensitive collation
        // Otherwise, you might need to adjust based on your database setup.
      },
      // If `showDeleted` is true, show blogs with `deletedAt` not null
      deletedAt: showDeleted ? { not: null } : null,
    };

    // If `userId` is provided, filter by user ID
    if (userId) {
      whereClause.authorId = parseInt(userId);
    }

    // Fetch blogs from the database with the specified filters
    const blogs = await prisma.blog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        headline: true,
        title: true,
        content: true,
        createdAt: true,
        isFeature: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            foto: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(blogs), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return new Response(
      JSON.stringify({
        error: "Gagal mengambil data blog.",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
