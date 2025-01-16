"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    CalendarIcon,
    ClockIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";
import PendingStylists from "@/app/components/PendingStylists";
// or wherever your PendingStylists is located

/** Skeleton loader while fetching appointments */
function OrdersSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <ul className="space-y-3">
                <li className="h-20 w-full bg-gray-200 rounded" />
                <li className="h-20 w-full bg-gray-200 rounded" />
                <li className="h-20 w-full bg-gray-200 rounded" />
            </ul>
        </div>
    );
}

/** Minimal user info for appointments */
interface UserData {
    username: string;
    phoneNumber?: string;
}

/** Minimal service info for appointments */
interface ServiceData {
    name: string;
}

/** Single appointment record */
interface AppointmentData {
    _id: string;
    date: string;       // e.g. "2025-01-15T00:00:00.000Z"
    startTime: string;  // e.g. "14:30"
    createdAt?: string; // e.g. "2025-01-10T12:00:00.000Z"
    service?: ServiceData;
    user?: UserData;
    classification?: string; // e.g. "upcoming", "past", "soon"
}

/**
 * DashboardOrders:
 * - If role="owner", fetch all appointments from that salon
 * - If role="stylist" with status="approved", fetch from assignedSalon
 * - else redirect /login
 */
export default function DashboardOrders() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [error, setError] = useState("");
    const [loadingData, setLoadingData] = useState(true);

    // If not authed => /login
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // If user is something else => /login
    useEffect(() => {
        if (
            status === "authenticated" &&
            session?.user &&
            session.user.role !== "owner" &&
            session.user.role !== "stylist"
        ) {
            router.push("/login");
        }
    }, [status, session, router]);

    // Fetch appointments
    useEffect(() => {
        async function doFetchAppointments() {
            try {
                if (session?.user?.accessToken) {
                    // role=owner or stylist => get appts
                    const token = session.user.accessToken;

                    // Use production domain
                    const res = await axios.get<AppointmentData[]>(
                        "http://68.183.191.149/api/appointments",
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    // Sort by creation date
                    const sorted = [...res.data].sort((a, b) => {
                        const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        return bCreated - aCreated;
                    });

                    // Classify each
                    const now = Date.now();
                    const ONE_DAY = 24 * 60 * 60 * 1000;
                    const classified = sorted.map((appt) => {
                        const apptDate = new Date(appt.date);
                        const [hh, mm] = appt.startTime.split(":").map(Number);
                        apptDate.setHours(hh, mm, 0, 0);
                        const diff = apptDate.getTime() - now;
                        let c = "upcoming";
                        if (diff < 0) c = "past";
                        else if (diff < ONE_DAY) c = "soon";
                        return { ...appt, classification: c };
                    });

                    setAppointments(classified);
                }
            } catch (err) {
                console.error("Error loading appointments:", err);
                setError("Захиалгын мэдээллийг ачаалж чадсангүй.");
            } finally {
                setLoadingData(false);
            }
        }

        if (
            status === "authenticated" &&
            session?.user &&
            (session.user.role === "owner" || session.user.role === "stylist")
        ) {
            void doFetchAppointments();
        }
    }, [status, session]);

    // If session loading
    if (status === "loading") {
        return <p className="p-4 text-sm text-gray-700">Сессийн мэдээллийг ачаалж байна...</p>;
    }

    // If user not valid => show nothing
    if (
        !session?.user ||
        (session.user.role !== "owner" && session.user.role !== "stylist")
    ) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <main className="flex-1 p-6 overflow-y-auto">
                {/* If user is owner, show pending stylists: */}
                {session?.user?.role === "owner" && <PendingStylists />}

                {loadingData ? (
                    <OrdersSkeleton />
                ) : (
                    <section className="space-y-6">
                        {error && <p className="text-red-600 mb-4">{error}</p>}

                        {appointments.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                Одоогоор цаг авсан захиалга алга байна.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {appointments.map((appt) => {
                                    const displayDate = new Date(appt.date).toLocaleDateString("en-CA");
                                    return (
                                        <li
                                            key={appt._id}
                                            className="border border-neutral-200 p-4 rounded bg-white hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col gap-2 text-sm text-neutral-700">
                                                <p className="flex items-center gap-1">
                                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Огноо:</strong>{" "}
                                                    {displayDate}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <ClockIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Цаг:</strong>{" "}
                                                    {appt.startTime}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <ClipboardDocumentListIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Үйлчилгээ:</strong>{" "}
                                                    {appt.service?.name || "—"}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <UserIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Хэрэглэгч:</strong>{" "}
                                                    {appt.user?.username || "—"}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Утас:</strong>{" "}
                                                    {appt.user?.phoneNumber || "—"}
                                                </p>
                                                <p className="text-xs text-gray-500 italic">
                                                    Classification: {appt.classification}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
