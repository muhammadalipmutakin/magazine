import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password harus diisi." },
        { status: 400 }
      );
    }

    // Cari user berdasarkan username
    const user = await prisma.author.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Username atau password salah." },
        { status: 401 }
      );
    }

    // Cek apakah akun aktif
    if (!user.isActive) {
      const whatsappLink = `https://wa.me/6285772918284?text=Halo admin, saya ${username} ingin mengaktifkan akun saya.`;
      return NextResponse.json(
        {
          message:
            "Akun Anda belum aktif. Silakan hubungi admin untuk aktivasi akun.",
          whatsappLink: whatsappLink,
        },
        { status: 403 } // Forbidden
      );
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Username atau password salah." },
        { status: 401 }
      );
    }

    // Generate token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Simpan token dalam cookie HTTP-Only dan data user di respons JSON
    const response = NextResponse.json(
      {
        message: "Login berhasil",
        user: {
          id: user.id,
          name: user.name,
          profesi: user.profesi, // Sertakan profesi
          foto: user.foto,
        },
        token,
      },
      { status: 200 }
    );

    // Set cookie HTTP only
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60, // 1 hari
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error); // Log error di server
    return NextResponse.json(
      { message: "Terjadi kesalahan", error: error.message },
      { status: 500 }
    );
  }
}
