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

    const BASE_URL = "https://www.vone.mn";

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
                login(user, token);
                router.push("/");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Нэвтрэх алдаа.");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <h1 className="text-3xl font-bold text-black dark:text-white">Нэвтрэх</h1>
                {error && <p className="text-red-600">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-black dark:text-white mb-1">
                            Хэрэглэгчийн нэр
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 dark:border-black rounded-md px-3 py-2 text-black dark:text-white bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Хэрэглэгчийн нэр"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black dark:text-white mb-1">
                            Нууц үг
                        </label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 dark:border-black rounded-md px-3 py-2 text-black dark:text-white bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Нууц үг"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700 dark:text-white">
                        <label className="flex items-center text-black dark:text-white">
                            <input type="checkbox" className="h-4 w-4 mr-2" />
                            Сануулах
                        </label>
                        <button
                            type="button"
                            onClick={() => alert("Forgot Password?")}
                            className="underline hover:text-blue-500"
                        >
                            Нууц үгээ мартсан?
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition"
                    >
                        Нэвтрэх
                    </button>
                </form>
                <button
                    onClick={() => router.push("/register")}
                    className="mt-6 block text-sm text-gray-500 underline hover:text-blue-500"
                >
                    Бүртгүүлэх
                </button>
            </div>
        </div>
    );
}
