// app/subscription/page.tsx
"use client";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function SubscriptionPage() {
    const { user, updateSubscriptionExpiresAt } = useAuth();
    const [invoiceId, setInvoiceId] = useState("");
    const [qrUrl, setQrUrl] = useState("");
    const [message, setMessage] = useState("");
    const [paid, setPaid] = useState(false);

    const BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

    // 1) Create invoice (1,000₮)
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
                setMessage("Invoice created! Please scan the QR to pay 1,000₮.");
            } else {
                setMessage("Failed to create invoice.");
            }
        } catch (err) {
            console.error("createInvoice error:", err);
            setMessage("Error creating invoice.");
        }
    };

    // 2) Check invoice
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
                // Context дээр subscription хугацааг шинэчилнэ => Header автоматаар "Member" болно
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
            <h1 className="text-2xl font-bold mb-4">Monthly Subscription</h1>
            <p className="mb-2">Price: 1,000₮ / month</p>

            {message && <div className="mb-3 text-gray-700">{message}</div>}

            {!paid && (
                <div className="space-y-4">
                    <button
                        onClick={createInvoice}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Create Invoice (1,000₮)
                    </button>

                    {qrUrl && (
                        <div>
                            <p>Scan this QR to pay:</p>
                            <img
                                src={qrUrl}
                                alt="QPay Subscription"
                                className="max-w-[200px] border"
                            />
                        </div>
                    )}

                    {invoiceId && (
                        <button
                            onClick={checkInvoice}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Check Payment
                        </button>
                    )}
                </div>
            )}

            {paid && (
                <div className="text-green-600 font-semibold mt-4">
                    Subscription is active! Now you can post.
                </div>
            )}
        </div>
    );
}
