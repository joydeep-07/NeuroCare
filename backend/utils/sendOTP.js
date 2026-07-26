const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  console.log(`========================================`);
  console.log(`[NeuroCare OTP Service] EMAIL: ${email}`);
  console.log(`[NeuroCare OTP Service] VERIFICATION CODE: ${otp}`);
  console.log(`========================================`);

  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    console.log("[NeuroCare OTP Service] SMTP credentials missing in .env - using console fallback code");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"NeuroCare Platform" <${process.env.EMAIL}>`,
      to: email,
      subject: `🔑 ${otp} is your NeuroCare Verification Code`,
      html: `
        <div style="max-width:600px;margin:auto;padding:30px;font-family:Inter,Arial,sans-serif;background:#0d1117;color:#f0f6fc;border-radius:16px;border:1px solid #30363d">
          <div style="text-align:center;">
            <h1 style="margin:0;color:#38bdf8;font-size:28px;letter-spacing:1px;">NeuroCare</h1>
            <p style="color:#94a3b8;margin-top:6px;font-size:14px;">Next-Gen AI Healthcare Platform</p>
          </div>
          <div style="margin-top:30px;">
            <p style="font-size:16px;color:#cbd5e1;">Hello,</p>
            <p style="font-size:15px;color:#cbd5e1;">Your single-use verification code to sign in to <strong>NeuroCare</strong> is:</p>
            <div style="margin:30px auto;width:240px;text-align:center;background:linear-gradient(135deg, #0284c7 0%, #0d9488 100%);color:white;font-size:36px;font-weight:bold;padding:18px;border-radius:12px;letter-spacing:10px;box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.4);">
              ${otp}
            </div>
            <p style="color:#94a3b8;font-size:14px;text-align:center;">This OTP will expire in <strong>5 minutes</strong>.</p>
            <hr style="margin:30px 0;border:none;border-top:1px solid #30363d;" />
            <p style="font-size:12px;color:#64748b;text-align:center;">© ${new Date().getFullYear()} NeuroCare Health Systems. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("[NeuroCare OTP Service Error]:", error.message);
    // Silent fail over to console OTP for seamless dev testing
  }
};

module.exports = sendOTP;
