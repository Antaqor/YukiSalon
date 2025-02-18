"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username || !email || !password) {
            setError("Бүх талбаруудыг бөглөнө үү.");
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/register`, {
                username,
                email,
                password,
            });
            if (res.status === 201) {
                setSuccess("Ажилттай бүртгэл үүсгэлээ");
                setUsername("");
                setEmail("");
                setPassword("");
            }
        } catch (err: any) {
            console.error("Register error:", err);
            setError(err.response?.data?.error || "Registration error");
        }
    };

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
                            Имэйл
                        </label>
                        <input
                            type="email"
                            className="w-full border-b border-gray-300 px-2 py-2 text-gray-900 focus:outline-none"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
