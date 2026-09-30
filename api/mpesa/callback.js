export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(200).json({
            success: true,
            message: "M-Pesa callback endpoint is ready."
        });
    }

    try {
        const callbackData =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : (req.body || {});

        console.log(
            "M-Pesa callback received:",
            JSON.stringify(callbackData)
        );

        const stkCallback = callbackData?.Body?.stkCallback;

        if (!stkCallback) {
            console.error("Invalid M-Pesa callback structure.");

            return res.status(400).json({
                ResultCode: 1,
                ResultDesc: "Invalid callback data."
            });
        }

        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const merchantRequestId = stkCallback.MerchantRequestID;
        const resultCode = Number(stkCallback.ResultCode);

        const resultDescription =
            stkCallback.ResultDesc ||
            "No result description provided.";

        if (!checkoutRequestId) {
            console.error("Missing CheckoutRequestID.");

            return res.status(400).json({
                ResultCode: 1,
                ResultDesc: "CheckoutRequestID is missing."
            });
        }

        const callbackItems =
            stkCallback.CallbackMetadata?.Item || [];

        const getMetadata = (name) => {
            const item = callbackItems.find(
                (entry) => entry.Name === name
            );

            return item?.Value ?? null;
        };

        const mpesaReceiptNumber =
            getMetadata("MpesaReceiptNumber");

        const transactionDate =
            getMetadata("TransactionDate");

        const mpesaPhoneNumber =
            getMetadata("PhoneNumber");

        const supabaseUrl =
            process.env.SUPABASE_URL;

        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error(
                "Supabase server environment variables are missing."
            );

            return res.status(500).json({
                ResultCode: 1,
                ResultDesc:
                    "Supabase environment variables are not configured."
            });
        }

        let paymentStatus = "Failed";
        let orderStatus = "Payment Failed";

        if (resultCode === 0) {
            paymentStatus = "Paid";
            orderStatus = "Processing";
        }

        const updateData = {
            payment_status: paymentStatus,
            status: orderStatus,

            checkout_request_id:
                checkoutRequestId,

            merchant_request_id:
                merchantRequestId || null,

            mpesa_receipt_number:
                mpesaReceiptNumber
                    ? String(mpesaReceiptNumber)
                    : null,

            mpesa_transaction_date:
                transactionDate
                    ? String(transactionDate)
                    : null,

            mpesa_phone_number:
                mpesaPhoneNumber
                    ? String(mpesaPhoneNumber)
                    : null,

            payment_result_code:
                resultCode,

            payment_result_description:
                resultDescription,

            updated_at:
                new Date().toISOString()
        };

        const updateUrl =
            `${supabaseUrl}/rest/v1/orders` +
            `?checkout_request_id=eq.${encodeURIComponent(
                checkoutRequestId
            )}`;

        const updateResponse = await fetch(
            updateUrl,
            {
                method: "PATCH",

                headers: {
                    apikey: serviceRoleKey,

                    Authorization:
                        `Bearer ${serviceRoleKey}`,

                    "Content-Type":
                        "application/json",

                    Prefer:
                        "return=representation"
                },

                body:
                    JSON.stringify(updateData)
            }
        );

        const updatedOrders =
            await updateResponse.json();

        if (!updateResponse.ok) {
            console.error(
                "Supabase order update failed:",
                updatedOrders
            );

            return res.status(500).json({
                ResultCode: 1,
                ResultDesc:
                    "Payment callback could not update the order."
            });
        }

        if (
            !Array.isArray(updatedOrders) ||
            updatedOrders.length === 0
        ) {
            console.error(
                "No order found for CheckoutRequestID:",
                checkoutRequestId
            );

            return res.status(500).json({
                ResultCode: 1,
                ResultDesc:
                    "No matching order was found."
            });
        }

        console.log(
            "M-Pesa payment status updated:",
            JSON.stringify({
                checkoutRequestId,
                paymentStatus,
                orderStatus,
                mpesaReceiptNumber
            })
        );

        return res.status(200).json({
            ResultCode: 0,
            ResultDesc:
                "Callback processed successfully."
        });

    } catch (error) {
        console.error(
            "M-Pesa callback processing error:",
            error
        );

        return res.status(500).json({
            ResultCode: 1,
            ResultDesc:
                "Callback processing failed."
        });
    }
}
