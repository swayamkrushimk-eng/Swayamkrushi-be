import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT == '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail() {
  try {
    console.log(`Sending test email from ${process.env.SMTP_USER} to abbupasha61@gmail.com...`);
    const info = await transporter.sendMail({
      from: `"Swayamkrushi NGO" <${process.env.SMTP_USER}>`,
      to: 'abbupasha61@gmail.com',
      subject: 'Test Email - Swayamkrushi NGO System Verification',
      text: 'Hello,\n\nThis is a test email sent from Swayamkrushi NGO to confirm that the SMTP email service is working properly.\n\nBest regards,\nSwayamkrushi Team',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2e7d32; margin-top: 0;">Swayamkrushi NGO - SMTP Test Email</h2>
          <p>Hello,</p>
          <p>This is a verification test email confirming that your email service configuration on the <strong>Swayamkrushi</strong> platform is working properly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 13px; color: #666;">
            <strong>Organization:</strong> Swayamkrushi NGO<br/>
            <strong>Address:</strong> Survey No.687, 688, Jawaharnagar Village, Chennapur, Shamirpet Mandal, Secunderabad, Telangana.<br/>
            <strong>Phone:</strong> +91 9704245454 · +91 9963766729<br/>
            <strong>Email:</strong> swayamkrushimk@gmail.com
          </p>
        </div>
      `
    });
    console.log('Test email sent successfully! Message ID:', info.messageId);
    process.exit(0);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

sendMail();
