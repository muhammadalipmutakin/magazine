"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const Carosel = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/blogs?isFeature=true");
        if (!res.ok) {
          throw new Error("Failed to fetch featured blogs.");
        }
        const data = await res.json();

        // Pastikan hanya menampilkan blog dengan isFeature = true
        const filteredBlogs = data.filter((blog) => blog.isFeature === true);
        setFeaturedBlogs(filteredBlogs);
      } catch (err) {
        console.error("Error fetching featured blogs:", err);
        setError("Could not load featured blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  if (loading) {
    return (
      <p className="flex h-screen justify-center items-center font-semibold text-2xl text-blue-400">
        Loading featured news...
      </p>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  // Jika tidak ada blog yang memiliki isFeature=true
  if (featuredBlogs.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No featured news available.
      </p>
    );
  }

  return (
    <section id="Featured" className="mt-[30px]">
      <div className="main-carousel w-full">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          modules={[Navigation, Autoplay]}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          navigation={true}
          className="mySwiper"
        >
          {featuredBlogs.map((blog) => (
            <SwiperSlide key={blog.id}>
              <div className="featured-news-card relative w-full h-[550px] md:h-[600px] lg:h-[700px] xl:h-[800px] flex shrink-0 overflow-hidden">
                <img
                  src={blog.headline || "/assets/images/thumbnails/default.png"}
                  className="thumbnail absolute w-full h-full object-cover"
                  alt="featured news"
                />
                <div className="w-full h-full bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.9)] absolute z-10"></div>
                <div className="card-detail max-w-[1130px] w-full mx-auto flex items-end justify-between pb-4 md:pb-8 lg:pb-10 relative z-20">
                  <div className="flex flex-col gap-[5px] md:gap-[10px]">
                    <p className="text-white text-sm md:text-base">Featured</p>
                    <Link
                      href={`/details/${blog.id}`}
                      className="font-bold text-xl md:text-3xl lg:text-4xl leading-[24px] md:leading-[36px] lg:leading-[45px] text-white line-clamp-2 hover:underline transition-all duration-300"
                    >
                      {blog.title}
                    </Link>
                    <p className="text-white text-xs md:text-sm">
                      {new Date(blog.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      • {blog.category?.name || "Category"}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Carosel;
