import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Menggunakan req.nextUrl untuk mendapatkan query parameter
    const query = req.nextUrl.searchParams.get("query");

    if (!query) {
      return new Response(
        JSON.stringify({ message: "Search query is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const results = await prisma.blog.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              ...(prisma._clientVersion.includes("mysql") ||
              prisma._clientVersion.includes("postgres")
                ? { mode: "insensitive" }
                : {}),
            },
          },
          {
            content: {
              contains: query,
              ...(prisma._clientVersion.includes("mysql") ||
              prisma._clientVersion.includes("postgres")
                ? { mode: "insensitive" }
                : {}),
            },
          },
        ],
      },
      include: {
        category: true,
      },
    });

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error during search:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
