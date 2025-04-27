// app/layout.js atau app/layout.tsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import Navbar from "./Navbar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Layout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Simulasi delay loading

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mb-7">
      <Navbar />
      <main>
        <Suspense fallback={<SkeletonLoader />}>
          {loading ? <SkeletonLoader /> : children}
        </Suspense>
      </main>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="max-w-[1130px] mx-auto mt-8 px-4">
      <div className="mb-8">
        <Skeleton count={3} height={40} className="mb-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg overflow-hidden">
            <Skeleton height={200} />
            <div className="p-4">
              <Skeleton count={2} height={20} className="mb-2" />
              <Skeleton height={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
