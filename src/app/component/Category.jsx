"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/categories-with-blogs");
        if (!res.ok) {
          throw new Error("Failed to fetch categories with blogs.");
        }
        const data = await res.json();

        // Filter kategori yang memiliki blog
        const filteredCategories = data
          .filter((category) => category.blogs.length > 0)
          .map((category) => {
            const featuredBlog = category.blogs[0];
            const remainingBlogs = category.blogs.slice(1);
            return {
              ...category,
              featuredBlog,
              remainingBlogs: remainingBlogs.slice(0, 5), // Ambil maksimal 5 blog untuk samping
            };
          });

        setCategories(filteredCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Could not load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <p className="text-center">Loading categories and blogs...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <>
      {categories.map((category) => (
        <section
          key={category.id}
          id={`Latest-${category.name.toLowerCase()}`}
          className="max-w-[1130px] mx-auto flex flex-col gap-[30px] mt-[70px] px-4 md:px-0"
        >
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-[26px] leading-[39px]">
              Latest For You <br />
              in {category.name}
            </h2>
            <Link
              href={`/category/${category.id}`}
              className="rounded-full p-[12px_22px] flex gap-[10px] font-semibold transition-all duration-300 border border-[#EEF0F7] hover:ring-2 hover:ring-[#FF6B18]"
            >
              Explore All
            </Link>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start h-fit gap-6">
            {category.featuredBlog ? (
              <>
                {/* Kartu Blog Utama (Featured) */}
                <div className="featured-news-card relative w-full md:w-[650px] h-[250px] md:h-[424px] flex-1 rounded-[20px] overflow-hidden">
                  <Image
                    src={
                      category.featuredBlog.headline
                        ? `${baseUrl}${category.featuredBlog.headline}`
                        : "/assets/images/thumbnails/default.png"
                    }
                    layout="fill"
                    style={{ objectFit: "cover" }}
                    alt={category.featuredBlog.title || "Featured Blog"}
                  />
                  <div className="w-full h-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.9)] absolute z-10"></div>
                  <div className="card-detail w-full h-full flex flex-col justify-end p-4 md:p-[30px] relative z-20">
                    <div className="flex flex-col gap-[10px]">
                      <p className="text-white">Featured</p>
                      <Link
                        href={`/details/${category.featuredBlog.id}`}
                        className="font-bold text-xl md:text-[30px] leading-[24px] md:leading-[36px] text-white hover:underline transition-all duration-300 line-clamp-2" // Tambahkan line-clamp-2 di sini
                      >
                        {category.featuredBlog.title}
                      </Link>
                      <p className="text-white">
                        {new Date(
                          category.featuredBlog.createdAt
                        ).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blog List Samping */}
                <div className="w-full md:w-[455px] h-fit md:h-[424px] px-0 md:px-5 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
                  <div className="flex flex-col gap-5">
                    {category.remainingBlogs.map((blog) => (
                      <Link
                        key={blog.id}
                        href={`/details/${blog.id}`}
                        className="card py-[2px]"
                      >
                        <div className="rounded-[20px] border border-[#EEF0F7] p-[14px] flex items-center gap-4 hover:ring-2 hover:ring-[#FF6B18] transition-all duration-300">
                          <div className="w-[100px] md:w-[130px] h-[80px] md:h-[100px] flex shrink-0 rounded-[20px] overflow-hidden">
                            <Image
                              src={
                                blog.headline
                                  ? `${baseUrl}${blog.headline}`
                                  : "/assets/images/thumbnails/default.png"
                              }
                              width={130}
                              height={100}
                              style={{ objectFit: "cover" }}
                              alt={blog.title || "Blog Thumbnail"}
                            />
                          </div>
                          <div className="flex flex-col justify-center gap-[6px]">
                            <h3 className="font-bold text-lg leading-[27px] line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-sm leading-[21px] text-[#A3A6AE]">
                              {new Date(blog.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="sticky z-10 bottom-0 w-full h-[100px] bg-gradient-to-b from-[rgba(255,255,255,0.19)] to-[rgba(255,255,255,1)]"></div>
                </div>
              </>
            ) : null}
          </div>
        </section>
      ))}
    </>
  );
};

export default Category;
