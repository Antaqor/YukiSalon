"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { IconType } from "react-icons";
import { FaCut, FaSpa, FaBroom, FaUserNinja } from "react-icons/fa";

interface Category {
    _id: string;
    name: string;
    subServices: string[];
}

interface SalonRef {
    _id: string;
    name: string;
}

interface Service {
    _id: string;
    name: string;
    price: number;
    durationMinutes: number;
    salon?: SalonRef;
    category?: string | { _id: string };
    averageRating?: number;
    reviewCount?: number;
}

interface SearchParams {
    term?: string;
    categoryId?: string;
}

const categoryIcons: Record<string, IconType> = {
    Hair: FaCut,
    Barber: FaUserNinja,
    Nail: FaSpa,
    Beauty: FaBroom,
};

function CategorySkeletonRow() {
    return (
        <div className="flex flex-wrap justify-center gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-20 h-8 bg-gray-200 rounded-full animate-pulse" />
            ))}
        </div>
    );
}

function ServiceSkeletonGrid() {
    return (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-gray-200">
            {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="bg-white p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 w-1/2 mb-3 rounded" />
                    <div className="h-3 bg-gray-200 w-3/4 mb-2 rounded" />
                    <div className="h-3 bg-gray-200 w-1/2 mb-2 rounded" />
                </li>
            ))}
        </ul>
    );
}

export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // ---------- 1) Fetch Categories ----------
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError("");

                const catRes = await axios.get<Category[]>("http://152.42.243.146/api/categories");
                const sorted = catRes.data.sort((a, b) => a.name.localeCompare(b.name));
                setCategories(sorted);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Категори ачаалж чадсангүй.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // ---------- 2) Fetch / Search Services ----------
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                setError("");

                const params: SearchParams = {};
                if (searchTerm) params.term = searchTerm;
                if (selectedCategoryId) params.categoryId = selectedCategoryId;

                const res = await axios.get<Service[]>("http://152.42.243.146/api/search", { params });
                setServices(res.data);
            } catch (err) {
                console.error("Error searching services:", err);
                setError("Үйлчилгээ хайлт амжилтгүй.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [searchTerm, selectedCategoryId]);

    function getCategoryIcon(catName: string) {
        const Icon = categoryIcons[catName] || null;
        if (!Icon) return null;
        return <Icon className="inline-block mr-1 text-sm" />;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 font-sans relative bg-white">
            {/* CSS for typed text with extra space */}
            <style jsx>{`
        .text-wrapper {
          position: relative;
          display: inline-block;
        }
        .normal-text {
          transition: opacity 0.3s;
        }
        .retype-text {
          position: absolute;
          left: 0;
          top: 0;
          white-space: nowrap;
          overflow: hidden;
          display: inline-block;
          width: 0;
          box-sizing: content-box;
          border-right: 2px solid #333;
          opacity: 0;
          /* extra space so last letter isn't cut off */
          padding-right: 0.5em;
        }
        .group:hover .normal-text {
          opacity: 0;
        }
        /* Speed up typing => ~1s, 18 steps, and final width 105% */
        .group:hover .retype-text {
          opacity: 1;
          animation:
            typing 1s steps(18, end) forwards,
            blink 0.6s infinite step-end alternate;
        }
        @keyframes typing {
          0% {
            width: 0;
          }
          100% {
            width: 105%;
          }
        }
        @keyframes blink {
          50% {
            border-color: transparent;
          }
        }
        .group:hover .salon-name {
          color: #1d4ed8;
        }
        .salon-name {
          transition: color 0.3s;
        }
      `}</style>
            {/* SEARCH BAR */}
            <div className="mb-6 max-w-lg mx-auto">
                <label
                    htmlFor="serviceSearch"
                    className="block mb-2 font-medium text-gray-700 text-base"
                >
                    Хайлт
                </label>
                <input
                    id="serviceSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Жишээ: 'үс', 'сахал'..."
                    className="w-full rounded border border-gray-300 py-3 px-4 text-base focus:outline-none focus:border-gray-700 transition-colors"
                />
            </div>

            {/* Category pills */}
            {loading ? (
                <CategorySkeletonRow />
            ) : (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    <button
                        onClick={() => setSelectedCategoryId(null)}
                        className={`px-5 py-2 rounded-full border text-sm font-medium ${
                            !selectedCategoryId
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        Бүх үйлчилгээ
                    </button>
                    {categories.map((cat) => {
                        const isSelected = selectedCategoryId === cat._id;
                        const Icon = getCategoryIcon(cat.name);

                        return (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategoryId(isSelected ? null : cat._id)}
                                className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors
                ${
                                    isSelected
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {Icon}
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Errors */}
            {error && (
                <p className="text-red-600 mb-4 text-center font-medium">{error}</p>
            )}
            {loading && <ServiceSkeletonGrid />}

            {!loading && !error && services.length === 0 && (
                <p className="text-gray-500 text-center mt-6">
                    Ямар нэг үйлчилгээ олдсонгүй.
                </p>
            )}

            {!loading && !error && services.length > 0 && (
                <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-gray-200">
                    {services.map((svc) => {
                        const salonId = svc.salon?._id;
                        const targetHref = salonId ? `/salons/${salonId}` : "#";

                        return (
                            <li
                                key={svc._id}
                                className="relative group bg-white p-6 transition-all"
                            >
                                <Link href={targetHref} className="block h-full">
                                    {/* Title container => normal + typed in same spot */}
                                    <div className="text-wrapper mb-2">
                                        <p className="normal-text text-sm text-gray-800 font-semibold">
                                            {svc.name}
                                        </p>
                                        <p
                                            className="retype-text text-sm text-gray-800 font-semibold"
                                            data-text={svc.name}
                                        >
                                            {svc.name}
                                        </p>
                                    </div>

                                    {/* Salon name fade to blue on hover */}
                                    <p className="salon-name text-xs text-gray-500 mb-2">
                                        {svc.salon ? svc.salon.name : "No salon"}
                                    </p>

                                    {/* Price & Duration */}
                                    <p className="text-xs text-gray-700">
                                        Үнэ: {svc.price.toLocaleString()}₮
                                    </p>
                                    <p className="text-xs text-gray-700 mb-2">
                                        Үргэлжлэх хугацаа: {svc.durationMinutes} мин
                                    </p>

                                    {/* Rating */}
                                    <div className="text-xs text-yellow-700">
                                        Үнэлгээ:{" "}
                                        {svc.averageRating && svc.averageRating > 0
                                            ? `${svc.averageRating.toFixed(1)} ★`
                                            : "N/A"}
                                        {svc.reviewCount && svc.reviewCount > 0
                                            ? ` (${svc.reviewCount} сэтгэгдэл${
                                                svc.reviewCount > 1 ? "" : ""
                                            })`
                                            : ""}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
