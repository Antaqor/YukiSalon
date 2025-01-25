"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("");
    const [mbti, setMbti] = useState(""); // MBTI төлөв нэмэх
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username || !password || !age || !mbti) { // MBTI-г шалгах
            setError("Бүх талбаруудыг бөглөнө үү.");
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/register`, {
                username,
                password,
                age,
                mbti, // MBTI-г оруулах
            });
            if (res.status === 201) {
                setSuccess("Ажилттай бүртгэл үүсгэлээ");
                setUsername("");
                setPassword("");
                setAge("");
                setMbti(""); // MBTI-г цэвэрлэх
            }
        } catch (err: any) {
            console.error("Register error:", err);
            setError(err.response?.data?.error || "Registration error");
        }
    };

    // 16 MBTI төрөл
    const mbtiOptions = [
        "INTJ", "INTP", "ENTJ", "ENTP",
        "INFJ", "INFP", "ENFJ", "ENFP",
        "ISTJ", "ISFJ", "ESTJ", "ESFJ",
        "ISTP", "ISFP", "ESTP", "ESFP"
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
            <div className="w-full max-w-sm p-6">
                <h2 className="text-2xl font-bold mb-4 text-black">Бүртгүүлэх</h2>
                {error && <p className="text-red-600 mb-3">{error}</p>}
                {success && <p className="text-green-600 mb-3">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                            Хэрэглэгчийн нэр
                        </label>
                        <input
                            className="w-full border-b border-gray-300 px-2 py-2 text-gray-900 focus:outline-none"
                            placeholder="Жишээ: user123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                            Нууц үг
                        </label>
                        <input
                            type="password"
                            className="w-full border-b border-gray-300 px-2 py-2 text-gray-900 focus:outline-none"
                            placeholder="Нууц үг"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                            Нас
                        </label>
                        <input
                            type="number"
                            className="w-full border-b border-gray-300 px-2 py-2 text-gray-900 focus:outline-none"
                            placeholder="Жишээ: 25"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                            MBTI төрөл
                        </label>
                        <select
                            className="w-full border-b border-gray-300 px-2 py-2 text-gray-900 focus:outline-none"
                            value={mbti}
                            onChange={(e) => setMbti(e.target.value)}
                        >
                            <option value="">Сонгоно уу</option>
                            {mbtiOptions.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="w-full bg-black text-white py-2 text-sm font-semibold hover:bg-gray-900 transition"
                        type="submit"
                    >
                        Бүртгүүлэх
                    </button>
                </form>

                <button
                    onClick={() => router.push("/")}
                    className="mt-4 block text-sm text-gray-700 underline"
                >
                    Нүүр хуудас
                </button>
            </div>
        </div>
    );
}
