"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

const AuthorSettingPage = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.svg"); // Fallback default
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    profesi: "",
    foto: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromParams = searchParams.get("id");
  const fileInputRef = useRef(null);

  // Ambil logo dari Supabase Storage
  const fetchLogo = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage
        .from(storageBucket)
        .getPublicUrl("logo.svg");
      if (error) {
        console.error("Error fetching logo:", error);
      } else {
        setLogoUrl(data.publicUrl);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  }, [supabase, storageBucket]);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  const fetchUserData = useCallback(async () => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/author");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const loggedInUserId = parsedUser.id;

      if (parseInt(userIdFromParams) !== loggedInUserId) {
        alert("Anda tidak memiliki izin untuk mengakses halaman ini.");
        router.push("/author/posting");
        return;
      }

      const response = await fetch(`/api/auth/${loggedInUserId}`);
      if (!response.ok) throw new Error("Gagal mengambil data pengguna.");

      const data = await response.json();
      setUser(data);
      setFormData({
        name: data.name,
        username: data.username,
        profesi: data.profesi,
        foto: data.foto,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert("Terjadi kesalahan saat mengambil data pengguna.");
      router.push("/author/posting");
    } finally {
      setLoading(false);
    }
  }, [router, userIdFromParams]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      alert("Password saat ini wajib diisi.");
      return;
    }

    if (
      showPasswordFields &&
      formData.newPassword !== formData.confirmPassword
    ) {
      alert("Kata sandi baru dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsUpdating(true); // Mulai loading

    try {
      const response = await fetch(`/api/auth/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          newPassword: showPasswordFields ? formData.newPassword : undefined,
        }),
      });

      if (response.ok) {
        alert("Pengaturan berhasil disimpan.");

        // Kosongkan input password
        setFormData((prevData) => ({
          ...prevData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));

        // Update data user di localStorage
        localStorage.setItem("user", JSON.stringify({ ...user, ...formData }));

        // Redirect ke halaman /author/posting
        router.push("/author/posting");
      } else if (response.status === 401) {
        alert("Password saat ini salah.");
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setIsUpdating(false); // Selesai loading
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/author/");
  };

  if (loading) {
    return <p className="text-center text-lg font-bold">Memuat...</p>;
  }

  return (
    <div className="w-screen overflow-x-hidden">
      <section className="max-w-[1130px] mx-auto flex flex-col gap-[30px] mt-[70px] px-4 md:px-0">
        {/* Navbar */}
        <nav className="flex justify-between w-full">
          <div className="flex items-center gap-6">
            <Link href="/author/posting">
              <Image
                src={logoUrl}
                alt="logo"
                width={100}
                height={100}
                className="w-24 h-24 md:w-32 md:h-32"
              />
            </Link>
            <div className="h-12 border border-[#E8EBF4] hidden md:block"></div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="rounded-full px-5 py-3 flex items-center gap-2 font-bold transition-all duration-300 bg-[#FF6B18] text-white hover:shadow-[0_10px_20px_0_#FF6B1880]"
            >
              <LogOut size={24} />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Judul Halaman */}
        <div className="flex justify-center items-center gap-5">
          <h1 className="text-4xl font-bold">Pengaturan</h1>
          <h1 className="text-4xl font-bold">/</h1>
        </div>

        {/* Form Pengaturan */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-full md:w-2/3 lg:w-1/2 mx-auto px-4 md:px-0"
        >
          {/* Foto Profil */}
          <div className="flex flex-col items-center gap-6">
            <div
              className="w-40 h-40 rounded-full overflow-hidden cursor-pointer shadow-lg"
              onClick={() => fileInputRef.current.click()}
            >
              <Image
                src={formData.foto || "/default-avatar.png"}
                alt="Foto Profil"
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <p className="text-sm text-gray-500">Klik foto untuk mengubah</p>
          </div>

          {/* Nama */}
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 font-semibold">
              Nama:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border p-3 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Profesi */}
          <div className="flex flex-col">
            <label htmlFor="profesi" className="mb-1 font-semibold">
              Profesi:
            </label>
            <input
              type="text"
              id="profesi"
              name="profesi"
              value={formData.profesi}
              onChange={handleChange}
              className="border p-3 rounded-md focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Password Saat Ini */}
          <div className="flex flex-col">
            <label htmlFor="currentPassword" className="mb-1 font-semibold">
              Password Saat Ini:
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="border p-3 rounded-md focus:ring focus:ring-blue-200"
              required
            />
          </div>

          {/* Checkbox Ubah Password */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="changePassword"
              checked={showPasswordFields}
              onChange={() => setShowPasswordFields(!showPasswordFields)}
            />
            <label htmlFor="changePassword" className="font-semibold">
              Ubah Password
            </label>
          </div>

          {/* Form Password Baru (Tampil jika checkbox dicentang) */}
          {showPasswordFields && (
            <>
              <div className="flex flex-col">
                <label htmlFor="newPassword" className="mb-1 font-semibold">
                  Password Baru:
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="border p-3 rounded-md focus:ring focus:ring-blue-200"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="mb-1 font-semibold">
                  Konfirmasi Password:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border p-3 rounded-md focus:ring focus:ring-blue-200"
                />
              </div>
            </>
          )}

          {/* Tombol Simpan */}
          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors duration-300 flex justify-center items-center"
            disabled={isUpdating}
          >
            {isUpdating ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AuthorSettingPage;
