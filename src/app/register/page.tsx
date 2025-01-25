"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username || !password || !age) {
            setError("All fields required.");
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/register`, {
                username,
                password,
                age,
            });
            if (res.status === 201) {
                setSuccess("Registered successfully!");
                setUsername("");
                setPassword("");
                setAge("");
            }
        } catch (err: any) {
            console.error("Register error:", err);
            setError(err.response?.data?.error || "Registration error");
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-3">Register (username, password, age)</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {success && <p className="text-green-600 mb-2">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm mb-1">Username</label>
                    <input
                        className="w-full border p-2 rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full border p-2 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Age</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                    />
                </div>

                <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                    Register
                </button>
            </form>

            <button
                onClick={() => router.push("/")}
                className="mt-3 underline text-sm text-gray-600"
            >
                Go Home
            </button>
        </div>
    );
}
