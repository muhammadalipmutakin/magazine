import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Konfigurasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// **GET**: Ambil semua kategori dari database
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// **POST**: Tambah kategori baru
export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const file = formData.get("icon");

    let iconUrlToSave = null; // URL lengkap untuk disimpan di database

    if (file && typeof file === "object") {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `icon_category/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        return NextResponse.json(
          {
            message: "Gagal mengunggah ikon ke Supabase",
            error: uploadError.message,
          },
          { status: 500 }
        );
      }

      iconUrlToSave = `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${filePath}`; // URL lengkap
    }

    const newCategory = await prisma.category.create({
      data: { name, icon: iconUrlToSave },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
