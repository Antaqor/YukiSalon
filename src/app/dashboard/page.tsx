"use client";
import React, { useEffect, useState, useRef, FormEvent } from "react";

// Book interface
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

const BACKEND_URL = "https://vone.mn/api";

export default function BookDashboardPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [status, setStatus] = useState("");

    // ----- NEW Book form states -----
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [saleActive, setSaleActive] = useState(false);
    const [salePrice, setSalePrice] = useState("");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    // GET existing books
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
            if (coverFile) {
                formData.append("coverImage", coverFile);
            }

            const res = await fetch(`${BACKEND_URL}/books`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Create book failed");
            const newBook = await res.json();

            // reset form
            setTitle("");
            setAuthor("");
            setDescription("");
            setPrice("");
            setSaleActive(false);
            setSalePrice("");
            setCoverFile(null);
            if (coverRef.current) coverRef.current.value = "";

            // add new book to local state
            setBooks((prev) => [newBook, ...prev]);
            setStatus("Ном амжилттай нэмлээ!");
        } catch (err) {
            console.error(err);
            setStatus("Алдаа гарлаа!");
        }
    };

    // Update Book
    const handleUpdateBook = async (bookId: string, updatedData: Partial<Book>) => {
        try {
            // For text fields only (no file). If want file, must do multipart again
            const res = await fetch(`${BACKEND_URL}/books/${bookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error("Update fail");
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
            if (!res.ok) throw new Error("Delete fail");
            setBooks((prev) => prev.filter((b) => b._id !== bookId));
            setStatus("Устгагдлаа!");
        } catch (err) {
            console.error(err);
            setStatus("Устгахад алдаа!");
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

                {/* 1) CREATE NEW BOOK FORM */}
                <section className="bg-[#16181C] border border-gray-700 p-4 rounded space-y-4">
                    <h2 className="text-xl font-semibold">Ном нэмэх</h2>
                    <form onSubmit={handleCreateBook} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left side form fields */}
                        <div className="space-y-2">
                            <div>
                                <label className="block mb-1">Номын нэр</label>
                                <input
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Жишээ: Next.js Reference"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Зохиогч</label>
                                <input
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Жишээ: Tesla Vision"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Тайлбар</label>
                                <textarea
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Номын дэлгэрэнгүй..."
                                />
                            </div>
                        </div>

                        {/* Right side form fields */}
                        <div className="space-y-2">
                            <div>
                                <label className="block mb-1">Үнэ (₮)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="Жишээ: 9900"
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
                                <label className="block mb-1">Ковер зураг (optional)</label>
                                <input
                                    ref={coverRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setCoverFile(e.target.files[0]);
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

                {/* 2) LIST & EDIT EXISTING BOOKS */}
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

/** Child: One row for editing an existing book */
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
            {/* Cover thumb */}
            <div className="w-24 h-24 bg-[#222] flex-shrink-0 overflow-hidden">
                {book.coverImageUrl && (
                    <img
                        src={`https://vone.mn/${book.coverImageUrl}`}
                        alt={book.title}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            {/* Inputs */}
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
                {/* sale */}
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

            {/* Action buttons */}
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
