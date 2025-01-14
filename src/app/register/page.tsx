"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

/** Ангиллын төрөл (заавал биш, хэрэв анхлан сонгох ангиллын жагсаалт хэрэгтэй бол) */
interface Category {
    _id: string;
    name: string;
}

/** Амжилттай бүртгэлийн хариултын төрөл */
interface RegisterResponse {
    message: string;
}

/** Алдааны хариултын төрөл */
interface ErrorResponse {
    error: string;
}

export default function RegisterPage() {
    const router = useRouter();

    // Хэрэглэгчийн үндсэн талбарууд
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Салоны мэдээллийг зэрэг үүсгэхийн тулд:
    const [salonName, setSalonName] = useState("");
    const [salonLogo, setSalonLogo] = useState(""); // base64 эсвэл URL хэлбэрээр
    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    // Хэрэв хэрэгтэй бол анхдагч ангиллуудын жагсаалт
    const [categories, setCategories] = useState<Category[]>([]);

    // Алдаа хадгалах state
    const [error, setError] = useState("");

    // Анх ачаалахад ангиллын жагсаалтыг авах (заавал биш)
    useEffect(() => {
        (async () => {
            try {
                const catRes = await axios.get<Category[]>("http://localhost:5001/api/categories");
                setCategories(catRes.data);
            } catch (err) {
                console.error("Ангиллуудыг уншихад алдаа:", err);
            }
        })();
    }, []);

    // Бүртгэлийн form илгээх
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            // /api/auth/register рүү role="owner" тайгаар илгээх
            const response = await axios.post<RegisterResponse>(
                "http://localhost:5001/api/auth/register",
                {
                    username,
                    phoneNumber,
                    email,
                    password,
                    role: "owner", // Үргэлж эзэн болгож хадгална

                    // Шинэ салон үүсгэх талбарууд
                    salonName,
                    salonLogo,
                    categoryId: selectedCategoryId || "",
                }
            );

            if (response.status === 201) {
                alert("Бүртгэл амжилттай! Салон мөн үүсэв.");
                // Хэрэглэгчийг login руу илгээх эсвэл автоматаар нэвтрүүлж болно
                router.push("/login");
            } else {
                setError("Бүртгэл амжилтгүй. Дахин оролдоно уу.");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                setError(axiosError.response?.data.error || "Бүртгэлийн алдаа.");
            } else {
                setError("Тодорхойгүй алдаа гарлаа.");
            }
            console.error("Бүртгэлийн алдаа:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 px-4">
            <h1 className="text-3xl font-semibold mb-8 text-center">
                Эзэмшигчийн бүртгэл
            </h1>

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col space-y-6"
            >
                {error && (
                    <p className="text-red-500 text-center font-medium">{error}</p>
                )}

                {/* Хэрэглэгчийн нэр */}
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

                {/* Утасны дугаар */}
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

                {/* Имэйл */}
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

                {/* Нууц үг */}
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

                {/* Салоны нэр */}
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
                        required
                    />
                </div>

                {/* Салоны лого (URL/base64) */}
                <div className="flex flex-col">
                    <label
                        htmlFor="salonLogo"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Салоны лого (URL/base64)
                    </label>
                    <input
                        id="salonLogo"
                        type="text"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={salonLogo}
                        onChange={(e) => setSalonLogo(e.target.value)}
                    />
                </div>

                {/* Үндсэн ангилал */}
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

                <button
                    type="submit"
                    className="bg-neutral-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                    Бүртгэл үүсгэх (Салонтой)
                </button>
            </form>
        </div>
    );
}