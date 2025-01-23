"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

/**
 * Extended shape of a Salon:
 * - 'logo' for the 50×50 logo
 * - 'coverImage' for a rectangular cover
 * - 'categoryName' for the primary category name
 */
interface Salon {
    _id: string;
    name: string;
    location: string;
    logo?: string;
    coverImage?: string;
    categoryName?: string;
}

export default function SalonsPage() {
    const [salons, setSalons] = useState<Salon[]>([]);
    const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 1) Fetch salons on mount
    useEffect(() => {
        const fetchSalons = async () => {
            setLoading(true);
            setError("");

            try {
                // This endpoint should return each salon with logo, coverImage, etc.
                const res = await axios.get("https://backend.foru.mn/api/salons");
                setSalons(res.data);
                setFilteredSalons(res.data);
            } catch (err) {
                console.error("Error fetching salons:", err);
                setError("Failed to fetch salons. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSalons();
    }, []);

    // 2) Handle search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (!term.trim()) {
            setFilteredSalons(salons);
            return;
        }
        const lowerTerm = term.toLowerCase();
        const results = salons.filter(
            (salon) =>
                salon.name.toLowerCase().includes(lowerTerm) ||
                salon.location.toLowerCase().includes(lowerTerm) ||
                (salon.categoryName && salon.categoryName.toLowerCase().includes(lowerTerm))
        );
        setFilteredSalons(results);
    };

    // If there's an error, show it
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
                <p className="text-red-500 text-center font-medium">{error}</p>
            </div>
        );
    }

    // 3) Render page
    return (
        <div className="min-h-screen bg-neutral-100 px-4 py-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-semibold mb-8 text-center tracking-wide">
                    All Salons
                </h1>

                {/* Search bar */}
                <div className="mb-8 max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Search by name, location, or category..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full rounded-lg bg-gray-100 border-0 p-3
             focus:ring-2 focus:ring-neutral-800 transition-colors"
                    />
                </div>

                {/* Loading => skeletons */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SalonSkeleton />
                        <SalonSkeleton />
                        <SalonSkeleton />
                    </div>
                )}

                {/* No results => message */}
                {!loading && filteredSalons.length === 0 && (
                    <p className="text-center text-gray-500">No salons found.</p>
                )}

                {/* Salon list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!loading &&
                        filteredSalons.map((salon) => {
                            const firstLetter = salon.name.trim().charAt(0).toUpperCase();

                            return (
                                <Link
                                    key={salon._id}
                                    href={`/salons/${salon._id}`}
                                    className="rounded-lg shadow-md bg-white
                    hover:bg-neutral-50 transition flex flex-col overflow-hidden"
                                >
                                    {/* Cover Image or solid placeholder (no text) */}
                                    {salon.coverImage && salon.coverImage.trim() !== "" ? (
                                        <img
                                            src={salon.coverImage}
                                            alt={`${salon.name} Cover`}
                                            className="h-32 w-full object-cover bg-gray-100"
                                        />
                                    ) : (
                                        <div className="h-32 w-full bg-gray-200" />
                                    )}

                                    {/* Content container: small logo or first letter + text */}
                                    <div className="p-4 flex items-center gap-3">
                                        {/* 50×50 logo or first letter */}
                                        {salon.logo && salon.logo.trim() !== "" ? (
                                            <img
                                                src={salon.logo}
                                                alt={`${salon.name} Logo`}
                                                className="h-12 w-12 object-contain rounded bg-gray-100 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 text-gray-700 flex items-center justify-center rounded flex-shrink-0 font-bold">
                                                {firstLetter}
                                            </div>
                                        )}

                                        {/* Salon info */}
                                        <div className="flex flex-col">
                                            <h2 className="text-sm font-semibold tracking-wide">
                                                {salon.name}
                                            </h2>
                                            {salon.categoryName && (
                                                <p className="text-xs text-gray-500 italic">
                                                    {salon.categoryName}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-600">{salon.location}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

/**
 * A Tesla-inspired skeleton card for loading
 * with space for cover image and a small 50×50 area.
 */
function SalonSkeleton() {
    return (
        <div className="animate-pulse rounded-lg shadow-md bg-white flex flex-col overflow-hidden">
            {/* Cover skeleton */}
            <div className="h-32 w-full bg-gray-200"></div>

            {/* Content container */}
            <div className="p-4 flex items-center gap-3">
                {/* Logo skeleton (50×50) */}
                <div className="h-12 w-12 bg-gray-200 rounded flex-shrink-0"></div>

                {/* Text lines */}
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        </div>
    );
}