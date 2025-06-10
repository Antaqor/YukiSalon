"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface User {
    _id: string;
    username: string;
    rating: number;
}

export default function PointsDashboard() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/login");
        } else if (user.username !== "Antaqor") {
            router.push("/");
        }
    }, [user, router]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("https://www.vone.mn/api/users");
                const data = await res.json();
                setUsers(data);
            } catch {
                // ignore
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">User Points</h1>
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="p-2">User</th>
                        <th className="p-2">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u._id} className="border-t border-gray-700">
                            <td className="p-2">{u.username}</td>
                            <td className="p-2">{u.rating}</td>
                        </tr>
                    ))}
                    {user && (
                        <tr className="border-t border-gray-700 font-bold">
                            <td className="p-2">You</td>
                            <td className="p-2">{user.rating}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
