"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import Link from "next/link";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 4;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories`);
      if (!res.ok) throw new Error("Gagal mengambil data kategori");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus kategori");
      setCategories(categories.filter((category) => category.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedData = filteredCategories.slice(
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
      <h1 className="text-2xl font-bold text-black mb-4">Category</h1>
      <p className="text-gray-700 mb-4">Selamat datang di halaman Category.</p>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <Link
          href="/admin/category/categoryForm"
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-2 sm:mb-0"
        >
          <Plus size={20} className="mr-2" />
          Tambah Data
        </Link>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-black text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>

      {loading && <p className="text-center text-gray-600">Memuat data...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
          {filteredCategories.length === 0 ? (
            <p className="text-center text-gray-600">Belum ada data</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 border-t border-b">
                  <th className="py-2 px-4 text-left text-black">
                    Nama Category
                  </th>
                  <th className="py-2 px-4 text-left text-black">Icon</th>
                  <th className="py-2 px-4 text-left text-black">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-b even:bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <td className="py-2 px-4 text-black">{category.name}</td>
                    <td className="py-2 px-4 text-black">
                      <img
                        src={category.icon}
                        alt={category.name}
                        className="w-10 h-10 object-cover"
                      />
                    </td>
                    <td className="py-2 px-4 text-black flex flex-wrap sm:flex-nowrap gap-2">
                      <Link
                        href={`/admin/category/categoryForm?id=${category.id}`}
                      >
                        <button className="text-blue-600 hover:text-blue-800 transition">
                          <Edit size={18} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
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

      {filteredCategories.length > 0 && (
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 transition"
            }`}
          >
            Prev
          </button>

          <span className="text-black">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={`px-4 py-2 rounded-lg ${
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
