import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  // Await the params object before accessing its properties
  const { id } = await params;
  const authorId = parseInt(id);

  if (isNaN(authorId)) {
    return Response.json({ message: "Invalid author ID" }, { status: 400 });
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: {
        blogs: {
          include: { category: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!author) {
      return Response.json({ message: "Author not found" }, { status: 404 });
    }

    return Response.json(author);
  } catch (error) {
    console.error("Error fetching author data:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
