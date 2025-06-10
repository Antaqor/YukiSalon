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
    const [memberCount, setMemberCount] = useState(0);
    const [showPaymentInfo, setShowPaymentInfo] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const BASE_URL =  "https://www.vone.mn";
    const price = memberCount < 10 ? 10000 : memberCount < 30 ? 20000 : 20000;

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            setIsMobile(/android|iphone|ipad|ipod/i.test(userAgent.toLowerCase()));
        };
        checkMobile();
        // Fetch active subscriber count
        axios
            .get(`${BASE_URL}/api/users/active-subscribers`)
            .then((res) => setMemberCount(res.data.count))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!showPaymentInfo || countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [showPaymentInfo, countdown]);

    // Төлбөрийн бичиг (Invoice) үүсгэх
    const createInvoice = async () => {
        setShowPaymentInfo(true);
        setCountdown(15 * 60);
        setMessage(
            `Golomt Bank 3005127815 руу ${price.toLocaleString()}₮ шилжүүлнэ. ` +
                `15 минутын дотор таны хүсэлтийг хүлээн авна. ` +
                `Гүйлгээний утга дээр ${user?.username} заавал оруулна. ` +
                `94641031 руу залгаж асууж болно.`
        );

        try {
            if (!user?.accessToken) {
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
            }
        } catch (err) {
            console.error("createInvoice error:", err);
        }
    };

    const markTransferred = () => {
        setPaid(true);
        setMessage("Таны хүсэлт идэвхжихлээ!");
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
                Одоогийн идэвхтэй гишүүд: {memberCount}. Энэ сарын төлбөр:
                {" "}
                {price.toLocaleString()}₮
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
                        Төлбөр үүсгэх ({price.toLocaleString()}₮)
                    </button>

                    {showPaymentInfo && countdown > 0 && (
                        <div className="space-y-1 text-center text-sm text-gray-700">
                            <p>Golomt Bank: <strong>3005127815</strong></p>
                            <p>Khan Bank: <strong>5926153085</strong></p>
                            <p>
                                Гүйлгээний утга дээр <strong>{user?.username}</strong>
                                {" "}оруулна уу.
                            </p>
                            <p>
                                Үлдсэн хугацаа: {Math.floor(countdown / 60)}:
                                {(countdown % 60).toString().padStart(2, "0")}
                            </p>
                        </div>
                    )}

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

                    {showPaymentInfo && (
                        <button
                            onClick={markTransferred}
                            className="block w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                            Шилжүүлсэн
                        </button>
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
