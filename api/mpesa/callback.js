export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(200).json({
            success: true,
            message: "M-Pesa callback endpoint is ready."
        });
    }

    try {
        const callbackData = req.body || {};

        console.log(
            "M-Pesa callback received:",
            JSON.stringify(callbackData)
        );

        return res.status(200).json({
            ResultCode: 0,
            ResultDesc: "Callback received successfully"
        });

    } catch (error) {
        console.error("M-Pesa callback error:", error);

        return res.status(500).json({
            ResultCode: 1,
            ResultDesc: "Callback processing failed"
        });
    }
}
