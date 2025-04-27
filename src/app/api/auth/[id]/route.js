import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// GET - Mengambil data author
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const authorId = Number(id);

    if (isNaN(authorId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    if (isNaN(authorId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        name: true,
        username: true,
        profesi: true,
        foto: true,
      },
    });

    if (!author) {
      return NextResponse.json(
        { message: "Author not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(author, { status: 200 });
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Mengupdate data author
export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const authorId = Number(id);

    if (isNaN(authorId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const {
      name,
      profesi,
      foto,
      currentPassword,
      newPassword,
      confirmPassword,
    } = await req.json();

    // Validasi: Password saat ini wajib diisi
    if (!currentPassword) {
      return NextResponse.json(
        { message: "Password saat ini wajib diisi." },
        { status: 400 }
      );
    }

    // Cari author di database
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { password: true },
    });

    if (!author) {
      return NextResponse.json(
        { message: "Author tidak ditemukan." },
        { status: 404 }
      );
    }

    // Validasi: Password saat ini harus benar
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      author.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Password saat ini salah." },
        { status: 401 }
      );
    }

    // Jika ada perubahan password, validasi password baru
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: "Password baru harus minimal 8 karakter." },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { message: "Password baru dan konfirmasi password tidak cocok." },
          { status: 400 }
        );
      }
    }

    // Data yang akan diupdate
    const updateData = {};
    if (name) updateData.name = name;
    if (profesi) updateData.profesi = profesi;
    if (foto) updateData.foto = foto;
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update data author
    const updatedAuthor = await prisma.author.update({
      where: { id: authorId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        profesi: true,
        foto: true,
      },
    });

    return NextResponse.json(updatedAuthor, { status: 200 });
  } catch (error) {
    console.error("Error updating author:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
// POST - Verifikasi password
export async function POST(req, context) {
  try {
    const { id } = context.params; // Ambil ID dari context.params
    const authorId = Number(id);

    if (isNaN(authorId)) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    const { password } = await req.json();

    // Validasi: Password wajib diisi
    if (!password) {
      return NextResponse.json(
        { message: "Password diperlukan." },
        { status: 400 }
      );
    }

    // Cari author di database
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { password: true },
    });

    if (!author) {
      return NextResponse.json(
        { message: "Author tidak ditemukan." },
        { status: 404 }
      );
    }

    // Validasi: Password harus benar
    const isMatch = await bcrypt.compare(password, author.password);
    const response = isMatch
      ? { message: "Password benar." }
      : { message: "Password salah." };

    return NextResponse.json(response, { status: isMatch ? 200 : 401 });
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
