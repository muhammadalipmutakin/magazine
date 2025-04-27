import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * GET - Ambil data kategori berdasarkan ID
 */
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hanya kembalikan data kategori, tanpa path gambar
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data kategori" },
      { status: 500 }
    );
  }
}

/**
 * POST - Tambah kategori baru
 */
export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const file = formData.get("icon");

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Nama kategori tidak boleh kosong." },
        { status: 400 }
      );
    }

    let iconUrlToSave = null; // URL lengkap untuk disimpan di database

    if (file && typeof file === "object") {
      const fileName = `<span class="math-inline">\{Date\.now\(\)\}\-</span>{file.name}`;
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

      iconUrlToSave = `<span class="math-inline">\{supabaseUrl\}/storage/v1/object/public/</span>{storageBucket}/${filePath}`; // URL lengkap
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

/**
 * PUT - Update kategori berdasarkan ID
 */
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const file = formData.get("icon");

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    let updateData = {}; // Objek untuk menyimpan data yang akan diupdate

    if (name?.trim()) {
      updateData.name = name;
    }

    if (file && typeof file === "object") {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `icon_category/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: true }); // Menggunakan upsert: true

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        return NextResponse.json(
          { message: "Gagal mengunggah ikon ke Supabase" },
          { status: 500 }
        );
      }

      updateData.icon = `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${filePath}`; // Menyimpan URL lengkap
    }

    // Hanya update jika ada data yang perlu diubah
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang diubah." },
        { status: 200 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengupdate kategori" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Hapus kategori berdasarkan ID (soft delete)
 */
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existingCategory.deletedAt) {
      return NextResponse.json(
        { message: "Kategori sudah dihapus sebelumnya" },
        { status: 400 }
      );
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: "Kategori berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus kategori" },
      { status: 500 }
    );
  }
}
