"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Layout from "@/app/component/Layout";
import Iklan from "@/app/component/Iklan";

const CategoryResult = ({ params }) => {
  const { id: categoryId } = React.use(params);
  const [articles, setArticles] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryRes = await fetch(`/api/categories/${categoryId}`);
        if (!categoryRes.ok) {
          throw new Error("Failed to fetch category data.");
        }
        const categoryData = await categoryRes.json();
        setCategoryName(categoryData.name);

        const articlesRes = await fetch(
          `/api/blog-posts?categoryId=${categoryId}`
        );
        if (!articlesRes.ok) {
          throw new Error("Failed to fetch articles for this category.");
        }
        const articlesData = await articlesRes.json();
        setArticles(articlesData);
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError("Could not load category data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  if (loading) {
    return (
      <Layout>
        <p className="flex h-screen justify-center items-center font-semibold text-2xl text-blue-400">
          Loading articles...
        </p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p>Error: {error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <section
        id="Category-result"
        className="max-w-[1130px] mx-auto flex flex-col gap-[30px] mt-[70px] px-4 md:px-0"
      >
        <div className="flex justify-center items-center gap-5">
          <h1 className="text-4xl font-bold">{categoryName}</h1>
          <h1 className="text-4xl font-bold">/</h1>
        </div>
        {articles.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/empty.png"
              alt="No articles found"
              width={200}
              height={200}
            />
            <p className="text-lg text-gray-600">
              There are no articles in this category yet.
            </p>
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/details/${article.id}`}
                className="card-news"
              >
                <div className="rounded-[20px] ring-1 ring-[#EEF0F7] p-4 md:p-[26px_20px] flex flex-col gap-4 hover:ring-2 hover:ring-[#FF6B18] transition-all duration-300 bg-white">
                  <div className="thumbnail-container w-full h-[150px] md:h-[200px] rounded-[20px] flex shrink-0 overflow-hidden relative">
                    <p className="badge-white absolute top-2 left-2 md:top-5 md:left-5 rounded-full p-2 md:p-[8px_18px] bg-white font-bold text-xs md:text-xs leading-[18px]">
                      {article.category?.name?.toUpperCase() || "CATEGORY"}
                    </p>
                    <Image
                      src={
                        article.headline ||
                        "/assets/images/thumbnails/default.png"
                      }
                      className="object-cover w-full h-full"
                      alt="thumbnail"
                      width={500}
                      height={300}
                    />
                  </div>
                  <div className="card-info flex flex-col gap-[6px]">
                    <h3 className="font-bold text-lg leading-[27px] line-clamp-2">
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
        )}
      </section>
      <Iklan />
    </Layout>
  );
};

export default CategoryResult;
