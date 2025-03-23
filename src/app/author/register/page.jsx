"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profesi, setProfesi] = useState("");
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak sama.");
      return;
    }

    if (!foto) {
      setError("Foto wajib diunggah.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    formData.append("profesi", profesi);
    formData.append("foto", foto);

    setLoading(true);

    try {
      setLoading(true); // Menonaktifkan tombol saat proses berlangsung

      const response = await fetch("/api/auth/register/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }

      alert("Registrasi berhasil!");
      router.push("/author"); // Redirect setelah sukses
    } catch (err) {
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false); // Pastikan tombol bisa diklik kembali setelah error atau sukses
    }
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  return (
    <div className="flex h-screen bg-gray-200 justify-center items-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 sm:p-8">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">
          Register Author
        </h2>
        <hr className="mb-4" />
        {error && (
          <p className="bg-red-500 text-white text-center p-2 rounded-md mb-4">
            {error}
          </p>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-gray-700 block mb-1">Nama</label>
            <input
              type="text"
              className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-700 block mb-1">Username</label>
            <input
              type="text"
              className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-700 block mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-700 block mb-1">Profesi</label>
            <input
              type="text"
              className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={profesi}
              onChange={(e) => setProfesi(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-700 block mb-1">Foto</label>
            <input
              type="file"
              className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleFileChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/author")}
            className="text-blue-500 hover:underline"
          >
            Sudah punya akun? Login sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
