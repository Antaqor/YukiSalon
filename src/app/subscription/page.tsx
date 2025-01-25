"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Payment Option-ийн бүтэц тодорхойлолт
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
    const [paymentUrls, setPaymentUrls] = useState<PaymentOption[]>([]); // Payment options төрлийн массив
    const [message, setMessage] = useState("");
    const [paid, setPaid] = useState(false);
    const [isMobile, setIsMobile] = useState(false); // Утаснаас хандаж байгаа эсэхийг шалгах

    const BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    // **Утаснаас хандаж байгаа эсэхийг шалгах**
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            setIsMobile(/android|iphone|ipad|ipod/i.test(userAgent.toLowerCase()));
        };
        checkMobile();
    }, []);

    // **Invoice үүсгэх функц**
    const createInvoice = async () => {
        try {
            setMessage("Creating invoice...");
            if (!user?.accessToken) {
                setMessage("Please login first.");
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
                // Зөвхөн шаардлагатай сонголтуудыг шүүнэ
                const filteredUrls = res.data.invoiceData.urls.filter((option: PaymentOption) =>
                    ["Мон Пэй", "Хаан банк", "М банк", "Toki App"].includes(option.name)
                );
                setPaymentUrls(filteredUrls);
                setMessage("Invoice created! Please scan the QR or use the payment links.");
            } else {
                setMessage("Failed to create invoice.");
            }
        } catch (err) {
            console.error("createInvoice error:", err);
            setMessage("Error creating invoice.");
        }
    };

    // **Invoice төлбөр шалгах функц**
    const checkInvoice = async () => {
        try {
            setMessage("Checking payment status...");
            if (!user?.accessToken) {
                setMessage("Please login first.");
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
                setMessage(
                    `Төлбөр амжилттай! Таны subscription: ${res.data.subscriptionExpiresAt}`
                );
                if (res.data.subscriptionExpiresAt) {
                    updateSubscriptionExpiresAt(res.data.subscriptionExpiresAt);
                }
            } else {
                setMessage("Төлбөр хараахан төлөгдөөгүй байна.");
            }
        } catch (err) {
            console.error("checkInvoice error:", err);
            setMessage("Error checking payment.");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">Monthly Subscription</h1>
            <p className="mb-4 text-center text-gray-600">Price: 1,000₮ / month</p>

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
                        Create Invoice (1,000₮)
                    </button>

                    {qrUrl && (
                        <div className="text-center">
                            <p className="mb-2 text-gray-600">Scan this QR to pay:</p>
                            <img
                                src={qrUrl}
                                alt="QPay Subscription"
                                className="mx-auto w-48 h-48 border rounded"
                            />
                        </div>
                    )}

                    {isMobile && paymentUrls.length > 0 && (
                        <div>
                            <p className="mb-2 text-gray-600 text-center">Or use these payment options:</p>
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
                            Check Payment
                        </button>
                    )}
                </div>
            )}

            {paid && (
                <div className="text-green-600 font-semibold text-center mt-6">
                    Subscription is active! Now you can post.
                </div>
            )}
        </div>
    );
}
