"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const Iklan = () => {
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

  const messageUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/message-question.svg`;

  useEffect(() => {
    const fetchAdvertisements = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/iklan");
        if (!res.ok) {
          throw new Error("Failed to fetch advertisements.");
        }
        const data = await res.json();

        // Filter iklan berdasarkan jenis
        const persegiPanjang = data.filter(
          (iklan) => iklan.jenis === "persegi panjang"
        );

        if (persegiPanjang.length > 0) {
          // Select a random advertisement
          const randomIndex = Math.floor(Math.random() * persegiPanjang.length);
          const selectedAdvertisement = persegiPanjang[randomIndex];
          setAdvertisement(selectedAdvertisement);
        } else {
          setAdvertisement(null);
        }
      } catch (err) {
        console.error("Error fetching advertisements:", err);
        setError("Could not load advertisements.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []); // The empty dependency array ensures this runs only once on mount

  if (loading) {
    return <p className="text-center">Loading advertisement...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  if (!advertisement) {
    return null; // Jika tidak ada iklan yang sesuai, tidak ditampilkan
  }

  return (
    <section
      id="Advertisement"
      className="max-w-[1130px] mx-auto flex justify-center mt-[70px] hover:border-[#FF6B18] hover:border hover:rounded-2xl transition-all duration-300 px-4 md:px-0 mb-10"
    >
      <div className="flex flex-col gap-3 shrink-0 w-full md:w-fit">
        <a
          href={advertisement.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <div className="w-full h-[100px] md:w-[900px] md:h-[120px] flex shrink-0 border border-[#EEF0F7] rounded-2xl overflow-hidden relative">
            <Image
              src={advertisement.gambar}
              alt={advertisement.judul || "Advertisement"}
              fill
              style={{
                objectFit: "fill",
              }}
              sizes="(max-width: 767px) 100vw, 900px"
            />
          </div>
        </a>
        <p className="font-medium text-sm leading-[21px] text-[#A3A6AE] flex gap-1 justify-center md:justify-start">
          Our Advertisement
          <a href="#" className="w-[18px] h-[18px]">
            <Image src={messageUrl} alt="icon" width={18} height={18} />
          </a>
        </p>
      </div>
    </section>
  );
};

export default Iklan;
