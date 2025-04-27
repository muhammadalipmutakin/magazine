"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthorPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState("/logo.svg"); // Fallback default

  const router = useRouter();

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
  }, []);

  const fetchBlogs = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/blogs?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/author");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      await fetchBlogs(parsedUser.id);
      await fetchLogo();
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  }, [router, fetchBlogs, fetchLogo]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const deleteBlog = useCallback(async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus postingan ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to delete blog");
      }
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/author/");
  };

  if (loading) {
    return <p className="text-center text-lg font-bold">Loading...</p>;
  }

  return (
    <section className="max-w-[1130px] mx-auto flex flex-col gap-[30px] mt-[70px] px-4 md:px-0">
      <nav className="flex justify-between w-full">
        <div className="flex items-center gap-6">
          <Link href="/author/posting">
            <Image src={logoUrl} alt="logo" width={100} height={100} />
          </Link>
          <div className="h-12 border border-[#E8EBF4]"></div>
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

      <div className="flex flex-col md:flex-row items-center gap-[30px] justify-center">
        <div className="flex items-center gap-[30px]">
          <h1 className="text-4xl font-bold leading-[45px]">Author News /</h1>
        </div>
        <Link
          href={`/author/setting?id=${user?.id}`}
          className="flex items-center gap-3"
        >
          <div className="w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full">
            <Image
              src={user?.foto || "/default-avatar.png"}
              alt="profile photo"
              width={60}
              height={60}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold leading-[27px]">
              {user?.name || "Pengguna"}
            </p>
            <span className="text-[#A3A6AE]">{user?.profesi}</span>
          </div>
        </Link>
      </div>

      <div className="mt-6 justify-center flex">
        <Link href="/author/create">
          <button className="rounded-md bg-blue-600 px-5 py-3 text-white transition duration-300 hover:bg-blue-700">
            ➕ Tambah Blog
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-[30px] cursor-pointer md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="rounded-[20px] bg-white p-[26px_20px] transition-all duration-300 ring-1 ring-[#EEF0F7] hover:ring-2 hover:ring-[#FF6B18]"
          >
            <div className="relative h-[200px] overflow-hidden rounded-[20px]">
              <div className="absolute left-5 top-5 rounded-[50px] bg-white p-[8px_18px]">
                <p className="text-xs font-bold leading-[18px]">
                  {blog.category?.name || "Uncategorized"}
                </p>
              </div>
              <Image
                src={blog.headline || "/placeholder.jpg"}
                alt="thumbnail photo"
                width={400}
                height={200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <h3 className="mt-4 text-center text-2xl font-bold leading-[27px] line-clamp-2">
                <Link
                  href={`/author/edit/${blog.id}`}
                  className="hover:underline"
                >
                  {blog.title}
                </Link>
              </h3>
              <p className="text-center text-sm text-[#A3A6AE] leading-[21px]">
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
              <p className="line-clamp-2 text-sm text-[#A3A6AE] leading-[21px]">
                {blog.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Link
                href={`/author/edit/${blog.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Selengkapnya
              </Link>
              <button
                onClick={() => deleteBlog(blog.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AuthorPage;
