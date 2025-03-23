import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const More = ({ article, formatDate }) => {
  const [moreFromAuthor, setMoreFromAuthor] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [loadingMore, setLoadingMore] = useState(true);
  const [errorMore, setErrorMore] = useState(null);

  useEffect(() => {
    const fetchMoreData = async () => {
      setLoadingMore(true);
      setErrorMore(null);
      try {
        const authorId = article?.authorId;
        const currentPostId = article?.id;
        if (authorId && currentPostId) {
          const resMore = await fetch(
            `/api/blog-posts?authorId=${authorId}&exclude=${currentPostId}&limit=3`
          );
          if (!resMore.ok) {
            console.error("Failed to fetch more posts from author.");
          } else {
            const dataMore = await resMore.json();
            setMoreFromAuthor(dataMore);
          }
        }

        const resAds = await fetch("/api/iklan");
        if (!resAds.ok) {
          console.error("Failed to fetch advertisements.");
        } else {
          const dataAds = await resAds.json();
          const squareAds = dataAds.filter((ad) => ad.jenis === "persegi");
          const shuffledAds = squareAds.sort(() => 0.5 - Math.random());
          const selectedAds = shuffledAds.slice(0, 2);
          setAdvertisements(selectedAds);
        }
      } catch (error) {
        console.error("Error fetching more data:", error);
        setErrorMore("Could not load additional content.");
      } finally {
        setLoadingMore(false);
      }
    };

    if (article) {
      fetchMoreData();
    }
  }, [article]);

  if (loadingMore) {
    return <p>Loading more content...</p>;
  }

  if (errorMore) {
    return <p className="text-red-500">Error: {errorMore}</p>;
  }

  return (
    <div className="side-bar flex flex-col w-full md:w-[300px] shrink-0 gap-10">
      {advertisements[0] && (
        <div
          key={advertisements[0].id}
          className="ads flex flex-col gap-3 w-full"
        >
          <a href={advertisements[0].link}>
            <div className="relative w-full aspect-square">
              <Image
                src={advertisements[0].gambar}
                alt={advertisements[0].judul}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </a>
          <p className="font-medium text-sm leading-[21px] text-[#A3A6AE] flex gap-1">
            Our Advertisement{" "}
            <a href="#" className="w-[18px] h-[18px]">
              <img src="/message-question.svg" alt="icon" />
            </a>
          </p>
        </div>
      )}

      <div id="More-from-author" className="flex flex-col gap-4">
        <p className="font-bold">More From Author</p>
        {moreFromAuthor.map((post) => (
          <Link
            key={post.id}
            href={`/details/${post.id}`}
            className="card-from-author"
          >
            <div className="rounded-[20px] ring-1 ring-[#EEF0F7] p-[14px] flex gap-4 hover:ring-2 hover:ring-[#FF6B18] transition-all duration-300">
              <div className="w-[70px] h-[70px] flex shrink-0 overflow-hidden rounded-2xl relative">
                <Image
                  src={post.headline}
                  alt="thumbnail"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <p className="line-clamp-2 font-bold">{post.title}</p>
                <p className="text-xs leading-[18px] text-[#A3A6AE]">
                  {formatDate(post.createdAt)} • {post.category.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {advertisements[1] && (
        <div
          key={advertisements[1].id}
          className="ads flex flex-col gap-3 w-full"
        >
          <a href={advertisements[1].link}>
            <div className="relative w-full aspect-square">
              <Image
                src={advertisements[1].gambar}
                alt={advertisements[1].judul}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </a>
          <p className="font-medium text-sm leading-[21px] text-[#A3A6AE] flex gap-1">
            Our Advertisement{" "}
            <a href="#" className="w-[18px] h-[18px]">
              <img src="/message-question.svg" alt="icon" />
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default More;
