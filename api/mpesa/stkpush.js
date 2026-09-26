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

        if (!consumerKey || !consumerSecret) {
            return res.status(500).json({
                success: false,
                message: "M-Pesa credentials are not configured."
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
            return res.status(500).json({
                success: false,
                message: "Unable to authenticate with M-Pesa Sandbox.",
                details: tokenData
            });
        }

        return res.status(200).json({
            success: true,
            message: "M-Pesa Sandbox connection is ready.",
            orderNumber,
            amount,
            phone,
            accessTokenReceived: true
        });

    } catch (error) {
        console.error("M-Pesa API error:", error);

        return res.status(500).json({
            success: false,
            message: "M-Pesa server error."
        });
    }
}
