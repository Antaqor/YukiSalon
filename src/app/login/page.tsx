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
                // AuthContext.login(...) -д дамжуулах
                const { user, token } = res.data;
                login({ ...user }, token);

                router.push("/");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Нэвтрэх алдаа.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-4 bg-white shadow rounded">
                <h1 className="text-xl font-bold mb-4">Нэвтрэх</h1>
                {error && <p className="text-red-500 mb-3">{error}</p>}
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full border p-2 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                    Нэвтрэх
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="ml-3 text-blue-600"
                >
                    Бүртгүүлэх
                </button>
            </form>
        </div>
    );
}
