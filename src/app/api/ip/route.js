// app/api/ip/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.ip
    ? req.ip
    : req.socket?.remoteAddress;
  return NextResponse.json({ ip });
}
