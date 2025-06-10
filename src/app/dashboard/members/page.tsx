"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface Member {
    _id: string;
    username: string;
    subscriptionExpiresAt?: string;
}

const BACKEND_URL = "https://www.vone.mn/api";

export default function MembersDashboard() {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/users`);
                const data = await res.json();
                setMembers(data);
            } catch {
                setStatus("Алдаа!");
            }
        };
        fetchMembers();
    }, []);

    const extendMembership = async (memberId: string) => {
        try {
            setStatus("Updating...");
            const res = await fetch(`${BACKEND_URL}/users/${memberId}/subscription`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user?.accessToken ? `Bearer ${user.accessToken}` : "",
                },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (res.ok) {
                setMembers((prev) =>
                    prev.map((m) =>
                        m._id === memberId ? { ...m, subscriptionExpiresAt: data.subscriptionExpiresAt } : m
                    )
                );
                setStatus("Шинэчлэгдлээ!");
            } else {
                setStatus(data.error || "Алдаа!");
            }
        } catch {
            setStatus("Алдаа!");
        }
    };

    return (
        <main className="min-h-screen bg-black text-gray-100 p-4">
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-center">Гишүүдийн Менежмент</h1>
                {status && <p className="text-center text-red-400">{status}</p>}
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">User</th>
                            <th className="p-2">Expires</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m) => (
                            <tr key={m._id} className="border-t border-gray-700">
                                <td className="p-2">{m.username}</td>
                                <td className="p-2">
                                    {m.subscriptionExpiresAt
                                        ? new Date(m.subscriptionExpiresAt).toLocaleDateString()
                                        : "None"}
                                </td>
                                <td className="p-2">
                                    <button
                                        onClick={() => extendMembership(m._id)}
                                        className="px-2 py-1 bg-blue-600 rounded text-white"
                                    >
                                        Extend 30d
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
