// app/dashboard/create-stylist/page.tsx
"use client";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";

interface CreateStylistResponse {
    message: string;
}

export default function CreateStylistPage() {
    const { data: session } = useSession();
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");

        if (!session?.user?.accessToken) {
            setMessage("Please log in as owner.");
            return;
        }
        if (!name.trim()) {
            setMessage("Stylist name is required.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post<CreateStylistResponse>(
                "http://localhost:5001/api/stylists/my-stylist",
                {
                    name: name.trim(),
                },
                {
                    headers: { Authorization: `Bearer ${session.user.accessToken}` },
                }
            );

            if (response.status === 201) {
                setMessage("Stylist created successfully!");
                setName("");
            } else {
                setMessage("Failed to create stylist. Please try again.");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ error: string }>;
                setMessage(axiosError.response?.data.error || "Error creating stylist.");
            } else {
                setMessage("An unexpected error occurred.");
            }
            console.error("Error creating stylist:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Create Stylist</h1>
            {message && <p className="text-red-600 mb-2">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="stylistName" className="block font-semibold">
                        Stylist Name
                    </label>
                    <input
                        id="stylistName"
                        type="text"
                        className="border p-2 w-full rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className={`bg-blue-600 text-white px-4 py-2 rounded ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    } transition-colors`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Create Stylist"}
                </button>
            </form>
        </div>
    );
}