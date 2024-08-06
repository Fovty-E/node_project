const nodemailer = require('nodemailer');
require('dotenv').config();


// Create a transporter
const transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.eu',
    port: '465',
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: `Chat App`,
        to,
        subject,
        text,
        html
    };

    try {
        await transporter.sendMail(mailOptions)
        console.log('Email sent')
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = sendEmail