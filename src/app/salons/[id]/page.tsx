"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
    PhoneIcon,
    ShareIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import MonthCalendar, { MonthData, DayStatus } from "@/app/components/MonthCalendar";
import SidebarLeft from "../../components/SidebarLeft";
import SidebarRight from "../../components/SidebarRight";

interface HoursOfOperation {
    [day: string]: string;
}

interface Salon {
    _id: string;
    name: string;
    location: string;
    about?: string;
    logo?: string;
    coverImage?: string;
    hoursOfOperation?: HoursOfOperation;
    lat?: number | null;
    lng?: number | null;
}

interface Service {
    _id: string;
    name: string;
    price: number;
    durationMinutes: number;
}

interface SessionUser {
    id?: string;
    email?: string;
    role?: string;
    accessToken?: string;
}

function format24to12(time24: string) {
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${String(minute).padStart(2, "0")} ${ampm}`;
}

interface BookingPopupProps {
    service: Service;
    onClose: () => void;
}

function BookingPopup({ service, onClose }: BookingPopupProps) {
    const { data: session } = useSession();
    const [monthData, setMonthData] = useState<MonthData | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [times, setTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loadingTimes, setLoadingTimes] = useState(false);
    const [message, setMessage] = useState("");
    const [done, setDone] = useState(false);

    const [invoiceId, setInvoiceId] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [paymentDone, setPaymentDone] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);

    useEffect(() => {
        const januaryDays: DayStatus[] = [
            { day: 6, status: "goingFast" },
            { day: 10, status: "fullyBooked" },
        ];
        setMonthData({ year: 2025, month: 0, days: januaryDays });
    }, []);

    useEffect(() => {
        if (!selectedDay) {
            setTimes([]);
            return;
        }
        setLoadingTimes(true);
        setMessage("");
        const dateStr = `2025-01-${String(selectedDay).padStart(2, "0")}`;
        axios
            .get<{ times: string[] }[]>(`http://152.42.243.146/api/services/${service._id}/availability`, {
                params: { date: dateStr },
            })
            .then((res) => {
                const allTimes = res.data.flatMap((b) => b.times || []);
                setTimes([...new Set(allTimes)].sort());
            })
            .catch(() => {
                setMessage("Цаг ачаалж чадсангүй.");
            })
            .finally(() => setLoadingTimes(false));
    }, [selectedDay, service._id]);

    async function handleBookTime() {
        if (!session?.user) {
            setMessage("Нэвтэрч орно уу (Token алга).");
            return;
        }
        const user = session.user as SessionUser;
        if (!user.accessToken) {
            setMessage("Token алга байна. Дахин нэвтэрнэ үү.");
            return;
        }
        if (!selectedDay || !selectedTime) {
            setMessage("Өдөр болон цаг сонгоно уу.");
            return;
        }
        try {
            const dateStr = `2025-01-${String(selectedDay).padStart(2, "0")}`;
            const apptRes = await axios.post(
                "http://152.42.243.146/api/appointments",
                {
                    serviceId: service._id,
                    date: dateStr,
                    startTime: selectedTime,
                    status: "pendingPayment",
                },
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            if (apptRes.status === 201) {
                setMessage("Цаг амжилттай захиалагдлаа! Төлбөрийн нэхэмжлэл үүсгэж байна...");
                const invoiceRes = await axios.post<{
                    success?: boolean;
                    invoiceData?: { invoice_id?: string };
                    qrDataUrl?: string;
                }>("http://152.42.243.146/api/payments/create-invoice", {
                    invoiceCode: "FORU_INVOICE",
                    amount: service.price,
                });
                if (invoiceRes.data?.success) {
                    const inv = invoiceRes.data.invoiceData;
                    setInvoiceId(inv?.invoice_id || "");
                    setQrUrl(invoiceRes.data.qrDataUrl || "");
                    setMessage("Төлбөрийн нэхэмжлэл үүссэн. QR-ээр эсвэл Social Pay-р төлнө үү.");
                } else {
                    setMessage("QPay Invoice үүсгэхэд алдаа гарлаа.");
                }
                setDone(true);
            } else {
                setMessage("Захиалга үүсгэхэд алдаа гарлаа.");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setMessage("Token буруу буюу хугацаа дууссан. Дахин нэвтэрнэ үү.");
            } else {
                setMessage("Серверийн алдаа эсвэл нэвтрэлт шаардлагатай.");
            }
        }
    }

    async function handleCheckPayment() {
        if (!invoiceId) {
            setMessage("Invoice ID алга байна. Төлбөр шалгах боломжгүй.");
            return;
        }
        setMessage("");
        setCheckingPayment(true);
        try {
            const checkRes = await axios.post<{
                checkResult?: {
                    rows?: Array<{
                        payment_status?: string;
                    }>;
                };
            }>("http://152.42.243.146/api/payments/check-invoice", {
                invoiceId,
            });
            const payRow = checkRes.data.checkResult?.rows?.[0];
            const payStatus = payRow?.payment_status || "UNPAID";
            if (payStatus === "PAID") {
                setPaymentDone(true);
                setMessage("Төлбөр амжилттай хийгдсэн!");
            } else {
                setMessage("Төлбөр хараахан төлөгдөөгүй байна.");
            }
        } catch {
            setMessage("Төлбөр шалгахад алдаа гарлаа.");
        } finally {
            setCheckingPayment(false);
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white w-full max-w-md rounded-lg relative p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close booking popup"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {!done ? (
                    <>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                            {service.name}
                            <span className="ml-2 text-base text-primary font-medium">
                                {service.price.toLocaleString()}₮
                            </span>
                        </h2>
                        {monthData && (
                            <MonthCalendar
                                monthData={monthData}
                                selectedDay={selectedDay}
                                onSelectDay={setSelectedDay}
                            />
                        )}
                        {loadingTimes && (
                            <p className="mt-3 text-sm text-gray-500">Цаг ачаалж байна...</p>
                        )}
                        {message && (
                            <p className="mt-3 text-sm text-red-600 font-medium">{message}</p>
                        )}
                        {times.length > 0 && !loadingTimes && (
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                {times.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedTime(t)}
                                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                            selectedTime === t
                                                ? "bg-neutral-900 text-white border-neutral-900"
                                                : "border-gray-300 hover:bg-gray-100"
                                        }`}
                                    >
                                        {format24to12(t)}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Болих
                            </button>
                            <button
                                onClick={handleBookTime}
                                className="px-4 py-2 text-sm rounded-md bg-neutral-900 text-white hover:bg-neutral-700"
                            >
                                Цаг захиалах
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center px-4 py-6">
                        {paymentDone ? (
                            <h2 className="text-xl font-bold text-green-600 mb-3">Төлбөр амжилттай!</h2>
                        ) : (
                            <h2 className="text-xl font-bold text-green-600 mb-3">
                                Цаг амжилттай захиалагдлаа!
                            </h2>
                        )}
                        {message && (
                            <p className="text-sm text-gray-700 mb-4">{message}</p>
                        )}
                        {qrUrl && !paymentDone && (
                            <img
                                src={qrUrl}
                                alt="QR Code"
                                className="mx-auto mb-4"
                                style={{ width: 200, height: 200 }}
                            />
                        )}
                        {!paymentDone && invoiceId && (
                            <button
                                onClick={handleCheckPayment}
                                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-500"
                                disabled={checkingPayment}
                            >
                                {checkingPayment ? "Шалгаж байна..." : "Төлбөр шалгах"}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Хаах
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SalonDetailPage() {
    const params = useParams() as { id?: string };
    const [salon, setSalon] = useState<Salon | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState("");
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const phoneNumber = "+97694641031";
    const shareUrl = `http://localhost:3000/salons/${params.id}`;

    useEffect(() => {
        if (!params.id) return;
        (async () => {
            try {
                const salonRes = await axios.get<Salon>(
                    `http://152.42.243.146/api/salons/${params.id}`
                );
                setSalon(salonRes.data);

                const servicesRes = await axios.get<Service[]>(
                    `http://152.42.243.146/api/services/salon/${params.id}`
                );
                setServices(servicesRes.data);
            } catch (err) {
                console.error("Error loading salon/services:", err);
                setError("Салон болон үйлчилгээ уншихад алдаа гарлаа.");
            }
        })();
    }, [params.id]);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: salon?.name || "Салон",
                    text: salon?.about || "",
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Холбоосыг хууллаа!");
            }
        } catch (err) {
            console.error("Хуваалцахад алдаа:", err);
        }
    };

    function openPopup(svc: Service) {
        setSelectedService(svc);
        setShowPopup(true);
    }

    function closePopup() {
        setShowPopup(false);
        setSelectedService(null);
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-white">
                <SidebarLeft />
                <div className="flex-1 mx-auto max-w-5xl p-4">
                    <p className="text-red-600">{error}</p>
                </div>
                <SidebarRight />
            </div>
        );
    }

    if (!salon) {
        return (
            <div className="flex min-h-screen bg-white">
                <SidebarLeft />
                <div className="flex-1 mx-auto max-w-5xl p-4 text-center text-gray-600">
                    Салон ачаалж байна...
                </div>
                <SidebarRight />
            </div>
        );
    }

    const googleMapsLink =
        salon.lat != null && salon.lng != null
            ? `https://maps.google.com/?q=${salon.lat},${salon.lng}`
            : `https://maps.google.com/?q=${encodeURIComponent(salon.location)}`;

    return (
        <div className="flex min-h-screen bg-white">
            <SidebarLeft />
            <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-6">
                {salon.coverImage && (
                    <div className="h-60 bg-gray-200 overflow-hidden mb-6 rounded-md">
                        <img
                            src={salon.coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className="h-20 w-20 bg-white rounded-full overflow-hidden border border-gray-300">
                            {salon.logo ? (
                                <img
                                    src={salon.logo}
                                    alt={`${salon.name} Logo`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-100" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">{salon.name}</h1>
                            <p className="mt-1 text-sm text-gray-500">{salon.location}</p>
                            {salon.about && (
                                <p className="mt-2 text-sm text-gray-600 max-w-prose">
                                    {salon.about}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <a
                            href={`tel:${phoneNumber}`}
                            className="inline-flex items-center bg-neutral-900 text-white px-3 py-1.5 rounded-md hover:bg-neutral-700 transition-colors"
                        >
                            <PhoneIcon className="h-5 w-5 mr-2" />
                            Call
                        </a>
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
                        >
                            <ShareIcon className="h-5 w-5 mr-1" />
                            Share
                        </button>
                    </div>
                </div>

                {services.length === 0 ? (
                    <p className="text-sm text-gray-500">Үйлчилгээ олдсонгүй.</p>
                ) : (
                    <ul className="space-y-3">
                        {services.map((svc) => (
                            <li
                                key={svc._id}
                                className="p-4 border border-gray-200 rounded-lg flex items-center justify-between bg-white"
                            >
                                <div>
                                    <p className="font-medium text-neutral-800">{svc.name}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {svc.price.toLocaleString()}₮ — {svc.durationMinutes} мин
                                    </p>
                                </div>
                                <button
                                    onClick={() => openPopup(svc)}
                                    className="bg-neutral-900 text-white px-3 py-2 rounded-md hover:bg-neutral-700 transition-colors text-sm focus:outline-none"
                                >
                                    Цаг захиалах
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-4">
                    <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        View on Map
                    </a>
                </div>
            </main>
            <SidebarRight />
            {showPopup && selectedService && (
                <BookingPopup service={selectedService} onClose={closePopup} />
            )}
        </div>
    );
}
