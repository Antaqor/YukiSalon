"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Book {
    _id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    coverImageUrl: string;
    saleActive: boolean;
    salePrice: number;
    createdAt?: string;
    updatedAt?: string;
}

export default function BooksListPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [status, setStatus] = useState("");

    // Production: replace with your production domain if needed.
    const BACKEND_URL = "https://vone.mn/api";
    // For local testing, you can use: "http://localhost:5001/api"

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/books`);
                if (!res.ok) throw new Error("Failed to fetch books");
                const data = await res.json();
                setBooks(data);
            } catch (error: any) {
                console.error(error);
                setStatus("Номыг татахад алдаа гарлаа!");
            }
        };
        fetchBooks();
    }, [BACKEND_URL]);

    return (
        <main className="min-h-screen bg-black text-gray-100 px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center tracking-wider uppercase">
                    Бүх Ном
                </h1>
                {status && (
                    <p className="text-red-500 mb-4 text-center">{status}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {books.map((book) => {
                        const finalPrice = book.saleActive ? book.salePrice : book.price;
                        return (
                            <Link
                                key={book._id}
                                href={`/book/${book._id}`}
                                className="group relative rounded-lg overflow-hidden
                           border border-gray-800 bg-[#16181C]
                           hover:shadow-lg hover:shadow-[#1D9BF0]/30
                           hover:-translate-y-1 hover:scale-[1.01]
                           transition-transform duration-300 flex flex-col"
                            >
                                {book.coverImageUrl ? (
                                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-black">
                                        <img
                                            src={`https://vone.mn/uploads/${book.coverImageUrl.split("/")[1]}`}
                                            alt={book.title}
                                            className="w-full h-full object-cover
                                 group-hover:opacity-90
                                 group-hover:scale-105 transition duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full aspect-[3/4] bg-[#222] flex items-center justify-center text-gray-500">
                                        No Cover
                                    </div>
                                )}
                                <div className="p-4 flex flex-col flex-1">
                                    <h2 className="text-lg font-semibold uppercase tracking-wide mb-1 line-clamp-1">
                                        {book.title}
                                    </h2>
                                    <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                                        Зохиогч: {book.author}
                                    </p>
                                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                        {book.description}
                                    </p>
                                    {book.saleActive ? (
                                        <div className="mt-auto space-y-1">
                                            <p className="text-sm text-gray-500 line-through">
                                                {book.price.toLocaleString("mn-MN")}₮
                                            </p>
                                            <p className="text-lg font-bold text-red-500">
                                                {book.salePrice.toLocaleString("mn-MN")}₮
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="mt-auto text-lg font-bold text-gray-200">
                                            {finalPrice.toLocaleString("mn-MN")}₮
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
