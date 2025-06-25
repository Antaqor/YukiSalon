"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { BASE_URL } from "../lib/config";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");


    useEffect(() => {
        const savedUser = localStorage.getItem("rememberUsername");
        const savedPass = localStorage.getItem("rememberPassword");
        if (savedUser) {
            setUsername(savedUser);
            setRemember(true);
        }
        if (savedPass) {
            setPassword(savedPass);
            setRemember(true);
        }
    }, []);

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
                document.cookie = `token=${token}; path=/`;
                if (remember) {
                    localStorage.setItem("rememberUsername", username);
                    localStorage.setItem("rememberPassword", password);
                } else {
                    localStorage.removeItem("rememberUsername");
                    localStorage.removeItem("rememberPassword");
                }
                router.push("/");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError("Нэвтрэх алдаа.");
        }
    };

    return (
        <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
            <motion.div
                whileHover={{ opacity: 0.9 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="w-full max-w-md space-y-6"
            >
                <p className="text-center mb-10">AI Social Network Манай Network нэмэгдсэнээр хамгийн сүүлийн үеийн мэдээллэл AI skills эзэмшинэ</p>
                <h1 className="text-3xl font-bold text-black">Нэвтрэх</h1>
                {error && <p className="text-red-600">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Хэрэглэгчийн нэр
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="Хэрэглэгчийн нэр"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">
                            Нууц үг
                        </label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="Нууц үг"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                        <label className="flex items-center text-black">
                            <input
                                type="checkbox"
                                className="h-4 w-4 mr-2"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            Сануулах
                        </label>
                        <button
                            type="button"
                            onClick={() => alert("Forgot Password?")}
                            className="underline hover:text-brand"
                        >
                            Нууц үгээ мартсан?
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-brand text-white py-3 rounded-md font-semibold hover:opacity-90 transition"
                    >
                        Нэвтрэх
                    </button>
                </form>
                <button
                    onClick={() => router.push("/register")}
                    className="mt-6 block text-sm text-gray-500 underline hover:text-brand"
                >
                    Бүртгүүлэх
                </button>
            </motion.div>
        </div>
    );
}
