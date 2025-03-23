"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import Link from "next/link";

export default function Iklan() {
  const [iklan, setIklan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 4;

  useEffect(() => {
    fetchIklan();
  }, []);

  const fetchIklan = async () => {
    try {
      const res = await fetch(`/api/iklan`);
      if (!res.ok) throw new Error("Gagal mengambil data Iklan");
      const data = await res.json();
      setIklan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Memfilter berdasarkan semua field (name, gambar, jenis, link)
  const filteredIklan = iklan.filter((iklan) => {
    const nameMatch =
      iklan.judul?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const gambarMatch =
      iklan.gambar?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const jenisMatch =
      iklan.jenis?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const linkMatch =
      iklan.link?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

    return nameMatch || gambarMatch || linkMatch || jenisMatch;
  });

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Data ini?")) return;
    try {
      const res = await fetch(`/api/iklan/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus Data");
      setIklan(iklan.filter((iklan) => iklan.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(filteredIklan.length / itemsPerPage);
  const paginatedData = filteredIklan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-black mb-4">Iklan ADS Page</h1>
      <p className="text-gray-700 mb-4">
        Selamat datang di halaman kelola Iklan.
      </p>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <Link
          href="/admin/iklan/iklanForm"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-2 md:mb-0"
        >
          <Plus size={20} className="mr-2" />
          Tambah Data
        </Link>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari Data..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-black text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm md:text-base"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      {loading && <p className="text-center text-gray-600">Memuat data...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
          {filteredIklan.length === 0 ? (
            <p className="text-center text-gray-600">Belum ada data</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 border-t border-b">
                  <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                    Judul
                  </th>
                  <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                    Gambar
                  </th>
                  <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                    Jenis
                  </th>
                  <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                    Link
                  </th>
                  <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((iklan) => (
                  <tr
                    key={iklan.id}
                    className="border-t border-b even:bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <td className="py-2 px-4 text-black text-sm md:text-base">
                      {iklan.judul}
                    </td>
                    <td className="py-2 px-4 text-black">
                      <img
                        src={iklan.gambar}
                        alt={iklan.judul}
                        className="w-12 h-12 md:w-16 md:h-16 object-cover"
                      />
                    </td>
                    <td className="py-2 px-4 text-black text-sm md:text-base">
                      {iklan.jenis}
                    </td>
                    <td className="py-2 px-4 text-black text-sm md:text-base">
                      <a
                        href={iklan.link}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        {iklan.link}
                      </a>
                    </td>
                    <td className="py-2 px-4 text-black flex space-x-2">
                      <Link href={`/admin/iklan/iklanForm?id=${iklan.id}`}>
                        <button className="text-blue-600 hover:text-blue-800 transition">
                          <Edit size={18} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(iklan.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {filteredIklan.length > 0 && (
        <div className="flex justify-center gap-x-7 items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={`px-4 py-2 rounded-lg text-sm md:text-base ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 transition"
            }`}
          >
            Prev
          </button>

          <span className="text-black text-sm md:text-base">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={`px-4 py-2 rounded-lg text-sm md:text-base ${
              currentPage >= totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 transition"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
}
