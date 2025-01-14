"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

// Interface for the registration response
interface RegisterResponse {
    message: string;
}

// Interface for the error response
interface ErrorResponse {
    error: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Handle form submission for user registration
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post<RegisterResponse>(
                "http://152.42.243.146/api/auth/register",
                {
                    username,
                    phoneNumber,
                    email,
                    password,
                    // role: "user" // Uncomment if your backend explicitly needs this
                }
            );

            if (response.status === 201) {
                alert("Registration successful!");
                router.push("/auth/login");
            } else {
                setError("Registration failed. Please try again.");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                setError(axiosError.response?.data.error || "Registration error.");
            } else {
                setError("An unexpected error occurred.");
            }
            console.error("Registration error:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 px-4">
            <h1 className="text-3xl font-semibold mb-8 text-center tracking-wide">
                Register
            </h1>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-lg shadow-md p-8 flex flex-col space-y-6"
            >
                {error && (
                    <p className="text-red-500 text-center font-medium">{error}</p>
                )}

                {/* Username */}
                <div className="flex flex-col">
                    <label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        className="rounded-lg bg-gray-100 border-0 p-3 focus:ring-2 focus:ring-neutral-800 transition-colors"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col">
                    <label
                        htmlFor="phoneNumber"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Phone Number
                    </label>
                    <input
                        id="phoneNumber"
                        type="text"
                        placeholder="Enter your phone number"
                        className="rounded-lg bg-gray-100 border-0 p-3 focus:ring-2 focus:ring-neutral-800 transition-colors"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="rounded-lg bg-gray-100 border-0 p-3 focus:ring-2 focus:ring-neutral-800 transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700 mb-2"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter a secure password"
                        className="rounded-lg bg-gray-100 border-0 p-3 focus:ring-2 focus:ring-neutral-800 transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className="bg-neutral-900 text-white text-sm font-medium py-3 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                    Create Account
                </button>
            </form>
        </div>
    );
}
