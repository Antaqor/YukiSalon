// File: /app/register/page.tsx

"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface RegisterResponse {
    message: string;
}
interface ErrorResponse {
    error: string;
}

export default function UserRegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        try {
            const response = await axios.post<RegisterResponse>(
                "https://backend.foru.mn/api/auth/register",
                {
                    username,
                    phoneNumber,
                    email,
                    password,
                    role: "user",
                }
            );
            if (response.status === 201) {
                alert("User registration successful!");
                router.push("/login");
            } else {
                setError("Registration failed. Please try again.");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ErrorResponse>;
                setError(
                    axiosError.response?.data.error || "Registration error."
                );
            } else {
                setError("Unknown error occurred.");
            }
            console.error("Registration error:", err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-t-md shadow-md p-8 flex flex-col space-y-6"
            >
                {error && (
                    <p className="text-red-500 text-center font-medium">
                        {error}
                    </p>
                )}

                {/* Хэрэглэгчийн нэр */}
                <div className="flex flex-col space-y-2">
                    <label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-700"
                    >
                        Хэрэглэгчийн нэр
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Хэрэглэгчийн нэрээ оруулна уу"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Утасны дугаар */}
                <div className="flex flex-col space-y-2">
                    <label
                        htmlFor="phoneNumber"
                        className="text-sm font-medium text-gray-700"
                    >
                        Утасны дугаар
                    </label>
                    <input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Утасны дугаараа оруулна уу"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>

                {/* И-мэйл */}
                <div className="flex flex-col space-y-2">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                    >
                        И-мэйл
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="И-мэйлээ оруулна уу"
                        className="rounded-lg bg-gray-100 border-0 p-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

                {/* Бүртгэл үүсгэх товч */}
                <button
                    type="submit"
                    className="w-full bg-neutral-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                    Бүртгэл үүсгэх
                </button>

                {/* 'эсвэл' шугам */}
                <div className="relative flex items-center justify-center">
                    <div className="w-full h-px bg-gray-300"></div>
                    <span className="absolute bg-white px-4 text-gray-500">
                        эсвэл
                    </span>
                </div>

                {/* Нэвтрэх товч */}
                <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="w-full bg-gray-200 text-neutral-900 text-sm font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Нэвтрэх
                </button>
            </form>
        </div>
    );
}
