export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        const {
            phone,
            amount,
            orderNumber
        } = req.body || {};

        if (!phone || !amount || !orderNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone, amount and order number are required."
            });
        }

        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const passkey = process.env.MPESA_PASSKEY;
        const shortcode = process.env.MPESA_SHORTCODE;
        const callbackUrl = process.env.MPESA_CALLBACK_URL;

        if (
            !consumerKey ||
            !consumerSecret ||
            !passkey ||
            !shortcode ||
            !callbackUrl
        ) {
            return res.status(500).json({
                success: false,
                message: "M-Pesa environment variables are not fully configured."
            });
        }

        const cleanPhone = String(phone).replace(/\D/g, "");

        let normalizedPhone = cleanPhone;

        if (normalizedPhone.startsWith("0")) {
            normalizedPhone = "254" + normalizedPhone.substring(1);
        }

        if (normalizedPhone.startsWith("+")) {
            normalizedPhone = normalizedPhone.substring(1);
        }

        if (!/^254\d{9}$/.test(normalizedPhone)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid Kenyan phone number."
            });
        }

        const numericAmount = Math.max(1, Math.round(Number(amount)));

        if (!Number.isFinite(numericAmount)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount."
            });
        }

        const authString = Buffer
            .from(`${consumerKey}:${consumerSecret}`)
            .toString("base64");

        const tokenResponse = await fetch(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                method: "GET",
                headers: {
                    Authorization: `Basic ${authString}`
                }
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.access_token) {
            console.error("M-Pesa OAuth error:", tokenData);

            return res.status(500).json({
                success: false,
                message: "Unable to authenticate with M-Pesa Sandbox."
            });
        }

        const timestamp = new Date()
            .toISOString()
            .replace(/\D/g, "")
            .slice(0, 14);

        const password = Buffer
            .from(`${shortcode}${passkey}${timestamp}`)
            .toString("base64");

        const stkResponse = await fetch(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    BusinessShortCode: Number(shortcode),
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: numericAmount,
                    PartyA: normalizedPhone,
                    PartyB: Number(shortcode),
                    PhoneNumber: normalizedPhone,
                    CallBackURL: callbackUrl,
                    AccountReference: String(orderNumber).substring(0, 12),
                    TransactionDesc: "Meteur Online Shopping"
                })
            }
        );

        const stkData = await stkResponse.json();

        console.log("M-Pesa STK response:", stkData);

        if (!stkResponse.ok || stkData.ResponseCode !== "0") {
            return res.status(500).json({
                success: false,
                message: stkData.errorMessage ||
                    stkData.ResponseDescription ||
                    "M-Pesa STK Push request failed.",
                details: stkData
            });
        }

        return res.status(200).json({
            success: true,
            message: "M-Pesa STK Push sent successfully.",
            orderNumber,
            checkoutRequestId: stkData.CheckoutRequestID,
            merchantRequestId: stkData.MerchantRequestID,
            customerMessage: stkData.CustomerMessage || "Check your phone for the M-Pesa prompt."
        });

    } catch (error) {
        console.error("M-Pesa STK Push error:", error);

        return res.status(500).json({
            success: false,
            message: "M-Pesa server error."
        });
    }
}
