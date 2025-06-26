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
        <div className="min-h-screen flex items-center justify-center bg-[#171717] text-black dark:text-white px-4 py-8">
            <motion.div
                whileHover={{ opacity: 0.97 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="w-full max-w-md space-y-6 bg-white text-black dark:bg-[#1B1B1B] dark:text-white p-8 rounded-xl shadow-lg border border-black/10"
            >
                <div className="text-center space-y-1 mb-4">
                    <h2 className="text-2xl font-bold">AI Social Network</h2>
                    <p className="text-sm text-gray-500">AI мэдлэгийг овсгоотой эзэмш</p>
                </div>
                <h1 className="text-3xl font-bold">Нэвтрэх</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-black dark:text-white mb-1">
                            Хэрэглэгчийн нэр
                        </label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#30c9e8] placeholder-gray-400"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#30c9e8] placeholder-gray-400"
                            placeholder="Нууц үг"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                        <label className="flex items-center text-black dark:text-white">
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
                    {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-[#30c9e8] text-white py-3 rounded-lg font-semibold hover:bg-[#28b6d3] active:bg-[#239bb3] transition-colors"
                    >
                        Нэвтрэх
                    </button>
                </form>
                <div className="flex items-center my-2">
                    <div className="flex-grow border-t border-gray-300" />
                    <span className="mx-2 text-gray-500 text-sm">Эсвэл</span>
                    <div className="flex-grow border-t border-gray-300" />
                </div>
                <button
                    onClick={() => router.push("/register")}
                    className="block w-full text-sm font-medium text-brand underline hover:text-[#28b6d3]"
                >
                    Шинээр бүртгүүлэх
                </button>
            </motion.div>
        </div>
    );
}
