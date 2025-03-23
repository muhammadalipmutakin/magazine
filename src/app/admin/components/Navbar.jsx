"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Panggil API logout untuk menghapus token dari cookie di server
      await fetch("/api/auth/login", { method: "DELETE" });

      // Hapus token dari cookie di sisi klien
      Cookies.remove("token");

      // Redirect ke halaman login
      router.replace("/admin");
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-black">
        Selamat Datang, Admin
      </h1>

      {/* Profile Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          disabled={isLoggingOut} // Disable button saat logout
        >
          <span>👤</span>
          <span className="text-black">Admin</span>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md py-2 border">
            <Link
              href="/admin/setting"
              className="block px-4 py-2 text-black hover:bg-gray-100"
            >
              ⚙️ Setting
            </Link>
            <button
              className={`block w-full text-left px-4 py-2 text-black hover:bg-gray-100 ${
                isLoggingOut ? "cursor-not-allowed" : ""
              }`}
              onClick={handleLogout}
              disabled={isLoggingOut} // Disable button saat logout
            >
              {isLoggingOut ? "Logging out..." : "🚪 Logout"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
