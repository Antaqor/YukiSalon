"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import { BASE_URL } from "../lib/config";
import Modal from "../components/Modal";

// Helper component to count up the rating value
const StarCount = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let current = 0;
        const interval = setInterval(() => {
            current += 1;
            setCount(current);
            if (current >= value) clearInterval(interval);
        }, 20);
        return () => clearInterval(interval);
    }, [value]);
    return (
        <span className="text-xs text-gray-500">★ {count}</span>
    );
};

// Profile modal showing more info about a user
const UserModal = ({ user, onClose }: { user: User; onClose: () => void }) => (
    <Modal onClose={onClose}>
        <div className="p-6 space-y-3">
            <div className="flex items-center gap-4">
                {user.profilePicture ? (
                    <Image
                        src={`${BASE_URL}${user.profilePicture}`}
                        alt={user.username}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover ring-2 ring-[#30c9e8]"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 ring-2 ring-[#30c9e8]" />
                )}
                <div>
                    <h2 className="text-xl font-bold">{user.username}</h2>
                    {user.location && (
                        <p className="text-sm text-gray-500">{user.location}</p>
                    )}
                    {user.tagline && (
                        <p className="text-sm text-gray-500">{user.tagline}</p>
                    )}
                </div>
            </div>
            <p className="text-sm text-gray-600">Rating: {user.rating || 0}</p>
            <p className="text-sm text-gray-600">Full profile info coming soon...</p>
        </div>
    </Modal>
);

interface User {
    _id: string;
    username: string;
    profilePicture?: string;
    rating?: number;
    location?: string;
    tagline?: string;
}

const statusColors: Record<string, string> = {
    online: "bg-green-500",
    away: "bg-yellow-400",
    offline: "bg-gray-400",
};

const getStatus = (id: string) => {
    const options = ["online", "away", "offline"] as const;
    const index = id.charCodeAt(0) % options.length;
    return options[index];
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("active");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
    }, []);

    const filteredUsers = useMemo(() => {
        const term = search.toLowerCase();
        const sorted = [...users].sort((a, b) => {
            if (sort === "alphabetical") return a.username.localeCompare(b.username);
            if (sort === "recent") return b._id.localeCompare(a._id);
            return (b.rating || 0) - (a.rating || 0);
        });
        return sorted.filter(
            (u) =>
                u.username.toLowerCase().includes(term) ||
                (u.location || "").toLowerCase().includes(term)
        );
    }, [users, search, sort]);

    if (loading) {
        return (
            <div className="p-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gray-700 mb-3" />
                        <div className="h-4 w-3/4 bg-gray-700 rounded" />
                    </div>
                ))}
            </div>
        );
    }
    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-white text-black p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Гишүүд</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members"
                    className="flex-1 px-3 py-2 rounded border bg-gray-100 focus:outline-none"
                />
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-2 rounded border bg-gray-100 focus:outline-none"
                >
                    <option value="active">Most active</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="recent">Recently joined</option>
                </select>
            </div>
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                {filteredUsers.map((user) => {
                    const status = getStatus(user._id);
                    return (
                        <motion.div
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className="bg-white/10 border border-gray-200 rounded-lg p-4 flex flex-col items-center shadow transition hover:shadow-lg hover:-translate-y-1 hover:ring-1 hover:ring-[#30c9e8] cursor-pointer"
                        >
                            <div className="relative mb-3">
                                {user.profilePicture ? (
                                    <Image
                                        src={`${BASE_URL}${user.profilePicture}`}
                                        alt={user.username}
                                        width={96}
                                        height={96}
                                        className="w-24 h-24 rounded-full object-cover ring-2 ring-[#30c9e8]"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gray-200 ring-2 ring-[#30c9e8]" />
                                )}
                                <span className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white ${statusColors[status]}`} />
                            </div>
                            <p className="font-semibold text-gray-800">{user.username}</p>
                            {user.location && (
                                <p className="text-xs text-gray-500 mt-1">{user.location}</p>
                            )}
                            {user.tagline && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{user.tagline}</p>
                            )}
                            {typeof user.rating === "number" && (
                                <div className="mt-1">
                                    <StarCount value={user.rating} />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
            {selectedUser && (
                <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </div>
    );
}
