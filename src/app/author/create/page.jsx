"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Muat Quill secara dinamis untuk memastikan hanya berjalan di sisi klien
const Quill = dynamic(() => import("quill"), { ssr: false });
import "quill/dist/quill.snow.css";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [headline, setHeadline] = useState(null); // Gambar utama
  const [categories, setCategories] = useState([]); // Data kategori
  const [isLoading, setIsLoading] = useState(false); // Status loading
  const [error, setError] = useState(null); // Status error
  const router = useRouter();
  const editorRef = useRef(null);
  const quillInstance = useRef(null); // Ref untuk menyimpan instance Quill
  const [authorId, setAuthorId] = useState(null); // State untuk menyimpan authorId

  useEffect(() => {
    // Ambil data kategori dari API
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories"); // Modifikasi dengan endpoint API Anda
        if (!response.ok) {
          throw new Error(`Gagal mengambil kategori: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data); // Asumsi API mengembalikan array kategori
      } catch (error) {
        console.error("Kesalahan mengambil kategori: ", error);
        setError("Gagal mengambil daftar kategori.");
      }
    };

    fetchCategories(); // Ambil kategori saat komponen dipasang

    const initializeQuill = async () => {
      if (editorRef.current && !quillInstance.current) {
        try {
          const { default: QuillEditor } = await import("quill");

          quillInstance.current = new QuillEditor(editorRef.current, {
            theme: "snow",
            placeholder: "Tulis konten di sini...",
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ script: "sub" }, { script: "super" }],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                ["blockquote", "code-block"],
                ["link", "image", "video"],
                [{ font: [] }],
                [{ size: [] }],
                ["clean"],
              ],
            },
          });

          if (quillInstance.current) {
            quillInstance.current.on("text-change", () => {
              setContent(quillInstance.current.root.innerHTML);
            });
          } else {
            console.error(
              "Instance editor Quill tidak diinisialisasi dengan benar."
            );
            setError("Gagal menginisialisasi editor konten.");
          }
        } catch (error) {
          console.error("Kesalahan menginisialisasi editor Quill: ", error);
          setError("Gagal menginisialisasi editor konten.");
        }
      }
    };

    initializeQuill();

    // Ambil authorId dari localStorage saat komponen dipasang
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Asumsi data pengguna memiliki properti 'id' atau 'authorId'
        setAuthorId(user.id || user.authorId);
      } catch (error) {
        console.error("Gagal memparse data pengguna dari localStorage:", error);
      }
    }
  }, []); // Array kosong memastikan efek hanya berjalan sekali saat dipasang

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeadline(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target);

    // Tambahkan authorId ke FormData
    if (authorId) {
      formData.append("authorId", authorId);
    } else {
      setError("Author tidak ditemukan. Silakan login kembali.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData?.error || "Terjadi kesalahan saat menyimpan postingan.";
        throw new Error(
          `Gagal membuat postingan: ${response.status} - ${errorMessage}`
        );
      }

      const data = await response.json();
      console.log("Postingan berhasil dibuat:", data);
      router.push("/author/posting"); // Redirect setelah berhasil
    } catch (error) {
      console.error("Kesalahan membuat postingan:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/author/");
  };

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center items-center px-4">
      <div className="w-full max-w-4xl p-6 bg-white shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          ➕ Tambah Postingan
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gambar Utama */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Gambar Utama
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
              name="headline" // Pastikan nama sesuai dengan yang diharapkan backend
            />
            {headline && (
              <div className="mt-4">
                <img
                  src={headline}
                  alt="Headline"
                  className="max-w-full h-auto rounded-md shadow-md"
                  width={150}
                  height={150}
                />
              </div>
            )}
          </div>

          {/* Judul */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Judul Postingan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul"
              className="w-full p-2 border rounded"
              required
              name="title" // Pastikan nama sesuai dengan yang diharapkan backend
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-lg font-medium mb-2">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
              required
              name="categoryId" // Pastikan nama sesuai dengan yang diharapkan backend
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {/* Gunakan ID sebagai nilai */}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Editor Teks Kaya (Quill) */}
          <div>
            <label className="block text-lg font-medium mb-2">Konten</label>
            <div
              ref={editorRef}
              style={{
                height: "400px",
                marginBottom: "20px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <input
              type="hidden"
              name="content" // Pastikan nama sesuai dengan yang diharapkan backend
              value={content}
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
            disabled={isLoading} // Nonaktifkan tombol saat loading
          >
            {isLoading ? (
              <span>Menyimpan...</span> // Tampilkan teks "Menyimpan..." saat loading
            ) : (
              <span>Simpan Postingan</span>
            )}
          </button>

          {/* Spinner Loading */}
          {isLoading && (
            <div className="flex justify-center mt-4">
              <div className="w-8 h-8 border-4 border-t-4 border-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
