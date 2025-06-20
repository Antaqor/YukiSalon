"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../lib/config";

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

  const isPro =
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date();

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
      `Манай Premium клубт нэгдэхийн тулд ${price.toLocaleString()}₮-г дараах дансуудын аль нэг рүү шилжүүлнэ үү.\n` +
        `Golomt Bank: 3005127815\n` +
        `Khan Bank: 5926153085\n` +
        `Гүйлгээний утга дээр ${user.username} гэж бичээрэй.`,
    );
  };

  const markTransferred = () => {
    if (!user?.accessToken || !user._id) {
      setMessage("Нэвтэрч ороогүй байна.");
      return;
    }
    fetch(`${BASE_URL}/api/users/${user._id}/transferred`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
      .then(() => {
        setPaid(true);
        setMessage("Таны хүсэлт хүлээн авлаа. Удахгүй баталгаажна.");
      })
      .catch(() => {
        setMessage("Алдаа гарлаа!");
      });
  };

  // Payment confirmation is manual; no invoice checking.

  // ── UI ────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Premium Membership</h1>

      <p className="mb-2 text-center text-gray-600">
        Гишүүн болсон хэрэглэгчид #AI зэрэг үнэ цэнтэй нийтлэлүүдийг бүрэн
        үзэх боломжтой.
      </p>

      <p className="mb-2 text-center text-gray-600">
        Нэгдүгээр 10 гишүүнд 10,000₮, дараагийнх нь 20,000₮ – амжилтыг өнөөдөр эхлүүлье!
      </p>
      <p className="mb-4 text-center text-gray-600">
        Одоогийн идэвхтэй гишүүд: {memberCount}. Таны төлбөр: {price.toLocaleString()}₮
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
            <div className="space-y-1 text-center text-sm text-white">
              <p>
                Golomt Bank: <strong>3005127815</strong>
              </p>
              <p>
                Khan Bank: <strong>5926153085</strong>
              </p>
              <p>
                Гүйлгээний утга: <strong>{user?.username}</strong>
              </p>
              <p className="text-[#CD4178]">
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

      {(isPro || paid) && (
        <div className="mt-10 space-y-4 text-center">
          <p className="text-green-700 font-semibold">
            Таны гишүүнчлэл идэвхтэй!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/books" className="px-4 py-2 bg-blue-600 text-white rounded">
              Data
            </Link>
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded">
              Feed
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
