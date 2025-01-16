"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

// Types
interface Category {
    _id: string;
    name: string;
}
interface Salon {
    _id: string;
    name: string;
}
interface RegisterResponse {
    message: string;
}
interface ErrorResponse {
    error: string;
}

export default function RegisterPage() {
    const router = useRouter();

    // Common user fields
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Role can be either "owner" or "stylist"
    const [role, setRole] = useState<"owner" | "stylist">("owner");

    // For owners
    const [salonName, setSalonName] = useState("");
    const [salonLogo, setSalonLogo] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    // For stylists
    const [allSalons, setAllSalons] = useState<Salon[]>([]);
    const [selectedSalonId, setSelectedSalonId] = useState("");

    // Categories
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");

    /**
     * Fetch categories & salons
     */
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [catRes, salonsRes] = await Promise.all([
                    axios.get<Category[]>("http://68.183.191.149/api/categories"),
                    axios.get<Salon[]>("http://68.183.191.149/api/salons"),
                ]);
                setCategories(catRes.data);
                setAllSalons(salonsRes.data); // existing salons
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        }
        fetchInitialData();
    }, []);

    /**
     * Handle registration
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const payload: Record<string, any> = {
                username,
                phoneNumber,
                email,
                password,
                role,
            };

            if (role === "owner") {
                payload.salonName = salonName;
                payload.salonLogo = salonLogo;
                payload.categoryId = selectedCategoryId || "";
            } else {
                // If stylist, attach the existing salon
                payload.selectedSalonId = selectedSalonId;
            }

            const response = await axios.post<RegisterResponse>(
                "http://68.183.191.149/api/auth/register",
                payload
            );

            if (response.status === 201) {
                alert("Бүртгэл амжилттай!");
                router.push("/login");
            } else {
                setError("Бүртгэл амжилтгүй. Дахин оролдоно уу.");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ErrorResponse>;
                setError(axiosError.response?.data.error || "Бүртгэлийн алдаа.");
            } else {
                setError("Тодорхойгүй алдаа гарлаа.");
            }
            console.error("Registration error:", err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col space-y-6"
            >
                {error && <p className="text-red-500 text-center font-medium">{error}</p>}

                {/* Username */}
                <div className="flex flex-col">
                    <label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Хэрэглэгчийн нэр
                    </label>
                    <input
                        id="username"
                        type="text"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Phone number */}
                <div className="flex flex-col">
                    <label
                        htmlFor="phoneNumber"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Утасны дугаар
                    </label>
                    <input
                        id="phoneNumber"
                        type="text"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Имэйл
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Нууц үг
                    </label>
                    <input
                        id="password"
                        type="password"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Choose role */}
                <div className="flex flex-col">
                    <label
                        htmlFor="role"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Роль
                    </label>
                    <select
                        id="role"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={role}
                        onChange={(e) => setRole(e.target.value as "owner" | "stylist")}
                    >
                        <option value="owner">Owner</option>
                        <option value="stylist">Stylist</option>
                    </select>
                </div>

                {/** Owner Fields */}
                {role === "owner" && (
                    <>
                        <div className="flex flex-col">
                            <label
                                htmlFor="salonName"
                                className="text-sm font-medium text-gray-700 mb-2"
                            >
                                Салоны нэр
                            </label>
                            <input
                                id="salonName"
                                type="text"
                                className="rounded-lg bg-gray-100 border-0 p-3"
                                value={salonName}
                                onChange={(e) => setSalonName(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label
                                htmlFor="category"
                                className="text-sm font-medium text-gray-700 mb-2"
                            >
                                Үндсэн ангилал (Сонголт)
                            </label>
                            <select
                                id="category"
                                className="rounded-lg bg-gray-100 border-0 p-3"
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                            >
                                <option value="">-- Ангилал сонгох --</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/** Stylist Fields */}
                {role === "stylist" && (
                    <div className="flex flex-col">
                        <label
                            htmlFor="assignedSalon"
                            className="text-sm font-medium text-gray-700 mb-2"
                        >
                            Салон сонгох
                        </label>
                        <select
                            id="assignedSalon"
                            className="rounded-lg bg-gray-100 border-0 p-3"
                            value={selectedSalonId}
                            onChange={(e) => setSelectedSalonId(e.target.value)}
                            required
                        >
                            <option value="">-- Салон сонгох --</option>
                            {allSalons.map((salon) => (
                                <option key={salon._id} value={salon._id}>
                                    {salon.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    type="submit"
                    className="bg-neutral-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                    Бүртгэл үүсгэх
                </button>
            </form>
        </div>
    );
}
