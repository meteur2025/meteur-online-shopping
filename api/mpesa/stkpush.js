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

        // ---------------------------------------------------------
        // Validate request
        // ---------------------------------------------------------

        if (!phone || !amount || !orderNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone, amount and order number are required."
            });
        }

        // ---------------------------------------------------------
        // Read Vercel environment variables
        // ---------------------------------------------------------

        const consumerKey = process.env.MPESA_CONSUMER_KEY;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        const passkey = process.env.MPESA_PASSKEY;
        const shortcode = process.env.MPESA_SHORTCODE;
        const callbackUrl = process.env.MPESA_CALLBACK_URL;

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // ---------------------------------------------------------
        // Check M-Pesa configuration
        // ---------------------------------------------------------

        const missingMpesaVariables = [];

        if (!consumerKey) {
            missingMpesaVariables.push("MPESA_CONSUMER_KEY");
        }

        if (!consumerSecret) {
            missingMpesaVariables.push("MPESA_CONSUMER_SECRET");
        }

        if (!passkey) {
            missingMpesaVariables.push("MPESA_PASSKEY");
        }

        if (!shortcode) {
            missingMpesaVariables.push("MPESA_SHORTCODE");
        }

        if (!callbackUrl) {
            missingMpesaVariables.push("MPESA_CALLBACK_URL");
        }

        if (missingMpesaVariables.length > 0) {
            console.error(
                "Missing M-Pesa environment variables:",
                missingMpesaVariables
            );

            return res.status(500).json({
                success: false,
                message:
                    "M-Pesa environment variables are not fully configured.",
                missing:
                    missingMpesaVariables
            });
        }

        // ---------------------------------------------------------
        // Check Supabase server configuration
        // ---------------------------------------------------------

        if (!supabaseUrl || !serviceRoleKey) {
            console.error(
                "Missing Supabase server environment variables."
            );

            return res.status(500).json({
                success: false,
                message:
                    "Supabase server environment variables are not configured."
            });
        }

        // ---------------------------------------------------------
        // Normalize Kenyan phone number
        // ---------------------------------------------------------

        let cleanPhone =
            String(phone).replace(/\D/g, "");

        let normalizedPhone =
            cleanPhone;

        if (normalizedPhone.startsWith("0")) {
            normalizedPhone =
                "254" +
                normalizedPhone.substring(1);
        }

        if (normalizedPhone.startsWith("+")) {
            normalizedPhone =
                normalizedPhone.substring(1);
        }

        if (!/^254\d{9}$/.test(normalizedPhone)) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid Kenyan phone number, for example 0712345678."
            });
        }

        // ---------------------------------------------------------
        // Validate payment amount
        // ---------------------------------------------------------

        const parsedAmount =
            Number(amount);

        if (
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment amount."
            });
        }

        /*
         * M-Pesa accepts whole Kenyan Shilling amounts.
         */
        const numericAmount =
            Math.max(
                1,
                Math.round(parsedAmount)
            );

        // ---------------------------------------------------------
        // Validate shortcode
        // ---------------------------------------------------------

        const cleanShortcode =
            String(shortcode)
                .replace(/\D/g, "");

        if (!cleanShortcode) {
            return res.status(500).json({
                success: false,
                message:
                    "M-Pesa shortcode is not configured correctly."
            });
        }

        // ---------------------------------------------------------
        // Generate OAuth credentials
        // ---------------------------------------------------------

        const authString =
            Buffer
                .from(
                    `${consumerKey}:${consumerSecret}`
                )
                .toString("base64");

        console.log(
            "Requesting M-Pesa OAuth token..."
        );

        const tokenResponse =
            await fetch(
                "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Basic ${authString}`
                    }
                }
            );

        const tokenText =
            await tokenResponse.text();

        let tokenData = {};

        try {
            tokenData =
                JSON.parse(tokenText);
        } catch {
            tokenData = {
                raw:
                    tokenText
            };
        }

        if (
            !tokenResponse.ok ||
            !tokenData.access_token
        ) {
            console.error(
                "M-Pesa OAuth failed:",
                {
                    status:
                        tokenResponse.status,

                    response:
                        tokenData
                }
            );

            return res.status(502).json({
                success: false,
                message:
                    "Unable to authenticate with M-Pesa Sandbox.",
                details:
                    tokenData
            });
        }

        // ---------------------------------------------------------
        // Generate Nairobi timestamp
        // Format: YYYYMMDDHHmmss
        // ---------------------------------------------------------

        const now =
            new Date();

        const parts =
            new Intl.DateTimeFormat(
                "en-GB",
                {
                    timeZone:
                        "Africa/Nairobi",

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit",

                    hourCycle:
                        "h23"
                }
            ).formatToParts(now);

        const getPart =
            (type) =>
                parts.find(
                    part =>
                        part.type === type
                )?.value || "";

        const timestamp =
            getPart("year") +
            getPart("month") +
            getPart("day") +
            getPart("hour") +
            getPart("minute") +
            getPart("second");

        // ---------------------------------------------------------
        // Generate STK password
        // ---------------------------------------------------------

        const password =
            Buffer
                .from(
                    `${cleanShortcode}${passkey}${timestamp}`
                )
                .toString("base64");

        // ---------------------------------------------------------
        // Prepare account reference
        // ---------------------------------------------------------

        const accountReference =
            String(orderNumber)
                .replace(/[^a-zA-Z0-9]/g, "")
                .substring(0, 12);

        // ---------------------------------------------------------
        // Send STK Push
        // ---------------------------------------------------------

        console.log(
            "Sending M-Pesa STK Push:",
            {
                orderNumber,
                amount:
                    numericAmount,

                phone:
                    normalizedPhone,

                shortcode:
                    cleanShortcode,

                timestamp
            }
        );

        const stkResponse =
            await fetch(
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${tokenData.access_token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            BusinessShortCode:
                                Number(cleanShortcode),

                            Password:
                                password,

                            Timestamp:
                                timestamp,

                            TransactionType:
                                "CustomerPayBillOnline",

                            Amount:
                                numericAmount,

                            PartyA:
                                normalizedPhone,

                            PartyB:
                                Number(cleanShortcode),

                            PhoneNumber:
                                normalizedPhone,

                            CallBackURL:
                                callbackUrl,

                            AccountReference:
                                accountReference,

                            TransactionDesc:
                                "Meteur Mobile Kenya"
                        })
                }
            );

        const stkText =
            await stkResponse.text();

        let stkData = {};

        try {
            stkData =
                JSON.parse(stkText);
        } catch {
            stkData = {
                raw:
                    stkText
            };
        }

        console.log(
            "M-Pesa STK response:",
            {
                status:
                    stkResponse.status,

                response:
                    stkData
            }
        );

        if (
            !stkResponse.ok ||
            String(stkData.ResponseCode) !== "0"
        ) {
            return res.status(502).json({
                success: false,

                message:
                    stkData.errorMessage ||
                    stkData.ResponseDescription ||
                    "M-Pesa STK Push request failed.",

                details:
                    stkData
            });
        }

        // ---------------------------------------------------------
        // Get payment request IDs
        // ---------------------------------------------------------

        const checkoutRequestId =
            stkData.CheckoutRequestID;

        const merchantRequestId =
            stkData.MerchantRequestID;

        if (!checkoutRequestId) {
            console.error(
                "M-Pesa did not return CheckoutRequestID:",
                stkData
            );

            return res.status(502).json({
                success: false,
                message:
                    "M-Pesa did not return a payment request ID.",
                details:
                    stkData
            });
        }

        // ---------------------------------------------------------
        // Save M-Pesa request information to Supabase
        // ---------------------------------------------------------

        const updateUrl =
            `${supabaseUrl}/rest/v1/orders` +
            `?order_number=eq.${encodeURIComponent(
                orderNumber
            )}`;

        const updateResponse =
            await fetch(
                updateUrl,
                {
                    method: "PATCH",

                    headers: {
                        apikey:
                            serviceRoleKey,

                        Authorization:
                            `Bearer ${serviceRoleKey}`,

                        "Content-Type":
                            "application/json",

                        Prefer:
                            "return=representation"
                    },

                    body:
                        JSON.stringify({
                            checkout_request_id:
                                checkoutRequestId,

                            merchant_request_id:
                                merchantRequestId ||
                                null,

                            mpesa_phone_number:
                                normalizedPhone,

                            updated_at:
                                new Date().toISOString()
                        })
                }
            );

        const updatedOrdersText =
            await updateResponse.text();

        let updatedOrders = [];

        try {
            updatedOrders =
                JSON.parse(
                    updatedOrdersText
                );
        } catch {
            updatedOrders = [];
        }

        if (!updateResponse.ok) {
            console.error(
                "Supabase order update failed:",
                {
                    status:
                        updateResponse.status,

                    response:
                        updatedOrders
                }
            );

            return res.status(500).json({
                success: false,
                message:
                    "M-Pesa started, but the payment reference could not be saved to the order.",
                details:
                    updatedOrders
            });
        }

        if (
            !Array.isArray(updatedOrders) ||
            updatedOrders.length === 0
        ) {
            console.error(
                "No matching order found:",
                orderNumber
            );

            return res.status(500).json({
                success: false,
                message:
                    "The M-Pesa request was accepted, but the matching order could not be found."
            });
        }

        // ---------------------------------------------------------
        // Success
        // ---------------------------------------------------------

        console.log(
            "M-Pesa STK Push successfully initiated:",
            {
                orderNumber,
                checkoutRequestId,
                merchantRequestId,
                amount:
                    numericAmount,
                phone:
                    normalizedPhone
            }
        );

        return res.status(200).json({
            success:
                true,

            message:
                "M-Pesa STK Push sent successfully.",

            orderNumber:
                orderNumber,

            checkoutRequestId:
                checkoutRequestId,

            merchantRequestId:
                merchantRequestId,

            amount:
                numericAmount,

            customerMessage:
                stkData.CustomerMessage ||
                "Check your phone for the M-Pesa payment prompt."
        });

    } catch (error) {

        console.error(
            "M-Pesa STK Push server error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "M-Pesa server error. Please try again.",

            error:
                error?.message ||
                String(error)
        });
    }
}
