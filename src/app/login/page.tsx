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

    const BASE_URL = "https://vone.mn";

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
        <div className="h-full flex items-center justify-center bg-black">
            <div className="w-full max-w-sm p-8">
                <h1 className="text-3xl font-bold text-black">Нэвтрэх</h1>
                {error && <p className="text-red-600 ">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Хэрэглэгчийн нэр
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Хэрэглэгчийн нэр"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Нууц үг
                        </label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Нууц үг"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                        <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 mr-2" />
                            Remember me
                        </label>
                        <button
                            type="button"
                            onClick={() => alert("Forgot Password?")}
                            className="underline hover:text-gray-500"
                        >
                            Forgot Password
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gray-100 text-black py-3 rounded-md font-semibold hover:bg-gray-900 transition"
                    >
                        Нэвтрэх
                    </button>
                </form>
                <button
                    onClick={() => router.push("/register")}
                    className="mt-6 block text-sm text-gray-700 underline hover:text-gray-500"
                >
                    Бүртгүүлэх
                </button>
            </div>
        </div>
    );
}
