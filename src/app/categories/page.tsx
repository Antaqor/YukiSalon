//app/categories/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Category {
    _id: string;
    name: string;
    subServices: string[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            setError("");
            setLoading(true);
            try {
                // Fetch categories from backend
                const res = await axios.get("http://68.183.191.149/api/categories");
                setCategories(res.data);
                setFilteredCategories(res.data); // Initialize the filtered list
            } catch (err) {
                console.error(err);
                setError("Failed to fetch categories.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Filter logic for categories by name or sub-service
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (!term.trim()) {
            setFilteredCategories(categories);
            return;
        }

        const lowerTerm = term.toLowerCase();
        const filtered = categories.filter(
            (cat) =>
                cat.name.toLowerCase().includes(lowerTerm) ||
                cat.subServices.some((sub) => sub.toLowerCase().includes(lowerTerm))
        );
        setFilteredCategories(filtered);
    };

    if (error) {
        return <p className="p-4 text-red-600">{error}</p>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">All Categories</h1>

            {/* Search (optional) */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search categories or sub-services..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="border border-gray-300 rounded w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Loading skeleton or text */}
            {loading && (
                <div className="space-y-4">
                    <CategorySkeleton />
                    <CategorySkeleton />
                    <CategorySkeleton />
                </div>
            )}

            {/* If loaded but no categories found */}
            {!loading && filteredCategories.length === 0 && (
                <p className="text-gray-500">No categories found.</p>
            )}

            <ul className="space-y-6">
                {filteredCategories.map((cat) => (
                    <li key={cat._id} className="border p-4 rounded bg-white shadow-sm">
                        <h2 className="text-lg font-semibold">{cat.name}</h2>
                        <div className="mt-2">
                            <p className="font-semibold">Sub-Services:</p>
                            <ul className="list-disc list-inside ml-4 mt-1 text-gray-700">
                                {cat.subServices.map((sub, idx) => (
                                    <li key={idx}>{sub}</li>
                                ))}
                            </ul>
                        </div>
                        {/* Optional link to view services in this category */}
                        <Link
                            href={`/categories/${cat._id}/services`}
                            className="inline-block bg-black text-white px-4 py-2 mt-4 rounded hover:bg-gray-800 transition-colors"
                        >
                            View Services in {cat.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Simple skeleton component for categories loading.
 */
function CategorySkeleton() {
    return (
        <div className="animate-pulse border border-gray-200 rounded p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
    );
}