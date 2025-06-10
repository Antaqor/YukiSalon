"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// ── Types ───────────────────────────────────────────────
interface PaymentOption {
  link: string;
  logo: string;
  name: string;
  description?: string;
}

// ── Component ───────────────────────────────────────────
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

  const BASE_URL = "https://www.vone.mn";
  const price =
    memberCount < 10 ? 10000 : memberCount < 30 ? 20000 : 20000; // 0-9 → 10 k, 10-29 → 20 k, 30+ → 20 k

  // ── Helpers ───────────────────────────────────────────
  useEffect(() => {
    setIsMobile(
      /android|iphone|ipad|ipod/i.test(
        (navigator.userAgent || navigator.vendor).toLowerCase(),
      ),
    );

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
  const createInvoice = async () => {
    if (!user?.accessToken) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/subscription/create-invoice`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );

      if (!res.data.success) {
        setMessage("Төлбөрийн бичиг үүсгэхэд алдаа гарлаа.");
        return;
      }

      // success 🎉
      setInvoiceId(res.data.invoiceId);
      setQrUrl(res.data.qrDataUrl);
      setPaymentUrls(
        res.data.invoiceData.urls.filter((o: PaymentOption) =>
          [
            "Monpay",
            "Khan bank",
            "M bank",
            "Toki App",
            "Social Pay",
            "Trade and Development bank",
          ].includes(o.name),
        ),
      );

      setShowPaymentInfo(true);
      setCountdown(15 * 60); // 15-minute window

      setMessage(
        `Төлбөрийн бичиг үүслээ! QR код уншуулах эсвэл доорх данс руу ${price.toLocaleString()}₮ шилжүүлнэ үү.\n` +
          `Golomt: 3005127815 • Khan: 5926153085\n` +
          `Гүйлгээний утга дээр ${user.username} гэж бичнэ. 94641031 руу лавлаж болно.`,
      );
    } catch (err) {
      console.error("createInvoice error:", err);
      setMessage("Сүлжээний алдаа. Дахин оролдоно уу.");
    }
  };

  const markTransferred = () => {
    setPaid(true);
    setMessage("Таны хүсэлт хүлээн авлаа. Удахгүй баталгаажна.");
  };

  const checkInvoice = async () => {
    if (!user?.accessToken) {
      setMessage("Та эхлээд нэвтэрнэ үү.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/subscription/check-invoice`,
        { invoiceId },
        { headers: { Authorization: `Bearer ${user.accessToken}` } },
      );

      if (res.data.paid) {
        setPaid(true);
        setMessage(
          `Төлбөр амжилттай! Таны эрх: ${res.data.subscriptionExpiresAt}`,
        );
        res.data.subscriptionExpiresAt &&
          updateSubscriptionExpiresAt(res.data.subscriptionExpiresAt);
      } else {
        setMessage("Төлбөр хараахан хийгдээгүй байна.");
      }
    } catch (err) {
      console.error("checkInvoice error:", err);
      setMessage("Төлбөр шалгахад алдаа гарлаа.");
    }
  };

  // ── UI ────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Сарын Гишүүнчлэл</h1>

      <p className="mb-4 text-center text-gray-600">
        Одоогийн идэвхтэй гишүүд: {memberCount}. Энэ сарын төлбөр:{" "}
        {price.toLocaleString()}₮
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

          {/* 3️⃣ QPay QR */}
          {qrUrl && (
            <div className="text-center">
              <p className="mb-2 text-gray-600">QR-ийг уншуулна уу:</p>
              <img
                src={qrUrl}
                alt="QPay Subscription"
                className="mx-auto w-48 h-48 border rounded"
              />
            </div>
          )}

          {/* 4️⃣ Mobile-friendly pay links */}
          {isMobile && paymentUrls.length > 0 && (
            <div>
              <p className="mb-2 text-center text-gray-600">
                Бусад төлбөрийн сонголт:
              </p>
              <ul className="grid grid-cols-2 gap-4">
                {paymentUrls.map((o, i) => (
                  <li key={i} className="text-center">
                    <a
                      href={o.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2"
                    >
                      <img
                        src={o.logo}
                        alt={o.name}
                        className="w-12 h-12 object-contain"
                      />
                      <span className="text-sm text-blue-600 hover:underline">
                        {o.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
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

          {/* 6️⃣ Check invoice */}
          {invoiceId && (
            <button
              onClick={checkInvoice}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Төлбөр шалгах
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
