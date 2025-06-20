"use client";

import React, { useEffect, useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  saleActive: boolean;
  salePrice: number;
  coverImageUrl?: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://www.vone.mn/api";

export default function BooksDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.username !== "Antaqor") {
      router.push("/");
    }
  }, [user, router]);

  const [books, setBooks] = useState<Book[]>([]);
  const [status, setStatus] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [saleActive, setSaleActive] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/books`);
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error(err);
        setStatus("Ном татаж чадсангүй!");
      }
    };
    fetchBooks();
  }, []);

  const handleCreateBook = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("");

    if (!title.trim()) {
      setStatus("Номын нэр оруулна уу!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("description", description);
      formData.append("price", price || "0");
      formData.append("saleActive", saleActive.toString());
      formData.append("salePrice", salePrice || "0");
      if (imageFile) formData.append("coverImage", imageFile);

      const res = await fetch(`${BACKEND_URL}/books`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Create book failed");

      const newBook = await res.json();
      setBooks((prev) => [newBook, ...prev]);

      setTitle("");
      setAuthor("");
      setDescription("");
      setPrice("");
      setSaleActive(false);
      setSalePrice("");
      setImageFile(null);
      if (imageRef.current) imageRef.current.value = "";

      setStatus("Ном амжилттай нэмлээ!");
    } catch (err) {
      console.error(err);
      setStatus("Алдаа гарлаа!");
    }
  };

  const handleUpdateBook = async (
    id: string,
    updated: Partial<Book>
  ) => {
    try {
      const res = await fetch(`${BACKEND_URL}/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Update fail");

      const up = await res.json();
      setBooks((prev) => prev.map((b) => (b._id === id ? up : b)));
      setStatus("Шинэчлэгдлээ!");
    } catch (err) {
      console.error(err);
      setStatus("Алдаа гарлаа!");
    }
  };

  const handleDeleteBook = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/books/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete fail");

      setBooks((prev) => prev.filter((b) => b._id !== id));
      setStatus("Устгагдлаа!");
    } catch (err) {
      console.error(err);
      setStatus("Алдаа гарлаа!");
    }
  };

  return (
    <main className="min-h-screen bg-white text-black px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold mb-2 text-center uppercase tracking-wider">
          Номын Админ Самбар
        </h1>

        {status && <p className="text-center text-red-400 mb-4">{status}</p>}

        <section className="bg-white border border-gray-300 p-4 rounded space-y-4">
          <h2 className="text-xl font-semibold">Ном нэмэх</h2>

          <form onSubmit={handleCreateBook} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <label className="block mb-1">Гарчиг</label>
                <input
                  className="w-full bg-gray-800 p-2 rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1">Зохиогч</label>
                <input
                  className="w-full bg-gray-800 p-2 rounded"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1">Тайлбар</label>
                <textarea
                  className="w-full bg-gray-800 p-2 rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block mb-1">Үнэ (₮)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 p-2 rounded"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <label>Хямдрал?</label>
                <input
                  type="checkbox"
                  checked={saleActive}
                  onChange={(e) => setSaleActive(e.target.checked)}
                />
                <label>Sale Price:</label>
                <input
                  type="number"
                  className="bg-gray-800 p-2 rounded w-24"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1">Зураг (optional)</label>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                  }}
                  className="text-white"
                />
              </div>

              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded mt-2">
                Нэмэх
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Одоогийн номнууд</h2>

          <div className="space-y-3">
            {books.map((b) => (
              <BookRow
                key={b._id}
                book={b}
                onUpdate={handleUpdateBook}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function BookRow({
  book,
  onUpdate,
  onDelete,
}: {
  book: Book;
  onUpdate: (id: string, updated: Partial<Book>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description);
  const [price, setPrice] = useState(book.price);
  const [saleActive, setSaleActive] = useState(book.saleActive);
  const [salePrice, setSalePrice] = useState(book.salePrice);

  return (
    <div className="bg-white border border-gray-300 p-4 rounded flex flex-col md:flex-row gap-4 items-start">
      <div className="w-24 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
        {book.coverImageUrl ? (
          <Image
            src={`https://www.vone.mn/${book.coverImageUrl}`}
            alt={book.title}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Зураг байхгүй
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="text-sm text-gray-700">Гарчиг</label>
          <input
            className="w-full bg-gray-100 p-1 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-700">Зохиогч</label>
          <input
            className="w-full bg-gray-100 p-1 rounded"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="col-span-1">
          <label className="text-sm text-gray-300">Үнэ (₮)</label>
          <input
            type="number"
            className="w-full bg-gray-800 p-1 rounded"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-700">Тайлбар</label>
          <textarea
            className="w-full bg-gray-100 p-1 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="col-span-2 flex items-center gap-3">
          <label className="text-sm text-gray-700">Хямдрал?</label>
          <input
            type="checkbox"
            checked={saleActive}
            onChange={(e) => setSaleActive(e.target.checked)}
          />
          <label className="text-sm text-gray-700">Sale Price:</label>
          <input
            type="number"
            className="bg-gray-100 p-1 rounded w-20"
            value={salePrice}
            onChange={(e) => setSalePrice(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 justify-center">
        <button
          onClick={() =>
            onUpdate(book._id, {
              title,
              author,
              description,
              price,
              saleActive,
              salePrice,
            })
          }
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500"
        >
          Шинэчлэх
        </button>
        <button
          onClick={() => onDelete(book._id)}
          className="px-3 py-1 bg-red-600 rounded hover:bg-red-500"
        >
          Устгах
        </button>
      </div>
    </div>
  );
}
