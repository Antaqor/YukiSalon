"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Category {
    _id: string;
    name: string;
    subServices: string[];
}

interface Service {
    _id: string;
    name: string;
    price: number;
    durationMinutes: number;
    salon?: {
        _id: string;
        name: string;
    };
    category?: string | { _id: string };
    // New fields from backend aggregator
    averageRating?: number;
    reviewCount?: number;
}

// Define a more specific type for our search parameters
interface SearchParams {
    term?: string;
    categoryId?: string;
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // 1) Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError("");

                const catRes = await axios.get<Category[]>("http://152.42.243.146/api/categories");
                setCategories(catRes.data);

                // Optional: auto-select "Barber" category
                const barberCat = catRes.data.find((cat) => cat.name.toLowerCase() === "barber");
                if (barberCat) {
                    setSelectedCategoryId(barberCat._id);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Error loading categories.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // 2) Perform search whenever searchTerm or selectedCategoryId changes
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                setError("");

                // Use the SearchParams interface instead of any
                const params: SearchParams = {};
                if (searchTerm) params.term = searchTerm;
                if (selectedCategoryId) params.categoryId = selectedCategoryId;

                const res = await axios.get<Service[]>("http://152.42.243.146/api/search", {
                    params,
                });
                setServices(res.data);
            } catch (err) {
                console.error("Error searching services:", err);
                setError("Error searching services.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [searchTerm, selectedCategoryId]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* SEARCH BAR */}
            <div className="mb-4">
                <label htmlFor="serviceSearch" className="block mb-1 font-medium">
                    Search Services
                </label>
                <input
                    id="serviceSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Try 'haircut' or 'beard'..."
                    className="border border-gray-300 rounded w-full p-2"
                />
            </div>

            {/* CATEGORY BUTTONS */}
            <div className="flex flex-wrap gap-3 mb-6">
                {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat._id;
                    return (
                        <button
                            key={cat._id}
                            onClick={() => setSelectedCategoryId(isSelected ? null : cat._id)}
                            className={`px-4 py-2 border rounded-full ${
                                isSelected ? "bg-gray-300" : "bg-white hover:bg-gray-100"
                            }`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            {/* ERROR / LOADING */}
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {loading && <p className="text-gray-500 mb-4">Loading...</p>}

            {/* SEARCH RESULTS */}
            {!loading && !error && services.length === 0 && (
                <p className="text-gray-500">No services found.</p>
            )}

            {!loading && !error && services.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((svc) => (
                        <Link href={`/services/${svc._id}`} key={svc._id} className="block border p-4 rounded">
                            <li>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold">{svc.name}</h3>
                                    <span className="text-sm text-gray-600">
                    ${svc.price} / {svc.durationMinutes} min
                  </span>
                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                    {svc.salon ? svc.salon.name : "No salon"}
                                </p>

                                {/* Show average rating & review count if available */}
                                <div className="mt-2 text-xs text-yellow-600">
                                    Rating:{" "}
                                    {svc.averageRating && svc.averageRating > 0
                                        ? `${svc.averageRating.toFixed(1)} ★`
                                        : "N/A"}
                                    {svc.reviewCount && svc.reviewCount > 0
                                        ? ` (${svc.reviewCount} review${svc.reviewCount > 1 ? "s" : ""})`
                                        : ""}
                                </div>
                            </li>
                        </Link>
                    ))}
                </ul>
            )}
        </div>
    );
}
