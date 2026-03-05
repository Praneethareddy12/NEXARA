import nodemailer from "nodemailer";

export const sendResetEmail = async (email, token) => {
  try {
    // 1. Create the transporter using Google's secure SMTP settings
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL for higher delivery success
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your 16-character App Password
      },
    });

    // 2. Define the reset link (points to your Vite frontend)
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    // 3. Setup email data
    const mailOptions = {
      from: `"Nexara Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Nexara - Password Reset Request",
      // Plain text version for email clients that block HTML
      text: `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`,
      // HTML version to match your Nexara UI
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
             <h1 style="color: #1a1f2c; margin: 0; font-size: 28px;">Nexara</h1>
          </div>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">Hello,</p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">We received a request to reset your password for your Nexara account. Click the button below to set a new password:</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" style="background-color: #111827; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Reset Password</a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">This link is valid for <strong>15 minutes</strong>. If you did not request this change, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2024 Nexara. All rights reserved.</p>
        </div>
      `,
    };

    // 4. Send the email and capture the response
    const info = await transporter.sendMail(mailOptions);
    
    console.log("------------------------------------------");
    console.log("✅ Email Sent Successfully!");
    console.log("Recipient:", email);
    console.log("Message ID:", info.messageId);
    console.log("------------------------------------------");

    return info;
  } catch (error) {
    console.error("------------------------------------------");
    console.error("❌ NodeMailer Error Details:");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    if (error.code === 'EAUTH') {
        console.error("HINT: This is an Authentication error. Check your App Password.");
    }
    console.log("------------------------------------------");
    throw new Error("Failed to send reset email.");
  }
};