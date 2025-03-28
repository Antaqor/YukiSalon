"use client";
import React, { useEffect, useState, useRef, FormEvent } from "react";

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

const BACKEND_URL = "http://localhost:5001/api";

export default function BookDashboardPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [status, setStatus] = useState("");

    // NEW Book form states
    const [newTitle, setNewTitle] = useState("");
    const [newAuthor, setNewAuthor] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newSaleActive, setNewSaleActive] = useState(false);
    const [newSalePrice, setNewSalePrice] = useState("");
    const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    // Fetch existing books on mount
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/books`);
                if (!res.ok) throw new Error("Failed to fetch books");
                const data = await res.json();
                setBooks(data);
            } catch (err) {
                console.error(err);
                setStatus("Номыг татахад алдаа гарлаа!");
            }
        };
        fetchBooks();
    }, []);

    // Create new book (POST)
    const handleCreateBook = async (e: FormEvent) => {
        e.preventDefault();
        setStatus("");

        if (!newTitle.trim()) {
            setStatus("Номын нэрээ оруулаач!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", newTitle);
            formData.append("author", newAuthor);
            formData.append("description", newDescription);
            formData.append("price", newPrice || "0");
            formData.append("saleActive", newSaleActive.toString());
            formData.append("salePrice", newSalePrice || "0");
            if (newCoverFile) {
                formData.append("coverImage", newCoverFile);
            }

            const res = await fetch(`${BACKEND_URL}/books`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Create book failed");
            const newBook = await res.json();

            // Reset form
            setNewTitle("");
            setNewAuthor("");
            setNewDescription("");
            setNewPrice("");
            setNewSaleActive(false);
            setNewSalePrice("");
            setNewCoverFile(null);
            if (coverRef.current) coverRef.current.value = "";

            // Update local state
            setBooks((prev) => [newBook, ...prev]);
            setStatus("Ном амжилттай нэмлээ!");
        } catch (err) {
            console.error(err);
            setStatus("Алдаа гарлаа. Дахин оролд!");
        }
    };

    // Update Book (via child component)
    const handleUpdateBook = async (bookId: string, updatedData: Partial<Book>) => {
        try {
            const res = await fetch(`${BACKEND_URL}/books/${bookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error("Update failed");
            const updatedBook = await res.json();
            setBooks((prev) =>
                prev.map((b) => (b._id === bookId ? updatedBook : b))
            );
            setStatus("Номыг шинэчиллээ!");
        } catch (err) {
            console.error(err);
            setStatus("Алдаа гарлаа!");
        }
    };

    // Delete Book
    const handleDeleteBook = async (bookId: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/books/${bookId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete failed");
            setBooks((prev) => prev.filter((b) => b._id !== bookId));
            setStatus("Ном устгагдлаа!");
        } catch (err) {
            console.error(err);
            setStatus("Устгахад алдаа гарлаа!");
        }
    };

    return (
        <main className="min-h-screen bg-black text-gray-100 px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-10">
                <h1 className="text-3xl font-bold mb-2 text-center uppercase tracking-wider">
                    Номын Админ Самбар
                </h1>
                {status && (
                    <p className="text-center text-red-400 mb-4">{status}</p>
                )}

                {/* CREATE NEW BOOK FORM */}
                <section className="bg-[#16181C] border border-gray-700 p-4 rounded space-y-4">
                    <h2 className="text-xl font-semibold">Ном нэмэх</h2>
                    <form onSubmit={handleCreateBook} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left side */}
                        <div className="space-y-2">
                            <div>
                                <label className="block mb-1">Номын нэр</label>
                                <input
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Жишээ: Next.js Reference"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Зохиогч</label>
                                <input
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={newAuthor}
                                    onChange={(e) => setNewAuthor(e.target.value)}
                                    placeholder="Жишээ: Tesla Vision"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Тайлбар</label>
                                <textarea
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Номын дэлгэрэнгүй..."
                                />
                            </div>
                        </div>
                        {/* Right side */}
                        <div className="space-y-2">
                            <div>
                                <label className="block mb-1">Үнэ (₮)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    placeholder="Жишээ: 9900"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label>Хямдрал?</label>
                                <input
                                    type="checkbox"
                                    checked={newSaleActive}
                                    onChange={(e) => setNewSaleActive(e.target.checked)}
                                />
                                <label>Sale Price:</label>
                                <input
                                    type="number"
                                    className="bg-gray-800 p-2 rounded w-24"
                                    value={newSalePrice}
                                    onChange={(e) => setNewSalePrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Ковер зураг (optional)</label>
                                <input
                                    ref={coverRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setNewCoverFile(e.target.files[0]);
                                        }
                                    }}
                                    className="text-white"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={false}
                                    className="px-4 py-2 bg-blue-600 text-white rounded mt-2"
                                >
                                    Нэмэх
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* LIST & EDIT EXISTING BOOKS */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Одоо байгаа номууд</h2>
                    <div className="space-y-3">
                        {books.map((book) => (
                            <BookRow
                                key={book._id}
                                book={book}
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

// Child Component: BookRow
function BookRow({
                     book,
                     onUpdate,
                     onDelete,
                 }: {
    book: Book;
    onUpdate: (bookId: string, updatedFields: Partial<Book>) => Promise<void>;
    onDelete: (bookId: string) => Promise<void>;
}) {
    const [title, setTitle] = useState(book.title);
    const [author, setAuthor] = useState(book.author);
    const [description, setDescription] = useState(book.description);
    const [price, setPrice] = useState(book.price);
    const [saleActive, setSaleActive] = useState(book.saleActive);
    const [salePrice, setSalePrice] = useState(book.salePrice);

    return (
        <div className="bg-[#16181C] border border-gray-700 p-4 rounded flex flex-col md:flex-row gap-4 items-start">
            {/* Cover Thumbnail */}
            <div className="w-24 h-24 bg-[#222] flex-shrink-0 overflow-hidden">
                {book.coverImageUrl && (
                    <img
                        src={`https://vone.mn/${book.coverImageUrl}`}
                        alt={book.title}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            {/* Editable Fields */}
            <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="col-span-2">
                    <label className="text-sm text-gray-300">Номын нэр</label>
                    <input
                        className="w-full bg-gray-800 p-1 rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-sm text-gray-300">Зохиогч</label>
                    <input
                        className="w-full bg-gray-800 p-1 rounded"
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
                    <label className="text-sm text-gray-300">Тайлбар</label>
                    <textarea
                        className="w-full bg-gray-800 p-1 rounded"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                    <label className="text-sm text-gray-300">Хямдрал?</label>
                    <input
                        type="checkbox"
                        checked={saleActive}
                        onChange={(e) => setSaleActive(e.target.checked)}
                    />
                    <label className="text-sm text-gray-300">Sale Price:</label>
                    <input
                        type="number"
                        className="bg-gray-800 p-1 rounded w-20"
                        value={salePrice}
                        onChange={(e) => setSalePrice(Number(e.target.value))}
                    />
                </div>
            </div>
            {/* Action Buttons */}
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
                    className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 transition"
                >
                    Шинэчлэх
                </button>
                <button
                    onClick={() => onDelete(book._id)}
                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-500 transition"
                >
                    Устгах
                </button>
            </div>
        </div>
    );
}
