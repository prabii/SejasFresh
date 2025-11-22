// For development, we'll use console.log
// In production, integrate with nodemailer or similar service

const sendEmail = async (to, subject, text, html) => {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Email to ${to}:`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text || html}`);
      return { success: true, message: 'Email sent (development mode)' };
    }

    // Production: Use nodemailer
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   }
    // });
    
    // const info = await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: to,
    //   subject: subject,
    //   text: text,
    //   html: html
    // });
    
    // return { success: true, messageId: info.messageId };
    
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;

