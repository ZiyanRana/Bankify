import nodemailer from 'nodemailer';
import { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, EMAIL_USER } from '../config/env.js';

// create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: EMAIL_USER,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
  },
});

// verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } 
  else {
    console.log('Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Bankify - Digital Banking" <${EMAIL_USER}>`,
            to, 
            subject,
            text,
            html
        });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } 
    catch (error) {
    console.error('Error sending email:', error);
    }
}

export const sendRegistrationEmail = async (userEmail, username) => {
    const subject = 'Welcome to Bankify - Digital Banking!';
    const text = `Hi ${username},\n\nThank you for registering with Bankify - Digital Banking! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Bankify Team`;
    const html = `<p>Hi ${username},</p><p>Thank you for registering with <strong>Bankify - Digital Banking</strong>! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br>The Bankify Team</p>`;
    
    await sendEmail(userEmail, subject, text, html);
}