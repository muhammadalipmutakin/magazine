import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  console.log("Middleware executed for:", pathname); // Debugging

  // Ambil token dari cookies
  const token = req.cookies.get("token")?.value;

  // Jika user BELUM login, hanya izinkan akses ke halaman /admin (login)
  if (!token && pathname !== "/admin") {
    console.log("No token found, redirecting to /admin...");
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Jika user SUDAH login dan tetap mengakses /admin (halaman login), arahkan ke dashboard
  if (token && pathname === "/admin") {
    console.log("User already logged in, redirecting to /admin/dashboard...");
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  console.log("Token found or accessing /admin, access granted");
  return NextResponse.next();
}

// Middleware hanya berjalan untuk halaman dalam `/admin`
export const config = {
  matcher: "/admin/:path*",
};
