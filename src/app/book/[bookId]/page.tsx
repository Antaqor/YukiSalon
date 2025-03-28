import React, { useEffect, useState } from "react";

export default function BookDetailPage() {
    const [book, setBook] = useState(null);
    const [status, setStatus] = useState("");

    // Use an env variable for the backend URL
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vone.mn/api";

    // For image URLs, use the same env variable but adjust path accordingly
    const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vone.mn";

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/books/${bookId}`);
                if (!res.ok) throw new Error("Failed to fetch book");
                const data = await res.json();
                setBook(data);
            } catch (error) {
                console.error(error);
                setStatus("Error fetching book!");
            }
        };
        if (bookId) fetchBook();
    }, [bookId]);

    if (!book) return <div>{status || "Loading..."}</div>;

    return (
        <div>
            <h1>{book.title}</h1>
            <img
                src={`${IMAGE_BASE_URL}/${book.coverImageUrl}`}
                alt={book.title}
            />
            {/* other book details */}
        </div>
    );
}
