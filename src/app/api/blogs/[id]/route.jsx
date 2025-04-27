import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    // Cek apakah blog ada
    const existingBlog = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBlog) {
      return new Response(JSON.stringify({ error: "Blog tidak ditemukan." }), {
        status: 404,
      });
    }

    // Soft delete: Update `deletedAt` untuk menandakan penghapusan
    const deletedBlog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }, // Set `deletedAt` ke waktu saat ini
    });

    return Response.json(deletedBlog);
  } catch (error) {
    console.error("Error soft deleting blog:", error);

    // Menangani error tertentu jika ada (misalnya, foreign key constraint)
    if (error.code === "P2003") {
      return new Response(
        JSON.stringify({
          error: "Gagal menghapus blog karena masih ada data terkait.",
        }),
        {
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Gagal melakukan soft delete blog." }),
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const { isFeature } = await req.json();
    const updatedBlog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: { isFeature: isFeature },
    });
    return Response.json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return new Response(JSON.stringify({ error: "Gagal memperbarui blog." }), {
      status: 500,
    });
  }
}

export async function POST(req, { params }) {
  const { id } = params;
  try {
    // Cek apakah blog ada dan sudah dihapus
    const existingBlog = await prisma.blog.findUnique({
      where: { id: parseInt(id), deletedAt: { not: null } },
    });

    if (!existingBlog) {
      return new Response(
        JSON.stringify({ error: "Blog tidak ditemukan atau belum dihapus." }),
        {
          status: 404,
        }
      );
    }

    // Restore blog: Set `deletedAt` menjadi null
    const restoredBlog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: { deletedAt: null },
    });

    return Response.json(restoredBlog);
  } catch (error) {
    console.error("Error restoring blog:", error);
    return new Response(JSON.stringify({ error: "Gagal memulihkan blog." }), {
      status: 500,
    });
  }
}
