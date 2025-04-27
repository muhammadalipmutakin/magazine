"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Layout from "@/app/component/Layout";
import { useRouter } from "next/navigation";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

  const searchIconUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/search-normal.svg`;

  // Mengambil query parameter dari router.query
  useEffect(() => {
    const queryParam = new URLSearchParams(window.location.search).get("q");
    if (queryParam) {
      setSearchTerm(queryParam);
      fetchSearchResults(queryParam);
    }
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const fetchSearchResults = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search?query=${query}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error("Search failed");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setSearchResults([]); // Corrected here
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;

    router.push(`/search?q=${searchTerm}`); // Menggunakan router.push untuk mengubah URL
  };

  return (
    <Layout>
      <section className="max-w-[1130px] mx-auto flex items-center flex-col gap-8 mt-10 px-4 md:px-0">
        <h1 className="text-4xl font-bold text-center">
          Explore Hot Trending <br />
          Good News Today
        </h1>
        <form onSubmit={handleSearchSubmit} className="w-full">
          <label
            htmlFor="search-bar"
            className="w-full md:w-[500px] flex p-3 transition-all duration-300 gap-2 ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-orange-500 rounded-full group mx-auto"
          >
            <div className="w-5 h-5 flex shrink-0">
              <Image
                src={searchIconUrl}
                alt="Search icon"
                width={20}
                height={20}
              />
            </div>
            <input
              autoComplete="off"
              type="text"
              id="search-bar"
              name="search-bar"
              placeholder="Search hot trendy news today..."
              className="appearance-none font-semibold placeholder:font-normal placeholder:text-gray-500 outline-none focus:ring-0 w-full"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
          </label>
        </form>
      </section>

      <section className="max-w-[1130px] mx-auto flex items-start flex-col gap-8 mt-10 mb-10 px-4 md:px-0">
        <h2 className="text-2xl font-bold">
          Search Result: <span>{searchTerm}</span>
        </h2>
        {loading && <p>Loading search results...</p>}
        {!loading && searchResults.length === 0 && searchTerm.trim() !== "" && (
          <p>No results found for "{searchTerm}"</p>
        )}
        {!loading && searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((article) => (
              <Link
                key={article.id}
                href={`/details/${article.id}`}
                className="card"
              >
                <div className="flex flex-col gap-3 p-5 transition-all duration-300 ring-1 ring-gray-200 hover:ring-orange-500 rounded-lg overflow-hidden bg-white">
                  <div className="thumbnail-container h-48 relative rounded-lg overflow-hidden">
                    <div className="badge absolute left-5 top-5 flex px-4 py-1 bg-white rounded-full">
                      <p className="text-xs font-bold uppercase">
                        {article.category?.name || "Uncategorized"}
                      </p>
                    </div>
                    {article.headline ? (
                      <Image
                        src={article.headline}
                        alt={`Gambar artikel: ${article.title}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-gray-300 h-full w-full flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default SearchPage;
