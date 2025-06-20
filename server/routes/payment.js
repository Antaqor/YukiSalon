const express = require("express");
const axios = require("axios");
const QRCode = require("qrcode");

const routerPayment = express.Router();

let cachedToken = null;
let tokenExpiresAt = 0;

async function getQpayToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    const clientId = process.env.QPAY_CLIENT_ID || "FORU";
    const clientSecret = process.env.QPAY_CLIENT_SECRET;
    if (!clientSecret) {
        throw new Error("QPAY_CLIENT_SECRET is not configured");
    }
    const base64 = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const resp = await axios.post(
        "https://merchant.qpay.mn/v2/auth/token",
        {},
        {
            headers: {
                Authorization: `Basic ${base64}`,
                "Content-Type": "application/json",
            },
        }
    );

    const { access_token, expires_in } = resp.data;
    cachedToken = access_token;
    tokenExpiresAt = Date.now() + expires_in * 1000;
    return cachedToken;
}

routerPayment.post("/create-invoice", async (req, res) => {
    try {
        const { invoiceCode } = req.body;
        const depositAmount = 50; // Hardcoded deposit

        const token = await getQpayToken();

        const payload = {
            invoice_code: invoiceCode || "FORU_INVOICE",
            sender_invoice_no: "123456",
            invoice_receiver_code: "terminal",
            amount: depositAmount,
            invoice_description: "Deposit invoice (50₮)",
            callback_url: "https://your-domain-or-ngrok/qpay-callback",
        };

        const response = await axios.post(
            "https://merchant.qpay.mn/v2/invoice",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const invoiceData = response.data;
        let qrDataUrl = null;
        if (invoiceData.qr_text) {
            qrDataUrl = await QRCode.toDataURL(invoiceData.qr_text);
        }

        return res.json({ success: true, invoiceData, qrDataUrl });
    } catch (error) {
        console.error("Error creating invoice:", error?.response?.data || error);
        return res.status(500).json({
            success: false,
            error: error?.response?.data || error.toString(),
        });
    }
});

routerPayment.post("/check-invoice", async (req, res) => {
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

        const checkResp = await axios.post(
            "https://merchant.qpay.mn/v2/payment/check",
            checkPayload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return res.json({ success: true, checkResult: checkResp.data });
    } catch (error) {
        console.error("Error checking invoice:", error?.response?.data || error);
        return res.status(500).json({
            success: false,
            error: error?.response?.data || error.toString(),
        });
    }
});

routerPayment.post("/callback", async (req, res) => {
    try {
        console.log("QPay callback data:", req.body);
        return res.sendStatus(200);
    } catch (error) {
        console.error("Error in QPay callback:", error);
        return res.sendStatus(500);
    }
});

module.exports = routerPayment;
