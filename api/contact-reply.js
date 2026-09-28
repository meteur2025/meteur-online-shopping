const { Resend } = require("resend");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { email, firstName } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required."
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const customerName = firstName || "Customer";

    const { data, error } = await resend.emails.send({
      from: "Meteur Online Shopping <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message - Meteur Online Shopping",
      text: `Hello ${customerName},

Thank you for contacting Meteur Online Shopping. We have received your message and our support team will review it shortly.

Thank you,
Meteur Online Shopping Support`
    });

    if (error) {
      console.error("Resend error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to send the automatic reply."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Automatic reply sent successfully.",
      emailId: data?.id || null
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while sending the automatic reply."
    });
  }
};
