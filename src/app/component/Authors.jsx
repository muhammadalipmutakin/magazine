"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const Authors = () => {
  const [bestAuthors, setBestAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestAuthors = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/authors?best=true");
        if (!res.ok) {
          throw new Error("Failed to fetch best authors.");
        }
        const data = await res.json();
        setBestAuthors(data);
      } catch (err) {
        console.error("Error fetching best authors:", err);
        setError("Could not load best authors.");
      } finally {
        setLoading(false);
      }
    };

    fetchBestAuthors();
  }, []);

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <section
      id="Best-authors"
      className="max-w-[1130px] mx-auto flex flex-col gap-[30px] mt-[70px] px-4 md:px-0"
    >
      <div className="flex flex-col text-center gap-[14px] items-center">
        <p className="badge-orange rounded-full p-[8px_18px] bg-[#FFECE1] font-bold text-sm leading-[21px] text-[#FF6B18] w-fi">
          BEST AUTHORS
        </p>
        <h2 className="font-bold text-[26px] leading-[39px]">
          Explore All Masterpieces <br />
          Written by People
        </h2>
      </div>

      {bestAuthors.length === 0 ? (
        <p className="text-center text-gray-500">No authors available.</p>
      ) : (
        <div className="md:grid-cols-6 overflow-x-auto md:overflow-hidden scrollbar-hide">
          <div className="grid grid-flow-col auto-cols-[160px] md:auto-cols-[200px] gap-[20px] md:gap-[30px] md:grid-cols-6 my-5 mx-2">
            {bestAuthors.map((author) => (
              <Link
                key={author.id}
                href={`/authors/${author.id}`}
                className="card-authors"
              >
                <div className="rounded-[20px] border border-[#EEF0F7] p-4 md:p-[26px_20px] flex flex-col items-center gap-4 hover:ring-2 hover:ring-[#FF6B18] transition-all duration-300">
                  <div className="w-[70px] h-[70px] md:w-[90px] md:h-[90px] flex shrink-0 rounded-full overflow-hidden">
                    <Image
                      src={author.foto || "/assets/images/photos/default.png"}
                      className="object-cover w-full h-full"
                      alt="avatar"
                      width={90}
                      height={90}
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-center">
                    <p className="font-semibold">{author.name}</p>
                    <p className="text-sm leading-[21px] text-[#A3A6AE]">
                      {author.blogCount || 0} News
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Authors;
