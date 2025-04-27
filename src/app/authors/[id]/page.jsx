"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import Layout from "@/app/component/Layout";
import Iklan from "@/app/component/Iklan";

const AuthorPage = () => {
  const params = useParams();
  const authorId = params?.id;

  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authorId) return;

    const fetchAuthorData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/author/${authorId}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to fetch author data:", errorData);
          throw new Error("Failed to fetch author data.");
        }

        const data = await response.json();

        if (data) {
          setAuthor({
            name: data.name || "Unknown",
            occupation: data.profesi || "N/A",
            profilePicture: data.foto || "/images/default-profile.jpg",
          });

          const processedArticles = (data.blogs || []).map((article) => ({
            ...article,
            category: article.category ? article.category.name : "General",
          }));
          setArticles(processedArticles);
          console.log("Data articles setelah diproses:", processedArticles);
        } else {
          setAuthor(null);
          setArticles([]);
        }
      } catch (err) {
        console.error("Error fetching author data:", err);
        setError(err.message || "Could not load author data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [authorId]);

  if (loading) {
    return (
      <Layout>
        <p className="text-center text-gray-500">Loading author data...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="text-center text-red-500">Error: {error}</p>
      </Layout>
    );
  }

  if (!author) {
    return (
      <Layout>
        <p className="text-center text-gray-500">Author not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <section
        id="author"
        className="max-w-[1130px] mx-auto flex items-center flex-col gap-8 mt-10 px-4 md:px-0"
      >
        <div id="title" className="flex items-center gap-5">
          <h1 className="text-4xl font-bold">Author News</h1>
          <h1 className="text-4xl font-bold">/</h1>
          <div className="flex gap-3 items-center">
            <div className="w-14 h-14 flex-shrink-0 rounded-full overflow-hidden">
              <Image
                src={author.profilePicture}
                alt={`Foto profil ${author.name}`}
                width={60}
                height={60}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold">{author.name}</p>
              <span className="text-gray-500">{author.occupation}</span>
            </div>
          </div>
        </div>
        <div
          id="content-cards"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/details/${article.id}`}
              className="card-news"
            >
              <div className="rounded-[20px] ring-1 ring-[#EEF0F7] p-[26px_20px] flex flex-col gap-4 hover:ring-2 hover:ring-[#FF6B18] transition-all duration-300 bg-white">
                <div className="thumbnail-container w-full h-[200px] rounded-[20px] flex shrink-0 overflow-hidden relative">
                  <p className="badge-white absolute top-5 left-5 rounded-full p-[8px_18px] bg-white font-bold text-xs leading-[18px]">
                    {article.category?.toUpperCase() || "CATEGORY"}
                  </p>
                  <img
                    src={
                      article.headline ||
                      "/assets/images/thumbnails/default.png"
                    }
                    className="object-cover w-full h-full"
                    alt="thumbnail"
                  />
                </div>
                <div className="card-info flex flex-col gap-[6px]">
                  <h3 className="font-bold text-lg leading-[27px] line-clamp-2">
                    {" "}
                    {/* Tambahkan line-clamp-2 di sini */}
                    {article.title}
                  </h3>
                  <p className="text-sm leading-[21px] text-[#A3A6AE]">
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
      </section>
      <div className="mt-3 mb-20">
        <Iklan />
      </div>
    </Layout>
  );
};

export default AuthorPage;
