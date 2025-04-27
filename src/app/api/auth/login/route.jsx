import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Cari user di database
    const user = await prisma.admin.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Cocokkan password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Simpan token dalam cookie
    const response = NextResponse.json(
      { message: "Login berhasil", token },
      { status: 200 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600, // 1 jam
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // Verifikasi token
    const userData = jwt.verify(token, SECRET_KEY);
    if (!userData) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Authorized", user: userData },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { message: "Logout berhasil" },
    { status: 200 }
  );
  response.cookies.set("token", "", { maxAge: 0, path: "/" });

  return response;
}
