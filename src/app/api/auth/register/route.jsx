import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Konfigurasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET; // Ambil nama bucket dari env
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const profesi = formData.get("profesi");
    const foto = formData.get("foto");

    // Validasi apakah semua field telah diisi
    if (
      !name ||
      !username ||
      !password ||
      !confirmPassword ||
      !profesi ||
      !foto
    ) {
      console.log("Error: Semua kolom harus diisi.");
      return NextResponse.json(
        { message: "Semua kolom harus diisi." },
        { status: 400 }
      );
    }

    // Validasi panjang minimal 6 karakter untuk semua field kecuali foto
    if (
      name.length < 6 ||
      username.length < 6 ||
      password.length < 6 ||
      confirmPassword.length < 6 ||
      profesi.length < 6
    ) {
      console.log("Error: Semua inputan harus memiliki minimal 6 karakter.");
      return NextResponse.json(
        { message: "Semua inputan harus memiliki minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      console.log("Error: Username harus berupa email yang valid.");
      return NextResponse.json(
        { message: "Username harus berupa email yang valid." },
        { status: 400 }
      );
    }

    // Validasi kecocokan password
    if (password !== confirmPassword) {
      console.log("Error: Password dan konfirmasi password tidak sama.");
      return NextResponse.json(
        { message: "Password dan konfirmasi password tidak sama." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload foto ke Supabase Storage
    if (foto) {
      // Tambahkan pengecekan ini
      const fileName = `${Date.now()}-${foto.name}`;
      const filePath = `foto_authors/${fileName}`; // Path folder di bucket

      const { error: uploadError } = await supabase.storage
        .from(storageBucket) // Gunakan nama bucket dari env
        .upload(filePath, foto, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        return NextResponse.json(
          {
            message: "Gagal mengunggah foto ke Supabase",
            error: uploadError.message,
          },
          { status: 500 }
        );
      }

      // Dapatkan URL publik dari gambar yang diunggah
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from(storageBucket) // Gunakan nama bucket dari env
        .getPublicUrl(filePath);

      if (publicUrlError || !publicUrlData) {
        console.error("Public URL Error:", publicUrlError);
        console.error("Public URL Data:", publicUrlData);
        return NextResponse.json(
          {
            message: "Gagal mendapatkan URL publik foto",
            error: publicUrlError?.message || "URL tidak ditemukan",
          },
          { status: 500 }
        );
      }

      const fotoUrl = publicUrlData.publicUrl;

      // Simpan data user ke database dengan URL gambar dari Supabase
      const newUser = await prisma.author.create({
        data: {
          name,
          username,
          password: hashedPassword,
          profesi,
          foto: fotoUrl, // Simpan URL foto
        },
      });

      return NextResponse.json(
        { message: "Registrasi berhasil", user: newUser },
        { status: 201 }
      );
    } else {
      console.error("Error: Foto tidak terdefinisi.");
      return NextResponse.json(
        { message: "Foto harus diunggah." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("General Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan di server", error: error.message },
      { status: 500 }
    );
  }
}
