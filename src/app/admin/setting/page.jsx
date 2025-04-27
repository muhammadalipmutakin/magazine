"use client";

import { useState } from "react";
import { Mail, Phone, Linkedin, Github, X } from "lucide-react";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSettings() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

  const adminUrl = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/alip.jpg`;

  return (
    <Layout>
      <div className="flex justify-center items-center p-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-2xl p-8 max-w-lg text-center"
        >
          {/* Foto Profil dengan efek hover zoom & klik untuk memperbesar */}
          <motion.img
            src={adminUrl}
            alt="Muhammad Alip Mutakin"
            className="w-32 h-32 mx-auto rounded-full border-4 border-blue-500 shadow-md cursor-pointer"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsModalOpen(true)}
          />

          {/* Nama & Profesi */}
          <h1 className="text-l md:text-2xl font-bold text-black mt-4">
            Muhammad Alip Mutakin
          </h1>
          <p className="text-gray-600 text-l md:text-xl">
            Software Developer & IT Enthusiast
          </p>

          {/* Kontak & Sosial Media */}
          <div className="mt-4 space-y-2 text-gray-700 text-sm md:text-xl">
            <p className="flex items-center justify-center gap-2">
              <Mail className="text-blue-500" size={20} />
              <a
                href="mailto:alipmutakin@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                alipmutakin@gmail.com
              </a>
            </p>
            <p className="flex items-center justify-center gap-2 text-sm md:text-xl">
              <Phone className="text-green-500" size={20} />
              <a
                href="https://wa.me/6282326253762"
                target="_blank"
                rel="noopener noreferrer"
              >
                +62823 2625 3762
              </a>
            </p>
          </div>

          {/* Ikon Sosial Media */}
          <div className="mt-6 flex justify-center gap-4 text-sm md:text-xl">
            <motion.a
              href="https://id.linkedin.com/in/muhammad-alip-mutakin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-transform transform hover:scale-110"
              whileHover={{ scale: 1.2 }}
            >
              <Linkedin size={32} />
            </motion.a>
            <motion.a
              href="https://github.com/muhammadalipmutakin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 hover:text-gray-700 transition-transform transform hover:scale-110"
              whileHover={{ scale: 1.2 }}
            >
              <Github size={32} />
            </motion.a>
          </div>

          {/* Slogan */}
          <motion.p
            className="mt-6  font-semibold text-blue-600 text-sm md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Let's connect and make awesome things together! 🚀
          </motion.p>
        </motion.div>
      </div>

      {/* Modal untuk menampilkan foto yang diperbesar */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tombol Close */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-700"
              >
                <X size={20} />
              </button>

              {/* Gambar yang diperbesar */}
              <motion.img
                src={adminUrl}
                alt="Muhammad Alip Mutakin"
                className="w-110 rounded-lg border-4 border-white shadow-xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
