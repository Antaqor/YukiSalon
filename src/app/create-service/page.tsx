"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface Category {
    _id: string;
    name: string;
}

export default function CreateServicePage() {
    const { data: session } = useSession();

    const [name, setName] = useState("");
    const [duration, setDuration] = useState<number>(30);
    const [price, setPrice] = useState<number>(50);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    /** Fetch categories on component mount */
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await axios.get("http://68.183.191.149/api/categories");
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        }
        fetchCategories();
    }, []);

    /** Handle form submission */
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        // 1) Check session token
        if (!session?.user?.accessToken) {
            setMessage("Please log in before creating a service.");
            return;
        }

        // 2) Basic validation
        if (!name.trim()) {
            setMessage("Please enter a service name.");
            return;
        }
        if (duration <= 0) {
            setMessage("Duration must be a positive number.");
            return;
        }
        if (price < 0) {
            setMessage("Price cannot be negative.");
            return;
        }
        if (!selectedCategoryId) {
            setMessage("Please select a category.");
            return;
        }

        // 3) Submit to the backend
        setIsSubmitting(true);
        try {
            const token = session.user.accessToken;
            const payload = {
                name: name.trim(),
                durationMinutes: duration,
                price,
                categoryId: selectedCategoryId,
            };

            const response = await axios.post(
                "http://68.183.191.149/api/services/my-service",
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 201) {
                setMessage("Successfully created a new service!");
                // Reset form
                setName("");
                setDuration(30);
                setPrice(50);
                setSelectedCategoryId("");
            } else {
                setMessage("Failed to create service. Please try again.");
            }
        } catch (error) {
            console.error("Creation error:", error);
            setMessage("An error occurred while creating the service.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-lg font-bold mb-3">Create a New Service</h1>

            {/* Message / Error */}
            {message && (
                <div className="mb-4 text-sm text-red-600 border border-red-200 p-2 rounded">
                    {message}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                {/* Service Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Service Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 w-full"
                        placeholder="e.g. Engine Oil Change"
                        required
                    />
                </div>

                {/* Duration */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Duration (minutes)
                    </label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="border p-2 w-full"
                        min={1}
                        required
                    />
                </div>

                {/* Price */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Price (₮)
                    </label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="border p-2 w-full"
                        min={0}
                        required
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Category
                    </label>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="border p-2 w-full"
                        required
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? "Creating..." : "Create Service"}
                </button>
            </form>
        </div>
    );
}
