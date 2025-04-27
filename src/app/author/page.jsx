"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [contactAdminLink, setContactAdminLink] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setContactAdminLink(""); // Reset contact admin link

    try {
      const response = await fetch("/api/auth/login_author", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.whatsappLink) {
          setError(data.message);
          setContactAdminLink(data.whatsappLink);
        } else {
          throw new Error(data.message || "Login gagal");
        }
      }

      if (response.ok && !data.user) {
        throw new Error("Data user tidak ditemukan");
      }

      // Simpan data user ke localStorage
      if (response.ok && data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            profesi: data.user.profesi,
            foto: data.user.foto,
          })
        );

        // Redirect ke halaman posting
        router.push("/author/posting");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 sm:p-8"
      >
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">
          Login Author
        </h2>
        <hr className="mb-4" />
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500 text-white text-center p-2 rounded-md mb-2"
          >
            <p>{error}</p>
            {contactAdminLink && (
              <a
                href={contactAdminLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-sm text-white underline"
              >
                Hubungi Admin
              </a>
            )}
          </motion.div>
        )}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="text-gray-700 font-semibold">Username</label>
            <input
              type="text"
              className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              aria-label="Masukkan username"
            />
          </div>

          <div>
            <label className="text-gray-700 font-semibold">Password</label>
            <input
              type="password"
              className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Masukkan password"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-amber-700 text-white rounded-md p-2 hover:bg-amber-800 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/author/register")}
            className="text-amber-700 border border-amber-700 w-full p-2 rounded-2xl mt-2 hover:bg-amber-700 hover:text-white font-semibold"
          >
            Belum punya akun? Daftar sekarang
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/admin/")}
            className="text-amber-700 hover:underline hover:scale-105 mt-3"
          >
            Login sebagai Admin
          </button>
        </div>
      </motion.div>
    </div>
  );
}
