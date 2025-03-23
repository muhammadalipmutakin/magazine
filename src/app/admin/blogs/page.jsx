"use client";
import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, RotateCw } from "lucide-react";
import Layout from "../components/Layout";
import { useRouter } from "next/navigation";
import Modal from "../components/Modal";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;
  const router = useRouter();
  const [showDeleted, setShowDeleted] = useState(false);
  const [filterFeature, setFilterFeature] = useState(null); // null, true, false
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState("");

  const toggleShowDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  const handleFilterFeatureChange = (value) => {
    setFilterFeature(value);
  };

  const fetchBlogsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blogs?showDeleted=${showDeleted}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil data blog.");
      }
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Gagal mengambil data blog:", error);
      setError("Terjadi kesalahan saat memuat data blog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogsData();
  }, [showDeleted]);

  const totalPages = Math.ceil(blogs.length / itemsPerPage);
  let filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filterFeature !== null) {
    filteredBlogs = filteredBlogs.filter(
      (blog) => blog.isFeature === filterFeature
    );
  }

  const paginatedData = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFeatureToggle = async (id) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFeature: !blogs.find((b) => b.id === id)?.isFeature,
        }),
      });
      if (!res.ok) {
        throw new Error("Gagal memperbarui status fitur.");
      }
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === id ? { ...blog, isFeature: !blog.isFeature } : blog
        )
      );
    } catch (error) {
      console.error("Gagal memperbarui status fitur:", error);
      setError("Gagal memperbarui status fitur.");
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin memulihkan blog ini?")) {
      try {
        const res = await fetch(`/api/blogs/${id}`, {
          method: "POST", // Assuming your restore endpoint is a POST request
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal memulihkan blog.");
        }
        // Data berhasil dipulihkan, reload data
        fetchBlogsData();
      } catch (error) {
        console.error("Gagal memulihkan blog:", error);
        setError(error.message || "Gagal memulihkan blog.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (showDeleted) {
      handleRestore(id);
    } else {
      if (window.confirm("Apakah Anda yakin ingin menghapus blog ini?")) {
        try {
          const res = await fetch(`/api/blogs/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            throw new Error("Gagal menghapus blog.");
          }
          setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
        } catch (error) {
          console.error("Gagal menghapus blog:", error);
          setError("Gagal menghapus blog.");
        }
      }
    }
  };

  const openModal = (content) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContent("");
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-black mb-4">Blogs</h1>
      <p className="text-gray-700 mb-4">Selamat datang di halaman Blogs.</p>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="relative mb-2 md:mb-0">
          <button
            onClick={toggleShowDeleted}
            className={`bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition ${
              showDeleted ? "bg-red-500 text-white hover:bg-red-600" : ""
            }`}
          >
            {showDeleted ? "Sembunyikan Blog Dihapus" : "Lihat Blog Dihapus"}
          </button>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Cari blog..."
              className="pl-10 pr-4 py-2 border border-black rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-blue-500 w-full text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={18}
            />
          </div>
          <select
            value={
              filterFeature === null ? "" : filterFeature ? "true" : "false"
            }
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                handleFilterFeatureChange(null);
              } else {
                handleFilterFeatureChange(value === "true");
              }
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition text-sm md:text-base w-full md:w-auto"
          >
            <option value="">Semua Fitur</option>
            <option value="true">Feature (Ceklis)</option>
            <option value="false">Tidak Feature (Silang)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Memuat data...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : filteredBlogs.length === 0 ? (
        <ul className="text-center text-gray-600 bg-white shadow rounded-lg p-4">
          Belum ada data
        </ul>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 border-t border-b">
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Headline
                </th>

                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Judul
                </th>
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Konten
                </th>
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Kategori
                </th>
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Author
                </th>
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Tanggal
                </th>
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Feature
                </th>
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((blog) => (
                <tr
                  key={blog.id}
                  className="border-t border-b even:bg-gray-100 hover:bg-gray-200 transition"
                >
                  <td className="py-2 px-4">
                    <img
                      src={blog.headline || "/default-image.png"}
                      alt="Gambar Blog"
                      className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-lg"
                    />
                  </td>
                  <td className="py-2 px-4 text-black text-sm md:text-base">
                    <div className="line-clamp-2">{blog.title}</div>{" "}
                    {/* Tambahkan line-clamp-2 di sini */}
                  </td>
                  <td
                    className="py-2 px-4 text-black cursor-pointer text-sm md:text-base"
                    onClick={() => openModal(blog.content)}
                  >
                    {stripHtml(blog.content).substring(0, 50) + "..."}
                  </td>
                  <td className="py-2 px-4 text-black text-sm md:text-base">
                    {blog.category?.name || "Kategori tidak tersedia"}
                  </td>
                  <td className="py-2 px-4 text-black text-sm md:text-base">
                    {blog.author?.name || "Author tidak tersedia"}
                  </td>
                  <td className="py-2 px-4 text-black text-sm md:text-base">
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString("id-ID")
                      : "Tanggal tidak tersedia"}
                  </td>
                  <td className="py-2 px-4 text-black text-center">
                    <button
                      onClick={() => handleFeatureToggle(blog.id)}
                      className="transition duration-300"
                    >
                      {blog.isFeature ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <XCircle size={20} className="text-red-500" />
                      )}
                    </button>
                  </td>
                  <td className="py-2 px-4 text-black flex space-x-2 items-center">
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className={`${
                        showDeleted
                          ? "text-blue-600 hover:text-blue-800"
                          : "text-red-600 hover:text-red-800"
                      } transition text-sm md:text-base`}
                    >
                      {showDeleted ? "Pulihkan" : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredBlogs.length > 0 && (
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
            Halaman {currentPage} dari {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={`px-4 py-2 rounded-lg text-sm md:text-base ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 transition"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="prose">
            <div dangerouslySetInnerHTML={{ __html: selectedContent }} />
          </div>
        </Modal>
      )}
    </Layout>
  );
}
