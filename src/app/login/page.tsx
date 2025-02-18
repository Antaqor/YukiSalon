"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/login`, {
                username,
                password,
            });
            if (res.status === 200 && res.data.token) {
                const { user, token } = res.data;
                // Save user & token to AuthContext
                login(user, token);
                router.push("/");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Нэвтрэх алдаа.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
            <div className="w-full max-w-sm p-6">
                <h1 className="text-2xl font-bold mb-4 text-black">Нэвтрэх</h1>
                {error && <p className="text-red-600 mb-3">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                            Хэрэглэгчийн нэр
                        </label>
                        <input
                            type="text"
                            className="w-full border-b border-gray-300 px-2 py-2 text-gray-900 focus:outline-none"
                            placeholder="Хэрэглэгчийн нэр"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
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
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-gray-700">
                            <input type="checkbox" className="h-4 w-4 mr-1" />
                            Remember me
                        </label>
                        <button
                            type="button"
                            onClick={() => alert("Forgot Password?")}
                            className="underline text-gray-700"
                        >
                            Forgot Password
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 text-sm font-semibold hover:bg-gray-900 transition"
                    >
                        Нэвтрэх
                    </button>
                </form>

                <button
                    onClick={() => router.push("/register")}
                    className="mt-4 block text-sm text-gray-700 underline"
                >
                    Бүртгүүлэх
                </button>
            </div>
        </div>
    );
}
