"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
    FolderPlusIcon,
    ClockIcon,
    CurrencyDollarIcon,
    TagIcon,
} from "@heroicons/react/24/outline";

interface Category {
    _id: string;
    name: string;
}

export default function CreateServicePage() {
    const { data: session } = useSession();

    const [name, setName] = useState("");
    const [duration, setDuration] = useState<number>(30);
    const [price, setPrice] = useState<number>(50);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const catRes = await axios.get("http://68.183.191.149/api/categories");
                setCategories(catRes.data);
            } catch (err) {
                console.error("Ангиллыг татаж чадсангүй:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(""); // reset any old message

        // 1) Check if we have a session token
        if (!session?.user?.accessToken) {
            setMessage(
                "Нэвтэрсэн хэрэглэгчийн токен алга байна. Та нэвтэрч ороод дахин оролдоно уу."
            );
            return;
        }

        // 2) Validate form data
        if (!name.trim()) {
            setMessage("Үйлчилгээний нэр оруулна уу.");
            return;
        }
        if (duration <= 0) {
            setMessage("Үргэлжлэх хугацаа эерэг тоо байх ёстой.");
            return;
        }
        if (price < 0) {
            setMessage("Үнэ сөрөг байж болохгүй.");
            return;
        }
        if (!selectedCategoryId) {
            setMessage("Ангилал сонгоно уу.");
            return;
        }

        // 3) Submit to backend
        setIsSubmitting(true);
        try {
            const token = session.user.accessToken;

            const response = await axios.post(
                "http://68.183.191.149/api/services/my-service",
                {
                    name: name.trim(),
                    durationMinutes: duration,
                    price,
                    categoryId: selectedCategoryId,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 201) {
                setMessage("Шинэ үйлчилгээ амжилттай үүслээ!");
                setName("");
                setDuration(30);
                setPrice(50);
                setSelectedCategoryId("");
            } else {
                setMessage("Үйлчилгээ үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
            }
        } catch (error) {
            console.error("Алдаа гарлаа:", error);
            setMessage("Үйлчилгээ үүсгэх явцад алдаа гарлаа.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            <div className="flex-1 p-6">
                <div className="max-w-lg mx-auto">
                    <h1 className="flex items-center space-x-2 text-xl font-semibold mb-4 text-neutral-800">
                        <FolderPlusIcon className="w-5 h-5 text-blue-600" />
                        <span>Шинэ Үйлчилгээ Нэмэх</span>
                    </h1>

                    {/* Message / Error Handling */}
                    {message && (
                        <p className="mb-3 text-sm font-medium text-red-600 bg-red-50 p-2 rounded border border-red-200">
                            {message}
                        </p>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Service Name */}
                        <div>
                            <label
                                htmlFor="serviceName"
                                className="block mb-1 text-sm font-semibold text-gray-700"
                            >
                                <div className="flex items-center gap-1">
                                    <TagIcon className="w-4 h-4 text-gray-500" />
                                    Үйлчилгээний нэр
                                </div>
                            </label>
                            <input
                                id="serviceName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border border-neutral-300 focus:border-blue-500 focus:outline-none rounded px-3 py-2 w-full text-sm"
                                placeholder="Жишээ: Машины тос солих"
                                required
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label
                                htmlFor="duration"
                                className="block mb-1 text-sm font-semibold text-gray-700"
                            >
                                <div className="flex items-center gap-1">
                                    <ClockIcon className="w-4 h-4 text-gray-500" />
                                    Үргэлжлэх хугацаа (минут)
                                </div>
                            </label>
                            <input
                                id="duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                                className="border border-neutral-300 focus:border-blue-500 focus:outline-none rounded px-3 py-2 w-full text-sm"
                                min={1}
                                placeholder="30"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label
                                htmlFor="price"
                                className="block mb-1 text-sm font-semibold text-gray-700"
                            >
                                <div className="flex items-center gap-1">
                                    <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                                    Үнэ (₮)
                                </div>
                            </label>
                            <input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(parseInt(e.target.value, 10))}
                                className="border border-neutral-300 focus:border-blue-500 focus:outline-none rounded px-3 py-2 w-full text-sm"
                                min={0}
                                placeholder="50"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label
                                htmlFor="category"
                                className="block mb-1 text-sm font-semibold text-gray-700"
                            >
                                Ангилал
                            </label>
                            <select
                                id="category"
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className="border border-neutral-300 focus:border-blue-500 focus:outline-none rounded px-3 py-2 w-full text-sm"
                                required
                            >
                                <option value="">-- Ангилал сонгох --</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`flex items-center justify-center bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 transition ${
                                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Үүсгэж байна..." : "Үйлчилгээ үүсгэх"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
