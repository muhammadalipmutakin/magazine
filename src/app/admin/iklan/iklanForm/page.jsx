"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "../../components/Layout";

// Komponen utama dengan Suspense
export default function IklanForm() {
  const searchParams = useSearchParams();
  const iklanId = searchParams.get("id");
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [gambar, setGambar] = useState(null);
  const [jenis, setJenis] = useState("persegi"); // default 'persegi'
  const [link, setLink] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!iklanId) return;

    fetch(`/api/iklan/${iklanId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: Gagal mengambil data iklan`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.judul) {
          setJudul(data.judul);
          setJenis(data.jenis);
          setLink(data.link);
          setPreview(data.gambar);
        } else {
          console.error("Data iklan tidak valid:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [iklanId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Harap unggah file gambar!");
        return;
      }
      setGambar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!judul || !jenis || !link) {
      alert("Data harus diisi lengkap.");
      return;
    }

    const formData = new FormData();
    formData.append("judul", judul);
    formData.append("jenis", jenis);
    formData.append("link", link);
    if (gambar) formData.append("gambar", gambar);

    const method = iklanId ? "PUT" : "POST";
    const url = iklanId ? `/api/iklan/${iklanId}` : "/api/iklan";

    try {
      setLoading(true);
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal menyimpan data");

      alert("Data berhasil disimpan");
      router.push("/admin/iklan");
    } catch (error) {
      console.error("Error", error);
      alert("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="mx-auto bg-white shadow-md rounded-lg text-black w-full max-w-lg sm:max-w-md">
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {iklanId ? "Edit Iklan" : "Tambah Iklan"}
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Judul :
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md text-sm sm:text-base"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Gambar Iklan:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border rounded-md text-sm sm:text-base"
                  onChange={handleImageChange}
                />
              </div>

              {preview && (
                <div className="mt-4">
                  <p className="text-gray-600 text-sm sm:text-base">Preview:</p>
                  <img
                    src={preview}
                    alt="Icon Preview"
                    className="w-24 h-auto object-cover border rounded-md"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Jenis Iklan :
                </label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm sm:text-base"
                  required
                >
                  <option value="persegi">Persegi</option>
                  <option value="persegi panjang">Persegi Panjang</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  Link :
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md text-sm sm:text-base"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                />
              </div>

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
      </Suspense>
    </Layout>
  );
}
