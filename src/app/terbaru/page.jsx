"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../component/Layout";
import Image from "next/image";
import Iklan from "../component/Iklan";

const Terbaru = () => {
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/blogs?latest=true&limit=21"); // Ubah limit menjadi 21
        if (!res.ok) {
          throw new Error("Failed to fetch latest blogs.");
        }
        const data = await res.json();
        setLatestBlogs(data.slice(0, 21));
      } catch (err) {
        console.error("Error fetching latest blogs:", err);
        setError("Could not load latest blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBlogs();
  }, []);

  if (loading) {
    return (
      <p className="flex h-screen justify-center items-center font-semibold text-2xl text-blue-400">
        Loading latest news...
      </p>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Layout>
      <section
        id="Up-to-date"
        className="max-w-[1130px] mx-auto flex flex-col gap-[30px] mt-[70px] px-4 md:px-0"
      >
        <div className="flex justify-center items-center gap-5">
          <h1 className="text-4xl font-bold">Terbaru</h1>
          <h1 className="text-4xl font-bold">/</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
          {latestBlogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/details/${blog.id}`}
              className="card-news"
            >
              <div className="rounded-[20px] ring-1 ring-[#EEF0F7] p-4 md:p-[26px_20px] flex flex-col gap-4 hover:ring-2 hover:ring-[#FF6B18] transition-all duration-300 bg-white">
                <div className="thumbnail-container w-full h-[150px] md:h-[200px] rounded-[20px] flex shrink-0 overflow-hidden relative">
                  <p className="badge-white absolute top-2 left-2 md:top-5 md:left-5 rounded-full p-2 md:p-[8px_18px] bg-white font-bold text-xs md:text-xs leading-[18px]">
                    {blog.category?.name?.toUpperCase() || "CATEGORY"}
                  </p>
                  <Image
                    src={
                      blog.headline || "/assets/images/thumbnails/default.png"
                    }
                    className="object-cover w-full h-full"
                    alt="thumbnail"
                    width={500}
                    height={300}
                  />
                </div>
                <div className="card-info flex flex-col gap-[6px]">
                  <h3 className="font-bold text-lg leading-[27px] line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm leading-[21px] text-[#A3A6AE]">
                    {new Date(blog.createdAt).toLocaleDateString("id-ID", {
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
      </section>
      <Iklan />
    </Layout>
  );
};

export default Terbaru;
