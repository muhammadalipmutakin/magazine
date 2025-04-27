"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";

export default function CategoryForm() {
  const router = useRouter();

  const [searchParams, setSearchParams] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    setCategoryId(params.get("id"));
  }, []);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    fetch(`/api/categories/${categoryId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: Gagal mengambil data kategori`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.name) {
          setName(data.name);
          setPreview(data.icon);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [categoryId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Harap unggah file gambar!");
        return;
      }
      setIcon(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama kategori tidak boleh kosong.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (icon) formData.append("icon", icon);

    const method = categoryId ? "PUT" : "POST";
    const url = categoryId
      ? `/api/categories/${categoryId}`
      : "/api/categories";

    try {
      setLoading(true);
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal menyimpan data");

      alert("Kategori berhasil disimpan!");
      router.push("/admin/category");
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!searchParams) return null; // Ensure the component renders after searchParams is available

  return (
    <Layout>
      <div className="mx-auto bg-white shadow-md rounded-lg text-black w-full max-w-lg sm:max-w-md">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            {categoryId ? "Edit Kategori" : "Tambah Kategori"}
          </h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Nama Kategori:
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md text-sm sm:text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Ikon Kategori:
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border rounded-md text-sm sm:text-base"
                onChange={handleFileChange}
              />
            </div>

            {preview && (
              <div className="mt-4">
                <p className="text-gray-600 text-sm sm:text-base">Preview:</p>
                <img
                  src={preview}
                  alt="Icon Preview"
                  className="w-24 h-24 object-cover border rounded-md"
                />
              </div>
            )}

            <button
              type="submit"
              className={`mt-4 w-full py-2 text-white rounded-md text-sm sm:text-base ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
