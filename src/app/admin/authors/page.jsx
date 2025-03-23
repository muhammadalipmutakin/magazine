"use client";
import { useState, useEffect } from "react";
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import Layout from "../components/Layout";
import Link from "next/link";

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [filterActive, setFilterActive] = useState(null);
  const itemsPerPage = 4;

  // Fetch data from backend
  useEffect(() => {
    fetch(`/api/penulis?deleted=${showDeleted}`)
      .then((res) => res.json())
      .then((data) => {
        setAuthors(data);
        applyFilters(data, query, filterActive);
      })
      .catch((error) => console.error("Error fetching authors:", error))
      .finally(() => setLoading(false));
  }, [showDeleted]);

  useEffect(() => {
    applyFilters(authors, query, filterActive);
  }, [authors, query, filterActive]);

  const applyFilters = (data, searchQuery, activeFilter) => {
    let filteredData = data;

    if (searchQuery) {
      filteredData = filteredData.filter(
        (author) =>
          author.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          author.profesi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== null) {
      filteredData = filteredData.filter(
        (author) => author.isActive === activeFilter
      );
    }

    setFilteredAuthors(filteredData);
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    setQuery(event.target.value);
  };

  const handleFilterActive = (value) => {
    setFilterActive(value);
  };

  const toggleActiveStatus = async (authorId) => {
    try {
      const response = await fetch(`/api/penulis/${authorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !authors.find((a) => a.id === authorId)?.isActive,
        }),
      });

      if (response.ok) {
        setAuthors((prevAuthors) =>
          prevAuthors.map((author) =>
            author.id === authorId
              ? { ...author, isActive: !author.isActive }
              : author
          )
        );
      } else {
        console.error("Failed to update author status");
      }
    } catch (error) {
      console.error("Error updating author status:", error);
    }
  };

  const handleDeleteOrRestore = async (authorId) => {
    const isRestore = showDeleted;
    const confirmationMessage = isRestore
      ? "Apakah Anda yakin ingin mengembalikan author ini?"
      : "Apakah Anda yakin ingin menghapus author ini?";

    if (window.confirm(confirmationMessage)) {
      try {
        const response = await fetch(`/api/penulis/${authorId}`, {
          method: isRestore ? "PUT" : "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deletedAt: isRestore ? null : new Date() }),
        });

        if (response.ok) {
          // Refresh data after delete/restore
          fetch(`/api/penulis?deleted=${showDeleted}`)
            .then((res) => res.json())
            .then((data) => {
              setAuthors(data);
              applyFilters(data, query, filterActive);
            });
        } else {
          console.error(`Failed to ${isRestore ? "restore" : "delete"} author`);
        }
      } catch (error) {
        console.error(
          `Error ${isRestore ? "restoring" : "deleting"} author:`,
          error
        );
      }
    }
  };

  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const paginatedData = Array.isArray(filteredAuthors)
    ? filteredAuthors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-black mb-4">Authors</h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        {/* Tombol Lihat Data Terhapus */}
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition text-black mb-2 md:mb-0"
        >
          {showDeleted ? "Lihat Semua Author" : "Lihat Author Terhapus"}
        </button>

        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari author..."
              value={query}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-full text-sm md:text-base"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={18}
            />
          </div>
          {/* Filter Active */}
          <select
            value={filterActive === null ? "all" : filterActive.toString()}
            onChange={(e) =>
              handleFilterActive(
                e.target.value === "all" ? null : e.target.value === "true"
              )
            }
            className="py-2 px-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm md:text-base w-full md:w-auto"
          >
            <option value="all">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {!loading && filteredAuthors.length === 0 && (
        <ul className="text-center text-gray-600 bg-white shadow rounded-lg p-4">
          {showDeleted ? "Tidak ada author terhapus" : "Belum ada data"}
        </ul>
      )}

      {!loading && filteredAuthors.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 border-t border-b">
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Foto
                </th>
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Nama
                </th>
                <th className="py-2 px-4 text-left text-black text-sm md:text-base">
                  Profesi
                </th>
                <th className="py-2 px-4 text-center text-black text-sm md:text-base">
                  Status
                </th>
                <th className="py-2 px-4 text-center text-black text-sm md:text-base">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((author) => (
                <tr
                  key={author.id}
                  className="border-t border-b even:bg-gray-100 hover:bg-gray-200 transition"
                >
                  <td className="py-2 px-4 text-black">
                    <img
                      src={author.foto}
                      alt={author.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border mx-auto"
                    />
                  </td>
                  <td className="py-2 px-4 text-black text-sm md:text-base">
                    {author.name}
                  </td>
                  <td className="py-2 px-4 text-black text-sm md:text-base">
                    {author.profesi}
                  </td>
                  <td
                    className="py-2 px-4 text-black text-center cursor-pointer"
                    onClick={() => toggleActiveStatus(author.id)}
                  >
                    {author.isActive ? (
                      <CheckCircle
                        className="text-green-500 mx-auto"
                        size={20}
                      />
                    ) : (
                      <XCircle className="text-red-500 mx-auto" size={20} />
                    )}
                  </td>
                  <td className="py-2 px-4 text-black flex justify-center space-x-2">
                    {showDeleted ? (
                      <button
                        onClick={() => handleDeleteOrRestore(author.id)}
                        className="text-green-600 hover:text-green-800 transition text-sm md:text-base"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteOrRestore(author.id)}
                        className="text-red-600 hover:text-red-800 transition text-sm md:text-base"
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAuthors.length > 0 && (
        <div className="flex justify-center gap-x-7 items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
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
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
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
    </Layout>
  );
}
