"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            // Express сервер рүү хүсэлт илгээнэ
            const res = await axios.post("https://backend.foru.mn/api/auth/login", {
                username,
                password,
            });

            // Хэрэв амжилттай бол хэрэглэгч болон токенийг context-д хадгална
            if (res.status === 200 && res.data.token) {
                // Token-ийг хэрэглэгчийн объектод нэмэх
                const newUser = { ...res.data.user, accessToken: res.data.token };

                // Context–ийн login() функцэд newUser, токенийг дамжуулах
                login(newUser, res.data.token);

                // Эцэст нь / (home) руу чиглүүлэх
                router.push("/");
            }
        } catch (err) {
            console.error("Нэвтрэх явцад алдаа гарлаа:", err);
            setError("Нэвтрэх нэр эсвэл нууц үг буруу, эсвэл серверт алдаа гарлаа.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col space-y-6"
            >
                {error && (
                    <p className="text-red-500 text-center font-medium">
                        {error}
                    </p>
                )}

                {/* Нэвтрэх нэр */}
                <div className="flex flex-col space-y-2">
                    <label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-700"
                    >
                        Нэвтрэх нэр
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Нэвтрэх нэрээ оруулна уу"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Нууц үг */}
                <div className="flex flex-col space-y-2">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
                    >
                        Нууц үг
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Нууц үгээ оруулна уу"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Нэвтрэх товч */}
                <button
                    type="submit"
                    className="w-full bg-neutral-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                    Нэвтрэх
                </button>

                {/* 'эсвэл' гэсэн текстэнд тусгай дүрс эсвэл шугам нэмж болно */}
                <div className="relative flex items-center justify-center">
                    <div className="w-full h-px bg-gray-300"></div>
                    <span className="absolute bg-white px-4 text-gray-500">
                        эсвэл
                    </span>
                </div>

                {/* Бүртгүүлэх товч */}
                <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="w-full bg-gray-200 text-neutral-900 text-sm font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Бүртгүүлэх
                </button>
            </form>
        </div>
    );
}
