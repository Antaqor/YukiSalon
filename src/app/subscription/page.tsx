"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// ── Types ───────────────────────────────────────────────
// No QPay integration. Payment is handled manually via bank transfer.

// ── Component ───────────────────────────────────────────
export default function SubscriptionPage() {
  const { user, updateSubscriptionExpiresAt } = useAuth();

  const [message, setMessage] = useState("");
  const [paid, setPaid] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const BASE_URL = "https://www.vone.mn";
  const price =
    memberCount < 10 ? 10000 : memberCount < 30 ? 20000 : 20000; // 0-9 → 10 k, 10-29 → 20 k, 30+ → 20 k

  // ── Helpers ───────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/users/active-subscribers`)
      .then((res) => setMemberCount(res.data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!showPaymentInfo || countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [showPaymentInfo, countdown]);

  // ── Actions ───────────────────────────────────────────
  const createInvoice = () => {
    if (!user) return;

    setShowPaymentInfo(true);
    setCountdown(15 * 60); // 15-minute window

    setMessage(
      `Доорх данс руу ${price.toLocaleString()}₮ шилжүүлнэ үү.\n` +
        `Golomt Bank: 3005127815\n` +
        `Khan Bank: 5926153085\n` +
        `Гүйлгээний утга дээр ${user.username} гэж бичнэ.`,
    );
  };

  const markTransferred = () => {
    setPaid(true);
    setMessage("Таны хүсэлт хүлээн авлаа. Удахгүй баталгаажна.");
  };

  // Payment confirmation is manual; no invoice checking.

  // ── UI ────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Сарын Гишүүнчлэл</h1>

      <p className="mb-2 text-center text-gray-600">
        Сарын төлбөр: эхний 10 гишүүнд 10,000₮, дараагийн 20 гишүүнд
        20,000₮
      </p>
      <p className="mb-4 text-center text-gray-600">
        Одоогийн идэвхтэй гишүүд: {memberCount}. Энэ сарын төлбөр: {price.toLocaleString()}₮
      </p>

      {message && (
        <div className="mb-3 p-2 bg-blue-100 text-blue-800 rounded whitespace-pre-line text-center">
          {message}
        </div>
      )}

      {!paid && (
        <div className="space-y-6">
          {/* 1️⃣ Create invoice */}
          <button
            onClick={createInvoice}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Төлбөр үүсгэх ({price.toLocaleString()}₮)
          </button>

          {/* 2️⃣ Bank info + countdown */}
          {showPaymentInfo && countdown > 0 && (
            <div className="space-y-1 text-center text-sm text-gray-700">
              <p>
                Golomt Bank: <strong>3005127815</strong>
              </p>
              <p>
                Khan Bank: <strong>5926153085</strong>
              </p>
              <p>
                Гүйлгээний утга: <strong>{user?.username}</strong>
              </p>
              <p>
                Үлдсэн хугацаа: {Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")}
              </p>
            </div>
          )}

          {/* 5️⃣ Mark transfer */}
          {showPaymentInfo && (
            <button
              onClick={markTransferred}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Шилжүүлсэн
            </button>
          )}
        </div>
      )}

      {paid && (
        <div className="text-green-600 font-semibold text-center mt-6">
          Таны эрх идэвхжлээ! Одоо та пост оруулах боломжтой.
        </div>
      )}
    </div>
  );
}
