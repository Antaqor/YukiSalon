"use client";  // <-- Next.js "use client" directive

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import {
    PhoneIcon,
    ShareIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";

import MonthCalendar, { MonthData, DayStatus } from "@/app/components/MonthCalendar";
import { useAuth } from "@/app/context/AuthContext";

// --------------------
// Utility: convert "HH:mm" => "H:MM AM/PM"
// --------------------
function format24to12(time24: string) {
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${String(minute).padStart(2, "0")} ${ampm}`;
}

// --------------------
// Type definitions
// --------------------
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

interface BookingPopupProps {
    service: Service;
    onClose: () => void;
}

// --------------------
// Booking Popup
// --------------------
function BookingPopup({ service, onClose }: BookingPopupProps) {
    const { user } = useAuth();  // user context with .accessToken, etc.

    // Step-based UI states: "chooseTime" -> "showInvoice" -> "done"
    const [step, setStep] = useState<"chooseTime" | "showInvoice" | "done">("chooseTime");
    const [message, setMessage] = useState("");

    // Calendar/time picking
    const [monthData, setMonthData] = useState<MonthData | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [times, setTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loadingTimes, setLoadingTimes] = useState(false);

    // QPay states
    const [invoiceId, setInvoiceId] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [paymentDone, setPaymentDone] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(false);

    // --------------------
    // 1) Load some test MonthCalendar data (e.g., January 2025)
    // --------------------
    useEffect(() => {
        const januaryDays: DayStatus[] = [
            { day: 6, status: "goingFast" },
            { day: 10, status: "fullyBooked" },
        ];
        setMonthData({ year: 2025, month: 0, days: januaryDays });
    }, []);

    // --------------------
    // 2) Fetch time slots when user picks a day
    // --------------------
    useEffect(() => {
        if (!selectedDay) {
            setTimes([]);
            return;
        }
        setLoadingTimes(true);
        setMessage("");

        const dateStr = `2025-01-${String(selectedDay).padStart(2, "0")}`;

        axios
            .get<{ times: string[] }[]>(
                `https://backend.foru.mn/api/services/${service._id}/availability`,
                { params: { date: dateStr } }
            )
            .then((res) => {
                const allTimes = res.data.flatMap((b) => b.times || []);
                setTimes([...new Set(allTimes)].sort());
            })
            .catch(() => {
                setMessage("Цаг ачаалж чадсангүй.");
            })
            .finally(() => setLoadingTimes(false));
    }, [selectedDay, service._id]);

    // --------------------
    // STEP A: Create invoice for 500₮ deposit
    // --------------------
    async function handleCreateInvoice() {
        if (!user?.accessToken) {
            setMessage("Нэвтэрч орно уу (Token алга).");
            return;
        }
        if (!selectedDay || !selectedTime) {
            setMessage("Өдөр болон цаг сонгоно уу.");
            return;
        }

        try {
            setMessage("Төлбөрийн нэхэмжлэл үүсгэж байна...");

            // Create QPay invoice for 500₮
            const invoiceRes = await axios.post(
                "https://backend.foru.mn/api/payments/create-invoice",
                {
                    invoiceCode: "FORU_INVOICE",
                    amount: 50,
                }
            );

            if (invoiceRes.data?.success) {
                setInvoiceId(invoiceRes.data.invoiceData?.invoice_id || "");
                setQrUrl(invoiceRes.data.qrDataUrl || "");

                // Move to next step
                setStep("showInvoice");
                setMessage("Төлбөрийн нэхэмжлэл үүссэн. Та 50₮ төлнө үү.");
            } else {
                setMessage("QPay нэхэмжлэл үүсгэхэд алдаа гарлаа.");
            }
        } catch (err) {
            setMessage("Нэхэмжлэл үүсгэх үед алдаа гарлаа.");
            console.error(err);
        }
    }

    // --------------------
    // STEP B: Check if paid -> create appointment
    // --------------------
    async function handleCheckPayment() {
        if (!invoiceId) {
            setMessage("Invoice ID алга байна. Төлбөр шалгах боломжгүй.");
            return;
        }
        setCheckingPayment(true);
        setMessage("");

        try {
            const checkRes = await axios.post(
                "https://backend.foru.mn/api/payments/check-invoice",
                { invoiceId }
            );

            const payRow = checkRes.data?.checkResult?.rows?.[0];
            const payStatus = payRow?.payment_status || "UNPAID";

            if (payStatus === "PAID") {
                setPaymentDone(true);

                // Create the appointment now
                await createAppointmentAfterPayment();
                setStep("done");
                setMessage("Төлбөр амжилттай! Цаг амжилттай захиалагдлаа.");
            } else {
                setMessage("Төлбөр хараахан төлөгдөөгүй байна.");
            }
        } catch (err) {
            setMessage("Төлбөр шалгахад алдаа гарлаа.");
            console.error(err);
        } finally {
            setCheckingPayment(false);
        }
    }

    // --------------------
    // Actually create the appointment (service.price - 500)
    // --------------------
    async function createAppointmentAfterPayment() {
        if (!user?.accessToken) {
            setMessage("Token алга байна.");
            return;
        }

        // TypeScript guards:
        if (selectedDay == null) {
            setMessage("Өдөр сонгоогүй байна!");
            return;
        }
        if (!selectedTime) {
            setMessage("Цаг сонгоогүй байна!");
            return;
        }

        const dateStr = `2025-01-${String(selectedDay).padStart(2, "0")}`;
        const finalPrice = Math.max(0, service.price - 50);

        try {
            // Either consume the response or remove it
            const { data } = await axios.post(
                "https://backend.foru.mn/api/appointments",
                {
                    serviceId: service._id,
                    date: dateStr,
                    startTime: selectedTime,
                    status: "confirmed",
                    price: finalPrice,
                },
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );
            console.log("Appointment created:", data);

            // Schedule push notification (optional)
            const year = 2025;
            const month = 0; // January
            const dayNum = selectedDay;
            const [hh, mm] = selectedTime.split(":").map(Number);
            const appointmentDate = new Date(year, month, dayNum, hh, mm);
            await handleScheduleReminder(appointmentDate);
        } catch (err) {
            setMessage("Appointment үүсгэхэд алдаа гарлаа.");
            console.error(err);
        }
    }

    // --------------------
    // Schedule push reminder (unchanged logic)
    // --------------------
    async function handleScheduleReminder(appointmentDate: Date) {
        try {
            await axios.post("https://backend.foru.mn/api/notifications/schedule", {
                appointmentDate,
            });
            console.log("Push мэдэгдлийг амжилттай төлөвлөлөө!");
        } catch (err) {
            console.error("Push мэдэгдэл төлөвлөх үед алдаа гарлаа:", err);
        }
    }

    // --------------------
    // Render the Popup
    // --------------------
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white w-full max-w-md rounded-lg relative p-6 shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close booking popup"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {/* STEP 1: Choose day/time */}
                {step === "chooseTime" && (
                    <>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                            {service.name}
                            <span className="ml-2 text-base text-primary font-medium">
                {service.price.toLocaleString()}₮ / deposit 50₮
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

                        {/* Time slots */}
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
                                onClick={handleCreateInvoice}
                                className="px-4 py-2 text-sm rounded-md bg-neutral-900 text-white hover:bg-neutral-700"
                            >
                                Төлбөр (50₮)
                            </button>
                        </div>
                    </>
                )}

                {/* STEP 2: Show invoice + check payment */}
                {step === "showInvoice" && (
                    <div className="text-center px-4 py-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">50₮ төлнө үү</h2>
                        {message && <p className="text-sm text-gray-700 mb-4">{message}</p>}

                        {qrUrl && !paymentDone && (
                            <img
                                src={qrUrl}
                                alt="Төлбөрийн QR"
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
                            Болих
                        </button>
                    </div>
                )}

                {/* STEP 3: Done */}
                {step === "done" && (
                    <div className="text-center px-4 py-6">
                        <h2 className="text-xl font-bold text-green-600 mb-3">Амжилттай!</h2>
                        {message && <p className="text-sm text-gray-700 mb-4">{message}</p>}
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

// --------------------
// Main SalonDetailPage
// --------------------
export default function SalonDetailPage() {
    const params = useParams() as { id?: string };
    const [salon, setSalon] = useState<Salon | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState("");
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const phoneNumber = "+97694641031";
    const shareUrl = `http://localhost:3000/salons/${params.id}`;

    // 1) Load the salon & services
    useEffect(() => {
        if (!params.id) return;
        (async () => {
            try {
                const salonRes = await axios.get<Salon>(
                    `https://backend.foru.mn/api/salons/${params.id}`
                );
                setSalon(salonRes.data);

                const servicesRes = await axios.get<Service[]>(
                    `https://backend.foru.mn/api/services/salon/${params.id}`
                );
                setServices(servicesRes.data);
            } catch (err) {
                console.error("Салон/үйлчилгээ уншихад алдаа:", err);
                setError("Салон болон үйлчилгээ уншихад алдаа гарлаа.");
            }
        })();
    }, [params.id]);

    // 2) Share logic
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

    // 3) Popup open/close
    function openPopup(svc: Service) {
        setSelectedService(svc);
        setShowPopup(true);
    }
    function closePopup() {
        setSelectedService(null);
        setShowPopup(false);
    }

    // 4) Handle error or loading
    if (error) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="flex-1 mx-auto max-w-5xl p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }
    if (!salon) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="flex-1 mx-auto max-w-5xl p-4 text-center text-gray-600">
                    Салон ачаалж байна...
                </div>
            </div>
        );
    }

    // 5) Map link
    const googleMapsLink =
        salon.lat != null && salon.lng != null
            ? `https://maps.google.com/?q=${salon.lat},${salon.lng}`
            : `https://maps.google.com/?q=${encodeURIComponent(salon.location)}`;

    // --------------------
    // Render main page
    // --------------------
    return (
        <div className="flex min-h-screen bg-white">
            <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-6">
                {/* Cover image */}
                {salon.coverImage && (
                    <div className="h-60 bg-gray-200 overflow-hidden mb-6 rounded-md">
                        <img
                            src={salon.coverImage}
                            alt="Хавтасны зураг"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Salon header & share button */}
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
                                <p className="mt-2 text-sm text-gray-600 max-w-prose">{salon.about}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <a
                            href={`tel:${phoneNumber}`}
                            className="inline-flex items-center bg-neutral-900 text-white px-3 py-1.5 rounded-md hover:bg-neutral-700 transition-colors"
                        >
                            <PhoneIcon className="h-5 w-5 mr-2" />
                            Залгах
                        </a>
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
                        >
                            <ShareIcon className="h-5 w-5 mr-1" />
                            Хуваалцах
                        </button>
                    </div>
                </div>

                {/* Services list */}
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

                {/* Map link */}
                <div className="mt-4">
                    <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Газрын зураг дээр харах
                    </a>
                </div>
            </main>

            {/* Booking popup */}
            {showPopup && selectedService && (
                <BookingPopup service={selectedService} onClose={closePopup} />
            )}
        </div>
    );
}
