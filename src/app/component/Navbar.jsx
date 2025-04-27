"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

  const logoUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/logo.svg`;
  const searchIconUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/search-normal.svg`;
  const favoriteChartUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/favorite-chart.svg`;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/search?q=${searchQuery}`);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="max-w-[1130px] mx-auto mt-8 px-4 relative">
      <nav className="flex justify-between items-center w-full">
        {/* Logo */}
        <div className="logo-container flex items-center gap-x-3">
          <Link href="/">
            <Image src={logoUrl} alt="logo" width={100} height={100} />
          </Link>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-grow max-w-[500px] mx-4">
          {!pathname.startsWith("/search") && (
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center rounded-full border border-[#E8EBF4] px-4 py-2 gap-2 focus-within:ring-2 focus-within:ring-[#FF6B18] transition-all duration-300"
            >
              <button type="submit" className="w-5 h-5 flex shrink-0">
                <Image
                  src={searchIconUrl}
                  alt="Search Icon"
                  width={20}
                  height={20}
                />
              </button>
              <input
                type="text"
                className="w-full outline-none font-semibold placeholder:font-normal placeholder:text-[#A3A6AE]"
                placeholder="Search hot trendy news today..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
          )}
        </div>

        {/* Toggle Button (Mobile) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B18]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/author/">
            <span className="rounded-full px-5 py-3 flex gap-2 font-semibold transition-all duration-300 border border-[#EEF0F7] hover:ring-2 hover:ring-[#FF6B18]">
              Login Sebagai Author
            </span>
          </Link>
          <Link href="/terbaru">
            <span className="rounded-full px-5 py-3 flex gap-2 font-bold transition-all duration-300 bg-[#FF6B18] text-white hover:shadow-[0_10px_20px_0_#FF6B1880]">
              <Image
                src={favoriteChartUrl}
                alt="Post Ads"
                width={24}
                height={24}
              />
              <span>Terbaru</span>
            </span>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu (Includes Search Bar) */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-md z-10 ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-col items-center p-4 gap-4">
          {/* Search Bar (Mobile) */}
          {!pathname.startsWith("/search") && (
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center rounded-full border border-[#E8EBF4] px-4 py-2 gap-2 focus-within:ring-2 focus-within:ring-[#FF6B18] transition-all duration-300"
            >
              <button type="submit" className="w-5 h-5 flex shrink-0">
                <Image
                  src={searchIconUrl}
                  alt="Search Icon"
                  width={20}
                  height={20}
                />
              </button>
              <input
                type="text"
                className="w-full outline-none font-semibold placeholder:font-normal placeholder:text-[#A3A6AE]"
                placeholder="Search hot trendy news today..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
          )}

          {/* Mobile Navigation Links */}
          <Link href="/author/">
            <span className="rounded-full px-5 py-3 flex gap-2 font-semibold transition-all duration-300 border border-[#EEF0F7] hover:ring-2 hover:ring-[#FF6B18]">
              Login Sebagai Author
            </span>
          </Link>
          <Link href="/terbaru">
            <span className="rounded-full px-5 py-3 flex gap-2 font-bold transition-all duration-300 bg-[#FF6B18] text-white hover:shadow-[0_10px_20px_0_#FF6B1880]">
              <Image
                src={favoriteChartUrl}
                alt="Post Ads"
                width={24}
                height={24}
              />
              <span>Terbaru</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Category Section */}
      <nav className="mt-8 overflow-x-auto scrollbar-hide">
        <div className="flex justify-center items-center gap-4 flex-nowrap my-3">
          {loading ? (
            <p className="text-gray-500 animate-pulse">Loading categories...</p>
          ) : (
            categories.map((category, index) => (
              <Link key={index} href={`/category/${category.id}`}>
                <span className="rounded-full px-5 py-3 flex gap-2 font-semibold transition-all duration-300 border border-[#EEF0F7] hover:ring-2 hover:ring-[#FF6B18]">
                  <Image
                    src={category.icon || "/assets/images/icons/default.svg"}
                    alt={category.name}
                    width={24}
                    height={24}
                  />
                  <span>{category.name}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
