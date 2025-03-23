import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// **GET**: Ambil data iklan berdasarkan ID
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const iklanId = Number(id);

    if (isNaN(iklanId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const iklan = await prisma.iklan.findUnique({
      where: { id: iklanId },
    });

    if (!iklan) {
      return NextResponse.json(
        { message: "Iklan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Mengambil URL publik untuk gambar iklan
    if (iklan.gambar) {
      const { data, error } = await supabase.storage
        .from(storageBucket)
        .getPublicUrl(iklan.gambar);
      if (error) {
        console.error(
          `Gagal mendapatkan URL publik untuk ${iklan.gambar}:`,
          error
        );
        iklan.gambar = null; // Jika gagal, atur gambar menjadi null
      } else {
        iklan.gambar = data.publicUrl;
      }
    }

    return NextResponse.json(iklan, { status: 200 });
  } catch (error) {
    console.error("Error fetching iklan:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data iklan" },
      { status: 500 }
    );
  }
}

// **PUT**: Update iklan
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const iklanId = Number(id);

    if (isNaN(iklanId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const formData = await req.formData();
    const judul = formData.get("judul");
    const gambar = formData.get("gambar");
    const jenis = formData.get("jenis");
    const link = formData.get("link");

    if (!judul || !jenis || !link) {
      return NextResponse.json(
        { message: "Data tidak boleh ada yang kosong." },
        { status: 400 }
      );
    }

    const existingIklan = await prisma.iklan.findUnique({
      where: { id: iklanId },
    });

    if (!existingIklan) {
      return NextResponse.json(
        { message: "Iklan tidak ditemukan" },
        { status: 404 }
      );
    }

    let gambarPath = existingIklan.gambar; // Gunakan gambar lama jika tidak ada yang baru

    if (gambar && typeof gambar === "object") {
      const fileName = `${Date.now()}-${gambar.name}`;
      gambarPath = `gambar_iklan/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(gambarPath, gambar, {
          cacheControl: "3600",
          upsert: true, // Menggunakan upsert: true untuk mengganti gambar yang ada
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        return NextResponse.json(
          { message: "Gagal mengunggah gambar ke Supabase" },
          { status: 500 }
        );
      }
    }

    const updatedIklan = await prisma.iklan.update({
      where: { id: iklanId },
      data: {
        judul,
        gambar: gambarPath,
        jenis,
        link,
      },
    });

    return NextResponse.json(updatedIklan, { status: 200 });
  } catch (error) {
    console.error("Error updating iklan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengupdate iklan" },
      { status: 500 }
    );
  }
}

// **DELETE**: Soft delete iklan
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const iklanId = Number(id);

    if (isNaN(iklanId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const existingIklan = await prisma.iklan.findUnique({
      where: { id: iklanId },
    });

    if (!existingIklan) {
      return NextResponse.json(
        { message: "Iklan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existingIklan.deletedAt) {
      return NextResponse.json(
        { message: "Iklan sudah dihapus sebelumnya" },
        { status: 400 }
      );
    }

    await prisma.iklan.update({
      where: { id: iklanId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: "Iklan berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting iklan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus iklan" },
      { status: 500 }
    );
  }
}
