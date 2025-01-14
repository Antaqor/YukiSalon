"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import MonthCalendar, { MonthData, DayStatus } from "@/app/components/MonthCalendar";

interface SessionUser {
    id?: string;
    name?: string;
    email?: string;
    accessToken?: string;
}

interface ServiceData {
    _id: string;
    name: string;
    price: number;
    durationMinutes: number;
}

interface InvoiceData {
    invoice_id?: string;
    [key: string]: unknown; // if you expect extra fields from qPay response
}

interface CreateInvoiceResponse {
    success?: boolean;
    invoiceData?: InvoiceData;
    qrDataUrl?: string;
}

interface CheckInvoiceResponse {
    success?: boolean;
    checkResult?: {
        payments?: Array<{
            payment_status?: string;
            [key: string]: unknown;
        }>;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

function format24to12(time24: string): string {
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${String(minute).padStart(2, "0")} ${ampm}`;
}

export default function ServiceDetailPage() {
    const { id } = useParams() as { id?: string };
    const [service, setService] = useState<ServiceData | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showBookingPopup, setShowBookingPopup] = useState(false);

    useEffect(() => {
        if (!id) {
            setError("Service ID is missing.");
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const res = await axios.get<ServiceData>(
                    `http://152.42.243.146/api/services/${id}`
                );
                setService(res.data);
            } catch (err) {
                console.error("Failed to load service:", err);
                setError("Үйлчилгээ ачаалж чадсангүй.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <p className="p-4">Үйлчилгээ ачаалж байна...</p>;
    if (error) return <p className="p-4 text-red-600">{error}</p>;
    if (!service) return <p className="p-4 text-gray-500">Үйлчилгээ олдсонгүй.</p>;

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-2">{service.name}</h1>
            <p className="text-gray-700 mb-2">
                Үнэ: <strong>{service.price.toLocaleString()}₮</strong>
            </p>
            <p className="text-gray-700 mb-4">
                Үргэлжлэх хугацаа: <strong>{service.durationMinutes} мин</strong>
            </p>
            <button
                onClick={() => setShowBookingPopup(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Захиалга хийх
            </button>
            {showBookingPopup && (
                <OrderPopup
                    serviceId={service._id}
                    servicePrice={service.price}
                    onClose={() => setShowBookingPopup(false)}
                />
            )}
        </div>
    );
}

interface OrderPopupProps {
    serviceId: string;
    servicePrice: number;
    onClose: () => void;
}

function OrderPopup({ serviceId, servicePrice, onClose }: OrderPopupProps) {
    const { data: session } = useSession();
    const [monthData, setMonthData] = useState<MonthData | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [times, setTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [bookingDone, setBookingDone] = useState(false);

    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState("");

    useEffect(() => {
        const januaryDays: DayStatus[] = [
            { day: 6, status: "goingFast" },
            { day: 10, status: "fullyBooked" },
        ];
        setMonthData({
            year: 2025,
            month: 0,
            days: januaryDays,
        });
    }, []);

    useEffect(() => {
        if (!selectedDay) {
            setTimes([]);
            return;
        }
        setLoading(true);
        setMsg("");
        const dateStr = `2025-01-${String(selectedDay).padStart(2, "0")}`;
        axios
            .get<{ times: string[] }[]>(
                `http://152.42.243.146/api/services/${serviceId}/availability`,
                {
                    params: { date: dateStr },
                }
            )
            .then((res) => {
                const allTimes = res.data.flatMap((b) => b.times || []);
                setTimes([...new Set(allTimes)].sort());
            })
            .catch((err: unknown) => {
                console.error("Error fetching times:", err);
                setMsg("Цагийн мэдээлэл ачаалж чадсангүй.");
            })
            .finally(() => setLoading(false));
    }, [serviceId, selectedDay]);

    async function handleBookTime() {
        if (!session?.user) {
            setMsg("Нэвтрэх шаардлагатай!");
            return;
        }
        if (!selectedDay || !selectedTime) {
            setMsg("Өдөр болон цаг сонгоно уу.");
            return;
        }
        const user = session.user as SessionUser;
        if (!user.accessToken) {
            setMsg("Token алга байна. Дахин нэвтэрнэ үү.");
            return;
        }
        setLoading(true);
        try {
            const dateStr = `2025-01-${String(selectedDay).padStart(2, "0")}`;
            const bookRes = await axios.post(
                "http://152.42.243.146/api/appointments",
                {
                    serviceId,
                    date: dateStr,
                    startTime: selectedTime,
                    status: "pendingPayment",
                },
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );
            if (bookRes.status === 201) {
                const invoiceRes = await axios.post<CreateInvoiceResponse>(
                    "http://152.42.243.146/api/payments/create-invoice",
                    {
                        invoiceCode: "FORU_INVOICE",
                        amount: servicePrice,
                    }
                );
                if (invoiceRes.data.success && invoiceRes.data.invoiceData) {
                    setInvoiceData(invoiceRes.data.invoiceData);
                    setQrDataUrl(invoiceRes.data.qrDataUrl || "");
                    setMsg("Төлбөрийн нэхэмжлэл үүссэн. QR эсвэл Social Pay-р төлнө үү.");
                } else {
                    setMsg("QPay Invoice үүсгэхэд алдаа гарлаа.");
                }
            } else {
                setMsg("Захиалга үүсгэхэд алдаа гарлаа.");
            }
        } catch (err: unknown) {
            console.error("Booking error:", err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setMsg("Token буруу, эсвэл хүчинтэй хугацаа дууссан. Нэвтэрнэ үү.");
            } else {
                setMsg("Серверийн алдаа эсвэл нэвтрэлт шаардлагатай.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleCheckInvoice() {
        if (!invoiceData?.invoice_id) {
            setMsg("Invoice ID олдсонгүй.");
            return;
        }
        setLoading(true);
        try {
            const checkRes = await axios.post<CheckInvoiceResponse>(
                "http://152.42.243.146/api/payments/check-invoice",
                {
                    invoiceId: invoiceData.invoice_id,
                }
            );
            const paymentArr = checkRes.data.checkResult?.payments || [];
            const paymentStatus = paymentArr[0]?.payment_status || "UNPAID";
            if (checkRes.data.success && paymentStatus === "PAID") {
                setBookingDone(true);
                setMsg("Төлбөр амжилттай хийгдлээ!");
            } else {
                setMsg("Төлбөр хараахан хийгдээгүй байна.");
            }
        } catch (error: unknown) {
            console.error("Check invoice error:", error);
            setMsg("Төлбөр шалгахад алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-600">
                    ✕
                </button>
                {!bookingDone ? (
                    <>
                        <h2 className="text-xl font-bold mb-4">Цаг Захиалга</h2>
                        <p className="text-sm text-gray-700 mb-3">
                            <strong>Төлбөр:</strong> {servicePrice.toLocaleString()}₮
                        </p>
                        {monthData && (
                            <MonthCalendar
                                monthData={monthData}
                                selectedDay={selectedDay}
                                onSelectDay={(day) => setSelectedDay(day)}
                            />
                        )}
                        {loading && <p className="mt-4 text-sm">Ачаалж байна...</p>}
                        {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}

                        {times.length > 0 && !loading && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold mb-2">Цаг сонгох:</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {times.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTime(t)}
                                            className={`px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100 ${
                                                selectedTime === t ? "bg-blue-600 text-white" : ""
                                            }`}
                                        >
                                            {format24to12(t)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
                            >
                                Болих
                            </button>
                            <button
                                onClick={handleBookTime}
                                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Цаг + Төлбөр үүсгэх
                            </button>
                        </div>

                        {invoiceData && (
                            <div className="mt-6">
                <pre className="bg-gray-100 p-2 text-xs">
                  {JSON.stringify(invoiceData, null, 2)}
                </pre>
                                {qrDataUrl && (
                                    <img
                                        src={qrDataUrl}
                                        alt="QR Code"
                                        style={{ width: 200, height: 200, marginTop: 8 }}
                                    />
                                )}
                                <button
                                    onClick={handleCheckInvoice}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Төлбөр шалгах
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-green-600 mb-4">Амжилттай Захиалга!</h2>
                        <p className="text-sm text-gray-700 mb-4">Таны цаг болон төлбөр баталгаажлаа!</p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded bg-gray-300 hover:bg-gray-400"
                        >
                            Хаах
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}