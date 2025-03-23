"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

const Quill = dynamic(() => import("quill"), { ssr: false });
import "quill/dist/quill.snow.css";

const EditPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [headline, setHeadline] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [headlineFile, setHeadlineFile] = useState(null);
  const [isFeature, setIsFeature] = useState(false);
  const [authorId, setAuthorId] = useState(null);

  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Gagal mengambil kategori");
        setCategories(await response.json());
      } catch (error) {
        setError(error.message);
      }
    };

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
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                ["blockquote", "code-block"],
                ["link", "video"],
                [{ font: [] }],
                [{ size: [] }],
                ["clean"],
              ],
            },
          });
          quillInstance.current.on("text-change", () => {
            setContent(quillInstance.current.root.innerHTML);
          });
        } catch (error) {
          setError("Gagal menginisialisasi editor konten.");
        }
      }
    };

    fetchCategories();
    initializeQuill();
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setAuthorId(user.id || user.authorId);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) throw new Error("Gagal mengambil data postingan");

        const postData = await response.json();
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.id !== postData.authorId) {
          setError("Anda tidak memiliki izin untuk mengedit postingan ini.");
          router.push("/author/posting");
          return;
        }

        setTitle(postData.title);
        setContent(postData.content);
        setCategory(postData.categoryId);
        setHeadline(postData.headline);
        setIsFeature(postData.isFeature);
        if (quillInstance.current)
          quillInstance.current.root.innerHTML = postData.content;
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId, router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeadlineFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setHeadline(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const contentWithoutImages = content.replace(/<img[^>]*>/g, "");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", contentWithoutImages);
    formData.append("categoryId", category);
    if (headlineFile) formData.append("headline", headlineFile);
    formData.append("isFeature", isFeature);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Terjadi kesalahan saat menyimpan");
      router.push("/author/posting");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-full p-6 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="w-full max-w-4xl p-6 bg-white shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          ✏️ Edit Postingan
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">
              Gambar Utama
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
            />
            {headline && (
              <img
                src={headline}
                alt="Headline"
                className="mt-4 max-w-full h-auto rounded-md shadow-md"
              />
            )}
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">
              Judul Postingan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div ref={editorRef} className="border rounded p-2 min-h-[400px]" />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
