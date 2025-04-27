import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req, { params }) {
  const { id } = params;

  console.log("Fetching post with ID:", id);

  try {
    const post = await prisma.blog.findUnique({
      where: {
        id: parseInt(id),
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!post) {
      console.log("Post not found or deleted");
      return Response.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json(post);
  } catch (error) {
    console.error("Gagal mengambil postingan:", error);
    return Response.json(
      { error: "Gagal mengambil detail postingan." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const categoryId = formData.get("categoryId");
    const headlineFile = formData.get("headline");
    const isFeature = formData.get("isFeature") === "true";

    const existingPost = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return Response.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 }
      );
    }

    let headlineUrl = existingPost.headline;
    if (headlineFile) {
      const filename = `${uuidv4()}_${headlineFile.name.replace(/\s/g, "_")}`;
      const fileBuffer = await headlineFile.arrayBuffer();

      const { data, error } = await supabase.storage
        .from(storageBucket)
        .upload(`headlines/${filename}`, Buffer.from(fileBuffer), {
          contentType: headlineFile.type,
        });

      if (error) {
        console.error("Error uploading to Supabase:", error);
        return Response.json(
          { error: "Gagal mengunggah file ke Supabase." },
          { status: 500 }
        );
      }

      headlineUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageBucket}/headlines/${filename}`;
    }

    const updatedPost = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingPost.title,
        content: content || existingPost.content,
        headline: headlineUrl,
        isFeature: isFeature,
        categoryId: categoryId ? parseInt(categoryId) : existingPost.categoryId,
      },
    });

    return Response.json({
      message: "Postingan berhasil diperbarui",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Gagal memperbarui postingan:", error);
    return Response.json(
      { error: "Terjadi kesalahan saat memperbarui postingan." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  console.log("Soft deleting post with ID:", id);

  try {
    const existingPost = await prisma.blog.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return Response.json(
        { error: "Postingan tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedPost = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    return Response.json({
      message: "Postingan berhasil dihapus (soft delete)",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Gagal menghapus postingan:", error);
    return Response.json(
      { error: "Terjadi kesalahan saat menghapus postingan." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
