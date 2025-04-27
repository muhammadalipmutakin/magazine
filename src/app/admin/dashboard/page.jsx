"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Folder,
  FileText,
  Users,
  Megaphone,
  Eye,
} from "lucide-react";
import Layout from "../components/Layout";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function Dashboard() {
  const [dataCounts, setDataCounts] = useState({
    category: 0,
    blog: 0,
    author: 0,
    iklan: 0,
    visitor: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDataCounts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Gagal mengambil data dari API.");
        }
        const data = await res.json();
        setDataCounts(data);
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchDataCounts();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p>Memuat data dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <LayoutDashboard size={32} className="mr-3 text-blue-600" />
        Dashboard
      </h1>
      <div className="flex flex-col justify-between h-[73vh]">
        {/* Statistik Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 shadow-lg rounded-xl flex items-center space-x-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="p-3 bg-blue-100 rounded-full">
              <Folder size={40} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 font-medium">Kategori</p>
              <h2 className="text-3xl font-bold text-gray-900">
                {dataCounts.category}
              </h2>
            </div>
          </div>
          <div className="bg-white p-6 shadow-lg rounded-xl flex items-center space-x-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText size={40} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 font-medium">Blog</p>
              <h2 className="text-3xl font-bold text-gray-900">
                {dataCounts.blog}
              </h2>
            </div>
          </div>
          <div className="bg-white p-6 shadow-lg rounded-xl flex items-center space-x-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users size={40} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 font-medium">Authors</p>
              <h2 className="text-3xl font-bold text-gray-900">
                {dataCounts.author}
              </h2>
            </div>
          </div>
          <div className="bg-white p-6 shadow-lg rounded-xl flex items-center space-x-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="p-3 bg-blue-100 rounded-full">
              <Megaphone size={40} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 font-medium">Iklan</p>
              <h2 className="text-3xl font-bold text-gray-900">
                {dataCounts.iklan}
              </h2>
            </div>
          </div>
        </div>

        {/* Statistik Pengunjung */}
        <div className="bg-white p-6 shadow-lg rounded-xl flex items-center space-x-6 mb-8">
          <div className="p-3 bg-blue-100 rounded-full">
            <Eye size={40} className="text-blue-600" />
          </div>
          <div>
            <p className="text-gray-600 font-medium">Jumlah Pengunjung</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {dataCounts.visitor}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Total pengunjung yang tercatat di situs ini.
            </p>
          </div>
        </div>

        {/* Data Pengembang */}
        <div className="bg-white p-6 shadow-lg rounded-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            About Application
          </h2>
          <p className="text-gray-700">
            Dikembangkan oleh{" "}
            <span className="font-semibold text-blue-600">
              Muhammad Alip Mutakin
            </span>
          </p>
          <p className="text-gray-700">
            Versi Aplikasi: <span className="font-semibold">1.0</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}
