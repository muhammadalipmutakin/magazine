"use client"; // Harus ada karena ini kode untuk client-side

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login gagal");

      // Simpan token ke cookies
      Cookies.set("token", data.token, { expires: 1 }); // Token berlaku 1 hari

      // Redirect ke dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-blue-100 justify-center items-center">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8">
        <h2 className="text-center text-2xl font-bold text-black mb-2">
          Login Sebagai Admin
        </h2>
        <hr className="mb-3" />
        {error && (
          <p className="bg-red-500 text-center text-white p-4 my-4 border rounded-2xl text-xl">
            {error}
          </p>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="text-black text-lg block mb-2">Username</label>
            <input
              type="text"
              placeholder="Username"
              className="w-full rounded-2xl p-3 text-black border border-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="text-black text-lg block mb-2">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-2xl p-3 text-black border border-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full rounded-2xl ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            } mt-3 p-3 text-2xl text-white`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
