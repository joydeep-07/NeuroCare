const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"NeuroCare" <${process.env.EMAIL}>`,
    to: email,
    subject: "Your NeuroCare Verification Code",

    html: `
      <div style="max-width:600px;margin:auto;padding:30px;font-family:Arial,sans-serif;background:#f8f9fa;border-radius:12px;border:1px solid #e5e5e5">

        <div style="text-align:center;">
          <h1 style="margin:0;color:#1a73e8;">
            NeuroCare
          </h1>

          <p style="color:#666;margin-top:8px;">
            Secure Email Verification
          </p>
        </div>

        <div style="margin-top:35px;">
          <p>Hello,</p>

          <p>
            Use the verification code below to sign in to your
            <strong>NeuroCare</strong> account.
          </p>

          <div
            style="
              margin:35px auto;
              width:220px;
              text-align:center;
              background:#1a73e8;
              color:white;
              font-size:36px;
              font-weight:bold;
              padding:18px;
              border-radius:12px;
              letter-spacing:12px;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP will expire in
            <strong>5 minutes</strong>.
          </p>

          <p>
            If you didn't request this verification,
            you can safely ignore this email.
          </p>

          <hr style="margin:35px 0;border:none;border-top:1px solid #ddd;" />

          <p style="font-size:13px;color:#777;text-align:center;">
            © ${new Date().getFullYear()} NeuroCare • Doctors Appointment Platform
          </p>
        </div>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;
