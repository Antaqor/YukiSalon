"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const result = await signIn("credentials", {
            redirect: false,
            username,
            password,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            router.push("/");
        }
    };

    return (
        <div className="flex w-full min-h-screen items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-50 px-4 py-8">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-md"
            >
                {error && (
                    <p className="text-center text-sm font-medium text-red-500">
                        {error}
                    </p>
                )}

                {/* Username */}
                <div className="flex flex-col space-y-1">
                    <label
                        htmlFor="username"
                        className="text-sm font-medium text-gray-700"
                    >
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        className="w-full rounded-md border border-gray-300 bg-neutral-100 p-3 text-sm focus:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-700 transition-colors"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="flex flex-col space-y-1">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="w-full rounded-md border border-gray-300 bg-neutral-100 p-3 text-sm focus:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-700 transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                >
                    Sign In
                </button>
            </form>
        </div>
    );
}
