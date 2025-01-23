"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

/** Үйлчилгээний үндсэн мэдээлэл */
interface ServiceData {
    name: string;
}

/** Хэрэглэгчийн үндсэн мэдээлэл (стилист гэх мэт) */
interface UserData {
    username: string;
    phoneNumber?: string;
}

/** Цаг захиалгын бүтэц */
interface AppointmentData {
    _id: string;
    date: string;         // "2025-01-15T00:00:00.000Z"
    startTime: string;    // "14:30"
    createdAt?: string;
    service?: ServiceData;
    stylist?: UserData;
    classification?: string; // "past", "soon", or "upcoming"
}

// Сарны нэрс (МУ-ын хэлбэрээр)
const MONTH_NAMES_MN = [
    "1-р сар",  "2-р сар",  "3-р сар",  "4-р сар",
    "5-р сар",  "6-р сар",  "7-р сар",  "8-р сар",
    "9-р сар",  "10-р сар", "11-р сар", "12-р сар",
];

/** Цаг захиалгуудыг ачаалж байх үед үзүүлэх skeleton */
function AppointmentsSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-16 w-full bg-gray-200 rounded" />
            <div className="h-16 w-full bg-gray-200 rounded" />
        </div>
    );
}

/**
 * Цаг захиалгыг YYYY-MM форматаар бүлэглэнэ (жишээ нь "2025-01").
 * group: {
 *   "2025-01": [appt1, appt2],
 *   "2025-02": [appt3, ...]
 * }
 */
