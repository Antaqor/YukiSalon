"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface User {
    _id: string;
    username: string;
    profilePicture?: string;
    rating?: number;
    location?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const BASE_URL = "https://www.vone.mn";

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/users`);
                setUsers(res.data);
            } catch (err: any) {
                console.error("Fetch users error:", err.response?.data || err.message);
                setError(err.response?.data?.error || "Хэрэглэгчдийн жагсаалт уншиж чадсангүй.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [BASE_URL]);

    if (loading) {
        return <div className="p-4 text-center">Уншиж байна...</div>;
    }
    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-dark text-black dark:text-white p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Гишүүд</h1>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {users.map((user) => (
                    <Link
                        key={user._id}
                        href={`/profile/${user._id}`}
                        className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                        {user.profilePicture ? (
                            <img
                                src={`${BASE_URL}${user.profilePicture}`}
                                alt={user.username}
                                className="w-20 h-20 rounded-full object-cover mb-3"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
                        )}
                        <p className="font-semibold text-gray-800 dark:text-white">{user.username}</p>
                        {user.location && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.location}</p>
                        )}
                        {user.rating && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">★ {user.rating}</p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
