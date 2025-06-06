// BookDetailPage.tsx (e.g., in /src/pages/book/[bookId].tsx)
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BuyButton from "@/app/components/BuyButton";

interface Book {
    _id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    coverImageUrl: string;
    saleActive: boolean;
    salePrice: number;
}

export default function BookDetailPage() {
    const params = useParams();
    const bookId = params.bookId as string;

    const [book, setBook] = useState<Book | null>(null);
    const [status, setStatus] = useState("");
    const BACKEND_URL = "https://www.vone.mn/api";

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/books/${bookId}`);
                if (!res.ok) throw new Error("Failed to fetch book");
                const data = await res.json();
                setBook(data);
            } catch (error) {
                console.error(error);
                setStatus("Энэ номыг дуудахад алдаа гарлаа!");
            }
        };
        if (bookId) fetchBook();
    }, [bookId]);

    if (!book) {
        return (
            <div className="min-h-screen bg-black text-black p-8">
                <p className="text-center text-red-500">{status || "Уншиж байна..."}</p>
            </div>
        );
    }

    const finalPrice = book.saleActive ? book.salePrice : book.price;

    return (
        <main className="min-h-screen bg-white text-black py-8 px-4">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/2 bg-[#16181C] rounded flex items-center justify-center overflow-hidden">
                    {book.coverImageUrl ? (
                        <img
                            src={`https://www.vone.mn/${book.coverImageUrl}`}
                            alt={book.title}
                            className="object-cover w-full h-auto hover:scale-[1.01] transition duration-300"
                        />
                    ) : (
                        <p className="text-gray-500 p-4">No cover available</p>
                    )}
                </div>
                <div className="flex-1 flex flex-col space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold uppercase tracking-wide">{book.title}</h1>
                        <p className="text-gray-400 text-sm">Зохиогч: {book.author}</p>
                    </div>
                    <div className="text-sm text-black leading-relaxed">
                        <h2 className="text-lg font-semibold mb-2 uppercase tracking-wider text-[#1D9BF0]">
                            Номын Танилцуулга
                        </h2>
                        <p>{book.description}</p>
                    </div>
                    <div className="border-t border-gray-700 pt-4 space-y-2">
                        {book.saleActive ? (
                            <div>
                                <p className="text-md text-gray-500 line-through">
                                    {book.price.toLocaleString("mn-MN")}₮
                                </p>
                                <p className="text-2xl font-bold text-red-500">
                                    Хямдралтай: {book.salePrice.toLocaleString("mn-MN")}₮
                                </p>
                            </div>
                        ) : (
                            <p className="text-xl font-bold text-black">
                                Үнэ: {finalPrice.toLocaleString("mn-MN")}₮
                            </p>
                        )}
                        <div>
                            <BuyButton bookId={book._id} finalPrice={finalPrice} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
