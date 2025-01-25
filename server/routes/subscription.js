// server/routes/subscription.js
const express = require("express");
const axios = require("axios");
const QRCode = require("qrcode");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * QPay AccessToken авах helper
 */
async function getQpayToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }
    const clientId = process.env.QPAY_CLIENT_ID || "FORU";
    const clientSecret = process.env.QPAY_CLIENT_SECRET || "fMZxsPLj";
    const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const resp = await axios.post("https://merchant.qpay.mn/v2/auth/token", {}, {
        headers: {
            Authorization: `Basic ${base64}`,
            "Content-Type": "application/json",
        },
    });
    const { access_token, expires_in } = resp.data;
    cachedToken = access_token;
    tokenExpiresAt = Date.now() + expires_in * 1000;
    return cachedToken;
}

/**
 * POST /api/subscription/create-invoice
 * => 1,000₮ төлбөр үүсгэх
 */
router.post("/create-invoice", authenticateToken, async (req, res) => {
    try {
        // 1) Хэрэглэгчийн ID
        const userId = req.user.id; // authenticateToken-аас
        // 2) QPay Invoice Code -- QPay Portal дээр үүнийг "invoice code" маягаар бүртгэсэн байх
        //   Жишээ нь: process.env.QPAY_INVOICE_CODE="FORU_INVOICE"
        const invoiceCode = process.env.QPAY_INVOICE_CODE || "FORU_INVOICE";

        // 3) Төлбөрийн дүн
        const subscriptionFee = 20;

        // 4) QPay AccessToken авах
        const token = await getQpayToken();

        // 5) Sender invoice no => давтагдашгүй
        const senderInvoiceNo = "sub_" + userId + "_" + Date.now();

        // 6) Payload
        const payload = {
            // Үүнийг QPay Portal-д урьдчилан бүртгэсэн байх ёстой!
            invoice_code: invoiceCode,
            sender_invoice_no: senderInvoiceNo,
            invoice_receiver_code: "terminal",
            amount: subscriptionFee,
            invoice_description: "Monthly Subscription",
            callback_url: "https://your-domain.mn/api/subscription/callback",
        };

        // 7) QPay рүү илгээх
        const response = await axios.post("https://merchant.qpay.mn/v2/invoice", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        // 8) Амжилттай -> QR үүсгэх
        const invoiceData = response.data;
        let qrDataUrl = null;
        if (invoiceData.qr_text) {
            qrDataUrl = await QRCode.toDataURL(invoiceData.qr_text);
        }

        return res.json({
            success: true,
            invoiceId: invoiceData.invoice_id,
            qrDataUrl,
            invoiceData,
        });
    } catch (err) {
        console.error("Error creating subscription invoice:", err?.response?.data || err);
        return res.status(500).json({
            success: false,
            error: err?.response?.data || err.toString(),
        });
    }
});

/**
 * POST /api/subscription/check-invoice
 * => invoice төлбөр төлөгдсөн эсэх шалгаад, OK бол subscriptionExpiresAt-г 30 хоног сунгана
 */
router.post("/check-invoice", authenticateToken, async (req, res) => {
    try {
        const { invoiceId } = req.body;
        if (!invoiceId) {
            return res.status(400).json({ success: false, error: "Missing invoiceId" });
        }

        const token = await getQpayToken();
        const checkPayload = {
            object_type: "INVOICE",
            object_id: invoiceId,
            offset: { page_number: 1, page_limit: 100 },
        };

        const checkResp = await axios.post("https://merchant.qpay.mn/v2/payment/check", checkPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        // Хамгийн энгийн байдлаар payment_status==="PAID" эсэхийг шалгана
        const rows = checkResp.data?.rows || [];
        let paid = false;
        for (const row of rows) {
            if (row.payment_status === "PAID") {
                paid = true;
                break;
            }
        }

        if (!paid) {
            return res.json({ success: true, paid: false });
        }

        // Paid => User subscription-г 30 хоног сунгах
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        const now = new Date();
        user.subscriptionExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await user.save();

        return res.json({
            success: true,
            paid: true,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
        });
    } catch (err) {
        console.error("Error checking subscription invoice:", err?.response?.data || err);
        return res.status(500).json({
            success: false,
            error: err?.response?.data || err.toString(),
        });
    }
});

/**
 * QPay callback (optional)
 */
router.post("/callback", async (req, res) => {
    try {
        console.log("QPay SUBSCRIPTION callback data:", req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error("QPay callback error:", err);
        res.sendStatus(500);
    }
});

module.exports = router;
