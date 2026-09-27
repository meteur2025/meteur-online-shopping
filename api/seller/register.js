export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const {
            userId,
            storeName,
            ownerName,
            email,
            phone,
            county,
            town,
            address,
            description
        } = req.body || {};

        if (
            !userId ||
            !storeName ||
            !ownerName ||
            !email ||
            !phone ||
            !county ||
            !town ||
            !address ||
            !description
        ) {
            return res.status(400).json({
                error: "All seller application fields are required."
            });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error(
                "Supabase server environment variables are missing."
            );

            return res.status(500).json({
                error: "Server configuration error."
            });
        }

        const headers = {
            "Content-Type": "application/json",
            "apikey": serviceRoleKey,
            "Authorization": `Bearer ${serviceRoleKey}`
        };

        /*
         * Verify that the supplied user exists and that
         * the email belongs to that Supabase account.
         */
        const userResponse = await fetch(
            `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
            {
                method: "GET",
                headers
            }
        );

        if (!userResponse.ok) {
            console.error(
                "Unable to verify Supabase user:",
                await userResponse.text()
            );

            return res.status(400).json({
                error: "Unable to verify the seller account."
            });
        }

        const user = await userResponse.json();

        if (
            !user ||
            !user.id ||
            user.id !== userId ||
            String(user.email || "").toLowerCase() !==
                String(email).trim().toLowerCase()
        ) {
            return res.status(403).json({
                error: "Seller account verification failed."
            });
        }

        /*
         * Prevent duplicate seller applications.
         */
        const existingResponse = await fetch(
            `${supabaseUrl}/rest/v1/sellers?user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`,
            {
                method: "GET",
                headers
            }
        );

        if (!existingResponse.ok) {
            console.error(
                "Unable to check existing seller:",
                await existingResponse.text()
            );

            return res.status(500).json({
                error: "Unable to check seller application."
            });
        }

        const existingSellers = await existingResponse.json();

        if (
            Array.isArray(existingSellers) &&
            existingSellers.length > 0
        ) {
            return res.status(409).json({
                error:
                    "A seller application already exists for this account."
            });
        }

        /*
         * Create the seller application using the server-side
         * service-role key. The secret key never reaches the browser.
         */
        const sellerResponse = await fetch(
            `${supabaseUrl}/rest/v1/sellers`,
            {
                method: "POST",
                headers: {
                    ...headers,
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    user_id: userId,
                    store_name: String(storeName).trim(),
                    owner_name: String(ownerName).trim(),
                    phone: String(phone).trim(),
                    email: String(email).trim(),
                    county: String(county).trim(),
                    town: String(town).trim(),
                    address: String(address).trim(),
                    description: String(description).trim(),
                    status: "Pending"
                })
            }
        );

        const sellerResult = await sellerResponse.json();

        if (!sellerResponse.ok) {
            console.error(
                "Seller application database error:",
                sellerResult
            );

            return res.status(500).json({
                error:
                    sellerResult?.message ||
                    sellerResult?.hint ||
                    "Unable to create seller application."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Seller application submitted successfully. Please verify your email and wait for your seller application to be reviewed.",
            seller: sellerResult?.[0] || null
        });

    } catch (error) {
        console.error(
            "Seller registration server error:",
            error
        );

        return res.status(500).json({
            error:
                error.message ||
                "Unable to submit seller application."
        });
    }
}
