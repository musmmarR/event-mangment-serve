const nodemailer = require('nodemailer');
const config = require('../config/config');
const CryptoUtil = require('../config/crypto.util');

const transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
});

exports.sendVerificationEmail = async (email, token) => {
    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `
            <h1>Verify Your Email</h1>
            <p>Click the link below to verify your email:</p>
            <a href="${process.env.BASE_URL}/verify/${token}">Verify Email</a>
        `
    };

    return transporter.sendMail(mailOptions);
};

exports.sendEventInvitation = async (email, eventDetails, userId) => {
        // Encrypt both event ID and participant email
        const encryptedData = CryptoUtil.encryptData(JSON.stringify({
            eventId: eventDetails.id,
            email: email,
            userId: userId,
            timestamp: Date.now() // Add timestamp for additional security
        }));
        
        const eventPageLink = `${process.env.FRONTEND_URL}/events/join/${encryptedData}`;
        
    const mailOptions = {
        from: config.EMAIL_USER,
        to: email,
        subject: 'Event Invitation',
        html: `
            <h1>You've been invited to an event!</h1>
            <h2>${eventDetails.title}</h2>
            <p>${eventDetails.description}</p>
            <p>Date: ${eventDetails.date}</p>
            <p>Location: ${eventDetails.location}</p>
               <div style="margin: 30px 0;">
                <a href="${eventPageLink}" 
                   style="background-color: #4CAF50;
                          color: white;
                          padding: 14px 25px;
                          text-align: center;
                          text-decoration: none;
                          display: inline-block;
                          border-radius: 4px;
                          font-weight: bold;">
                    View Event Details
                </a>
            </div>
            <p style="color: #666; font-size: 12px;">
                This invitation link will expire in 24 hours.
            </p>
        `
    };

    return transporter.sendMail(mailOptions);
}; 