function groupAppointmentsByMonth(appointments: AppointmentData[]) {
    const groups: Record<string, AppointmentData[]> = {};
    appointments.forEach((appt) => {
        const date = new Date(appt.date);
        const yearMonth = `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!groups[yearMonth]) {
            groups[yearMonth] = [];
        }
        groups[yearMonth].push(appt);
    });
    return groups;
}

export default function ClientAppointmentsPage() {
    const router = useRouter();
    const { user, loggedIn } = useAuth();

    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 1) Хэрэв нэвтрээгүй эсвэл role !== "user" бол /login руу чиглүүлнэ
    useEffect(() => {
        if (!loggedIn || !user) {
            router.push("/login");
        } else if (user.role !== "user") {
            router.push("/login");
        }
    }, [loggedIn, user, router]);

    // 2) Хэрэглэгчийн цаг захиалгыг (Mongoose-оос) серверээс татах
    useEffect(() => {
        async function fetchUserAppointments() {
            try {
                setLoading(true);
                setError("");

                const token = user?.accessToken;
                if (!token) return;

                // Та өөрийн бодит API endpoint-аа энд ашиглана
                const res = await axios.get<AppointmentData[]>(
                    "https://backend.foru.mn/api/appointments",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                // 2.1) Огноо болон цагийг өсөхөөр эрэмбэлнэ
                const sorted = [...res.data].sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    // Хэрэв огноо адил бол startTime-оор нь харьцуулна
                    if (dateA === dateB) {
                        return a.startTime.localeCompare(b.startTime);
                    }
                    return dateA - dateB;
                });

                // 2.2) Ойролцоо эсэхийг "past", "soon", "upcoming" гэж ангилна
                const now = Date.now();
                const MS_IN_24H = 24 * 60 * 60 * 1000;

                const classified = sorted.map((appt) => {
                    const apptDate = new Date(appt.date);
                    const [hh, mm] = appt.startTime.split(":").map(Number);
                    apptDate.setHours(hh, mm, 0, 0);

                    const diff = apptDate.getTime() - now;
                    let classification = "upcoming";
                    if (diff < 0) classification = "past";
                    else if (diff < MS_IN_24H) classification = "soon";

                    return { ...appt, classification };
                });

                setAppointments(classified);
            } catch (err) {
                console.error("Error fetching appointments:", err);
                setError("Таны цаг захиалгыг уншиж чадсангүй. Дахин оролдоно уу!");
            } finally {
                setLoading(false);
            }
        }

        if (loggedIn && user?.role === "user") {
            void fetchUserAppointments();
        }
    }, [loggedIn, user]);

    // 3) Хэрэв нэвтрээгүй/role буруу бол юу ч буцаахгүй
    if (!loggedIn || !user || user.role !== "user") {
        return null;
    }

    // 4) Цаг захиалгуудыг YYYY-MM форматаар бүлэглээд, key-ээр нь эрэмбэлнэ
    const grouped = groupAppointmentsByMonth(appointments);
    const sortedKeys = Object.keys(grouped).sort(); // 2024-10, 2025-01, гэх мэт

    // 5) Хуудасны UI-г буулгах
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Дээд талын гарчиг */}
            <div className="pt-6 pb-2 px-4">
                <h1 className="text-xl font-bold text-gray-800">Миний цаг захиалгууд</h1>
            </div>

            <div className="px-4 pb-8">
                {error && (
                    <p className="text-red-600 text-sm text-center mb-4">{error}</p>
                )}

                {loading ? (
                    <AppointmentsSkeleton />
                ) : appointments.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Одоогоор цаг захиалга алга байна.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {/* Бүлэглэсэн саруудыг давталт */}
                        {sortedKeys.map((yearMonth) => {
                            const [year, month] = yearMonth.split("-");
                            const monthIndex = parseInt(month, 10) - 1; // 0-based index
                            const monthName = MONTH_NAMES_MN[monthIndex] || "";

                            return (
                                <div key={yearMonth} className="space-y-2">
                                    {/* Жишээ нь: "1-р сар 2025" */}
                                    <h2 className="text-sm font-semibold text-gray-500 mb-1">
                                        {monthName} {year}
                                    </h2>

                                    <div className="space-y-2">
                                        {grouped[yearMonth].map((appt) => {
                                            // YYYY-MM-DD-г илүү товч формат руу хөрвүүлнэ
                                            const dateObj = new Date(appt.date);
                                            const day = dateObj.getDate();

                                            // Classification-ийг Монгол хэл рүү хөрвүүлнэ
                                            let statusText = "";
                                            if (appt.classification === "past") {
                                                statusText = "Өнгөрсөн";
                                            } else if (appt.classification === "soon") {
                                                statusText = "Удахгүй эхэлнэ";
                                            } else {
                                                // "upcoming"
                                                statusText = "Ирээдүй";
                                            }

                                            // Энэ жишээнд бид үнэ / төлбөрийг үзүүлэхгүй байна;
                                            // Хэрвээ танд үнэ (price) зэрэг бий бол энд дэлгэцэнд гаргаарай.

                                            return (
                                                <div
                                                    key={appt._id}
                                                    className="flex items-start justify-between border border-gray-200 rounded-lg px-3 py-2"
                                                >
                                                    {/* Зүүн талд: үйлчилгээ, огноо, цаг, статус */}
                                                    <div className="text-sm text-gray-700 leading-snug">
                                                        <div className="font-medium text-gray-800 mb-1">
                                                            {/* Үйлчилгээний нэр эсвэл хоосон */}
                                                            {appt.service?.name || "Үйлчилгээ тодорхойгүй"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {day}-ны өдөр, {appt.startTime}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Төлөв: {statusText}
                                                        </div>
                                                    </div>

                                                    {/* Баруун талд: "Мастер" эсвэл "Дахин захиалах" товч */}
                                                    <div className="flex flex-col gap-1 items-end text-sm">
                                                        {/* Мастер / стилистийн нэр */}
                                                        {appt.stylist?.username && (
                                                            <div className="text-xs text-gray-600">
                                                                Мастер: {appt.stylist.username}
                                                            </div>
                                                        )}

                                                        {/* Дахин захиалах товч (жишээ) */}
                                                        <button
                                                            className="text-xs text-blue-600 border border-blue-100 rounded px-2 py-1 mt-1 hover:bg-blue-50"
                                                            onClick={() => alert("Дахин захиалах дарлаа!")}
                                                        >
                                                            Дахин захиалах
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
