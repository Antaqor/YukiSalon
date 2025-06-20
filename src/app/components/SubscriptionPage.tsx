"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../lib/config";

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

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor;
        setIsMobile(/android|iphone|ipad|ipod/i.test(userAgent.toLowerCase()));
    }, []);

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
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            if (res.data.success) {
                setInvoiceId(res.data.invoiceId);
                setQrUrl(res.data.qrDataUrl);
                const filteredUrls = res.data.invoiceData.urls.filter(
                    (option: PaymentOption) =>
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
                setMessage(
                    "Invoice created! Please scan the QR or use the payment links."
                );
            } else {
                setMessage("Failed to create invoice.");
            }
        } catch (err) {
            console.error("createInvoice error:", err);
            setMessage("Error creating invoice.");
        }
    };

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
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
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
        <div className="max-w-xl mx-auto p-4 text-black bg-white">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Сарын Гишүүнчлэл
            </h1>
            <p className="mb-4 text-center text-gray-400">
                Сарын төлбөр: эхний 10 гишүүнд 10,000₮, дараагийн 20 гишүүнд
                20,000₮
            </p>
            <div className="mb-6 text-center space-y-1 text-sm text-gray-300">
                <p>Golomt Bank: <strong>3005127815</strong></p>
                <p>Khan Bank: <strong>5926153085</strong></p>
            </div>
            {message && (
                <div className="mb-3 p-2 bg-blue-900 text-blue-300 rounded text-center">
                    {message}
                </div>
            )}
            {!paid && (
                <div className="space-y-6">
                    <button
                        onClick={createInvoice}
                        className="block w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Төлбөр (1,000₮) төлөх
                    </button>
                    {qrUrl && (
                        <div className="text-center">
                            <p className="mb-2 text-gray-400">QR уншуулна уу:</p>
                            <img
                                src={qrUrl}
                                alt="QPay Subscription"
                                className="mx-auto w-48 h-48 border rounded"
                            />
                        </div>
                    )}
                    {isMobile && paymentUrls.length > 0 && (
                        <div>
                            <p className="mb-2 text-gray-400 text-center">
                                Банкны аппаар төлөх:
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
                                            <span className="text-sm text-blue-400 hover:underline">
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
                            Төлбөр төлөлт шалгах
                        </button>
                    )}
                </div>
            )}
            {paid && (
                <div className="text-green-400 font-semibold text-center mt-6">
                    Таны Subscription нэг сарын эрх идэвхчлээ
                </div>
            )}
        </div>
    );
}