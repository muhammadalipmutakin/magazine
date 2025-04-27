// app/api/penulis/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  const { id } = await params;
  const { isActive, deletedAt } = await req.json(); // Expecting deletedAt in the body

  try {
    const updatedAuthor = await prisma.author.update({
      where: { id: parseInt(id) },
      data: { isActive, deletedAt },
    });
    return NextResponse.json(updatedAuthor);
  } catch (error) {
    console.error("Error updating author status:", error);
    return NextResponse.json(
      { error: "Failed to update author status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  try {
    const deletedAuthor = await prisma.author.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json(deletedAuthor);
  } catch (error) {
    console.error("Error deleting author:", error);
    return NextResponse.json(
      { error: "Failed to delete author" },
      { status: 500 }
    );
  }
}
