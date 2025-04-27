"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Layout from "../../component/Layout";
import parse from "html-react-parser";
import More from "../More";
import Iklan from "@/app/component/Iklan";
import Terbaru from "@/app/component/Terbaru";

const ArticleDetail = ({ params }) => {
  const { id } = React.use(params);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blog-posts/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch article.");
        }
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Could not load article.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <p className="text-center">Loading article...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  if (!article) {
    return <p className="text-center">Article not found.</p>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <Layout>
      <header className="flex flex-col items-center gap-[50px] mt-[70px]">
        <div
          id="Headline"
          className="max-w-[1130px] mx-auto flex flex-col gap-4 items-center"
        >
          <p className="w-fit text-[#A3A6AE] font-medium">
            {formatDate(article.createdAt)} • {article.category.name}
          </p>
          <h1
            id="Title"
            className="font-bold text-[36px] md:text-[46px] leading-[48px] md:leading-[60px] text-center two-lines"
            style={{ fontFamily: "Merriweather, serif" }}
          >
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-[70px]">
            <Link href={`/authors/${article.authorId}`} className="w-fit h-fit">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <Image
                    src={
                      article.author.foto ||
                      "/assets/images/photos/default-avatar.png"
                    }
                    className="object-cover w-full h-full"
                    alt="avatar"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-sm leading-[21px]">
                    {article.author.name}
                  </p>
                  <p className="text-xs leading-[18px] text-[#A3A6AE]">
                    {article.author.profesi}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="w-full h-[500px] flex shrink-0 overflow-hidden relative">
          <Image
            src={article.headline}
            className="object-cover w-full h-full"
            alt="cover thumbnail"
            fill
          />
        </div>
      </header>
      <section
        id="Article-container"
        className="max-w-[1130px] mx-auto flex flex-col md:flex-row gap-20 mt-[50px] px-4 md:px-0"
      >
        <article
          id="Content-wrapper"
          className="prose prose-lg dark:prose-invert flex-1 font-serif text-justify"
          style={{
            lineHeight: "1.7",
            fontSize: "1.1rem",
          }}
        >
          {article.content && parse(article.content)}
          {article.images &&
            article.images.map((image, index) => (
              <figure key={index}>
                <div className="relative w-full h-auto">
                  <Image
                    src={image.url}
                    alt={image.caption || "Article Image"}
                    width={800}
                    height={500}
                    layout="responsive"
                    objectFit="contain"
                  />
                </div>
                {image.caption && (
                  <figcaption
                    style={{
                      fontSize: "0.9rem",
                      color: "#777",
                      marginTop: "0.5em",
                      textAlign: "center",
                    }}
                  >
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
        </article>
        <More article={article} formatDate={formatDate} />
      </section>
      <Iklan />
      <Terbaru />
    </Layout>
  );
};

export default ArticleDetail;
