"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Төлбөрийн сонголтын төрлийн тодорхойлолт
interface PaymentOption {
    link: string;
    logo: string;
    name: string;
    description?: string;
}

export default function SubscriptionPage() {
    const { user, updateSubscriptionExpiresAt } = useAuth();
    const [invoiceId, setInvoiceId] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [paymentUrls, setPaymentUrls] = useState<PaymentOption[]>([]);
    const [message, setMessage] = useState("");
    const [paid, setPaid] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const BASE_URL =  "https://www.vone.mn";

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            setIsMobile(/android|iphone|ipad|ipod/i.test(userAgent.toLowerCase()));
        };
        checkMobile();
    }, []);

    // Төлбөрийн бичиг (Invoice) үүсгэх
    const createInvoice = async () => {
        try {
            setMessage("Төлбөрийн бичиг үүсгэж байна...");
            if (!user?.accessToken) {
                setMessage("Та эхлээд нэвтэрнэ үү.");
                return;
            }

            const res = await axios.post(
                `${BASE_URL}/api/subscription/create-invoice`,
                {},
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            if (res.data.success) {
                setInvoiceId(res.data.invoiceId);
                setQrUrl(res.data.qrDataUrl);
                // Зөвхөн шаардлагатай төлбөрийн сонголтуудыг шүүж авах
                const filteredUrls = res.data.invoiceData.urls.filter((option: PaymentOption) =>
                    [
                        "Monpay",
                        "Khan bank",
                        "M bank",
                        "Toki App",
                        "Social Pay",
                        "Trade and Development bank",
                    ].includes(option.name)
                );
                setPaymentUrls(filteredUrls);
                setMessage("Төлбөрийн бичиг үүслээ! QR кодыг уншуулах эсвэл төлбөрийн холбоосыг ашиглана уу.");
            } else {
                setMessage("Төлбөрийн бичиг үүсгэхэд алдаа гарлаа.");
            }
        } catch (err) {
            console.error("createInvoice error:", err);
            setMessage("Төлбөрийн бичиг үүсгэхэд алдаа гарлаа.");
        }
    };

    // Төлбөр төлөгдсөн эсэхийг шалгах
    const checkInvoice = async () => {
        try {
            setMessage("Төлбөр шалгаж байна...");
            if (!user?.accessToken) {
                setMessage("Та эхлээд нэвтэрнэ үү.");
                return;
            }

            const res = await axios.post(
                `${BASE_URL}/api/subscription/check-invoice`,
                { invoiceId },
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            if (res.data.paid) {
                setPaid(true);
                setMessage(`Төлбөр амжилттай! Таны эрх дуусах хугацаа: ${res.data.subscriptionExpiresAt}`);
                if (res.data.subscriptionExpiresAt) {
                    updateSubscriptionExpiresAt(res.data.subscriptionExpiresAt);
                }
            } else {
                setMessage("Төлбөр хараахан хийгдээгүй байна.");
            }
        } catch (err) {
            console.error("checkInvoice error:", err);
            setMessage("Төлбөр шалгахад алдаа гарлаа.");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Сарын Гишүүнчлэл
            </h1>
            <p className="mb-4 text-center text-gray-600">
                Төлбөр: 1,000₮ / сар
            </p>

            {message && (
                <div className="mb-3 p-2 bg-blue-100 text-blue-800 rounded text-center">
                    {message}
                </div>
            )}

            {!paid && (
                <div className="space-y-6">
                    <button
                        onClick={createInvoice}
                        className="block w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Төлбөр үүсгэх (1,000₮)
                    </button>

                    {qrUrl && (
                        <div className="text-center">
                            <p className="mb-2 text-gray-600">
                                Төлбөр төлөх QR уншуулна уу:
                            </p>
                            <img
                                src={qrUrl}
                                alt="QPay Subscription"
                                className="mx-auto w-48 h-48 border rounded"
                            />
                        </div>
                    )}

                    {isMobile && paymentUrls.length > 0 && (
                        <div>
                            <p className="mb-2 text-gray-600 text-center">
                                Бусад төлбөрийн сонголтуудыг ашиглах:
                            </p>
                            <ul className="grid grid-cols-2 gap-4">
                                {paymentUrls.map((option, idx) => (
                                    <li key={idx} className="text-center">
                                        <a
                                            href={option.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center space-y-2"
                                        >
                                            <img
                                                src={option.logo}
                                                alt={option.name}
                                                className="w-12 h-12 object-contain"
                                            />
                                            <span className="text-sm text-blue-600 hover:underline">
                                                {option.name}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {invoiceId && (
                        <button
                            onClick={checkInvoice}
                            className="block w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                            Төлбөр шалгах
                        </button>
                    )}
                </div>
            )}

            {paid && (
                <div className="text-green-600 font-semibold text-center mt-6">
                    Таны эрх идэвхэжлээ! Одоо та пост оруулах боломжтой.
                </div>
            )}
        </div>
    );
}
