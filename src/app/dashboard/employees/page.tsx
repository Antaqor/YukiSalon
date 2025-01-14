// app/dashboard/employees/page.tsx (Tesla-Inspired Minimalist)
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MinimalTabs from "@/app/components/MinimalTabs";

interface StylistData {
    _id: string;
    name: string;
}

export default function EmployeesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [stylists, setStylists] = useState<StylistData[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchStylists = async () => {
            try {
                if (session?.user?.accessToken && session.user.role === "owner") {
                    const token = session.user.accessToken;

                    // Fetch the owner's salon
                    const salonRes = await axios.get("http://localhost:5001/api/salons/my-salon", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const salonId = salonRes.data._id;

                    // Fetch stylists for that salon
                    const styRes = await axios.get<StylistData[]>(
                        `http://localhost:5001/api/stylists/salon/${salonId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setStylists(styRes.data);
                }
            } catch (err) {
                console.error("Error loading stylists:", err);
                setError("Failed to load employees.");
            }
        };
        fetchStylists();
    }, [session]);

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (!session?.user || session.user.role !== "owner") {
        return <p>You must be an owner to view this page.</p>;
    }

    return (
        <div className="flex min-h-screen bg-neutral-100">
            <Sidebar />

            <main className="flex-1 p-6 overflow-y-auto">
                <MinimalTabs />

                <section className="space-y-6">
                    <header className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold tracking-wide text-neutral-800">
                            Employees (Stylists)
                        </h1>
                        <a
                            href="/dashboard/create-stylist"
                            className="bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-700 transition-colors"
                        >
                            + Add Stylist
                        </a>
                    </header>

                    {error && <p className="text-red-600">{error}</p>}

                    {stylists.length === 0 ? (
                        <p className="text-sm text-neutral-500">
                            No employees found. Try adding one!
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {stylists.map((st) => (
                                <li
                                    key={st._id}
                                    className="border border-neutral-200 p-4 rounded bg-white hover:shadow-sm transition-shadow"
                                >
                                    <p className="font-semibold text-neutral-800">{st.name}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}