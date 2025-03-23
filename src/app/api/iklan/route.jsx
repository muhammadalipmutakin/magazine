import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET: Fetch all iklan data
export async function GET(req) {
  try {
    const iklan = await prisma.iklan.findMany({
      where: { deletedAt: null },
    });

    // Mengambil URL publik untuk setiap iklan
    const iklanDenganUrl = await Promise.all(
      iklan.map(async (item) => {
        if (item.gambar) {
          const { data, error } = await supabase.storage
            .from(storageBucket)
            .getPublicUrl(item.gambar);
          if (error) {
            console.error(
              `Gagal mendapatkan URL publik untuk ${item.gambar}:`,
              error
            );
            return { ...item, gambar: null }; // Jika gagal, atur gambar menjadi null
          }
          return { ...item, gambar: data.publicUrl };
        }
        return item; // Jika gambar null, kembalikan item tanpa perubahan
      })
    );

    return NextResponse.json(iklanDenganUrl, { status: 200 });
  } catch (error) {
    console.error("Error fetching iklan: ", error);
    return NextResponse.json(
      { message: "Terjadi error pada server" },
      { status: 500 }
    );
  }
}

// POST: Add new iklan data
export async function POST(req) {
  try {
    const formData = await req.formData();
    const judul = formData.get("judul");
    const gambar = formData.get("gambar");
    const jenis = formData.get("jenis");
    const link = formData.get("link");

    let filePath = null;
    // Check if the file is valid
    if (gambar && typeof gambar === "object") {
      const fileName = `${Date.now()}-${gambar.name}`;
      filePath = `gambar_iklan/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, gambar, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        return NextResponse.json(
          {
            message: "Gagal mengunggah gambar ke Supabase",
            error: uploadError.message,
          },
          { status: 500 }
        );
      }
    }

    // Create a new iklan record in the database
    const newIklan = await prisma.iklan.create({
      data: { judul, gambar: filePath, jenis, link },
    });

    return NextResponse.json(newIklan, {
      status: 200,
    });
  } catch (error) {
    console.error("Error creating Iklan: ", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
