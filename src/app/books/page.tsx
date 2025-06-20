"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import type { Book } from "../lib/books";

export default function BooksPage() {
  const { user, loggedIn, loading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://www.vone.mn/api";
  const BASE_URL = "https://www.vone.mn";

  const isPro =
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date();

  useEffect(() => {
    fetch(`${BACKEND_URL}/books`)
      .then((res) => res.json())
      .then(setBooks)
      .catch(() => {});
  }, []);

  if (!loggedIn && !loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Link href="/login" className="text-blue-600 underline">
          Нэвтэрч орно уу
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Цахим Номын Сан</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {books.map((book) => (
          <div
            key={book._id}
            className="bg-white rounded-lg shadow p-4 flex flex-col"
          >
            <div className="h-48 mb-3 overflow-hidden rounded">
              {book.coverImageUrl ? (
                <Image
                  src={`${BASE_URL}/${book.coverImageUrl}`}
                  alt={book.title}
                  width={400}
                  height={192}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>
            <h2 className="font-semibold text-lg">{book.title}</h2>
            <p className="text-sm text-gray-500 mb-2">{book.author}</p>
            {book.description && (
              <p className="text-gray-700 flex-1 overflow-hidden">
                {book.description}
              </p>
            )}
            <div className="mt-3">
              {book.saleActive ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-red-600 font-bold">
                    {book.salePrice?.toLocaleString()}₮
                  </span>
                  <span className="line-through text-gray-400 text-sm">
                    {book.price?.toLocaleString()}₮
                  </span>
                </div>
              ) : (
                <span className="font-bold">
                  {book.price?.toLocaleString()}₮
                </span>
              )}
            </div>
            <div className="mt-4">
              {isPro ? (
                <button className="w-full bg-green-600 text-white py-2 rounded">
                  Унших
                </button>
              ) : (
                <Link
                  href="/subscription"
                  className="w-full block bg-blue-600 text-white text-center py-2 rounded"
                >
                  Гишүүнчлэл хэрэгтэй
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
