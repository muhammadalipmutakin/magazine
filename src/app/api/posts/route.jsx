import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
  console.log("Menerima permintaan POST");

  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const categoryId = formData.get("categoryId");
    const authorId = formData.get("authorId");
    const headlineFile = formData.get("headline");
    const isFeature = formData.get("isFeature") === "true";

    if (!title || !content || !categoryId || !authorId || !headlineFile) {
      return Response.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Generate unique filename using UUID
    const fileExtension = headlineFile.name.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const fileBuffer = await headlineFile.arrayBuffer();

    // Upload file ke Supabase Storage
    const { data, error } = await supabase.storage
      .from(storageBucket)
      .upload(`headlines/${uniqueFilename}`, Buffer.from(fileBuffer), {
        contentType: headlineFile.type,
      });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return Response.json(
        { error: "Gagal mengunggah file ke Supabase." },
        { status: 500 }
      );
    }

    const headlineUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageBucket}/headlines/${uniqueFilename}`;

    console.log("URL file headline Supabase:", headlineUrl);

    const newPost = await prisma.blog.create({
      data: {
        title,
        content,
        headline: headlineUrl,
        isFeature: isFeature,
        categoryId: parseInt(categoryId),
        authorId: parseInt(authorId),
      },
    });

    return Response.json(
      { message: "Postingan berhasil disimpan", post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    return Response.json(
      { error: "Terjadi kesalahan saat memproses permintaan." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
