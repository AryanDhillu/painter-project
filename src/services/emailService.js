const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const crypto = require('crypto');
const Quote = require('../models/quote.model');

// --- THIS IS THE ROBUST NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
 },
});
// ------------------------------------------

const sendAppointmentEmail = async (quoteId, toEmail, name, date, slotIndex, type = 'new') => {
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const time = timeSlots[slotIndex];
  const formattedDate = format(new Date(date), 'EEEE, MMMM do, yyyy');

  let subject = '';
  let message = '';
  let rescheduleLink = '';

  if (type === 'updated') {
    subject = 'Your Appointment Has Been Updated';
    message = '<p>This is a notification that your appointment with The Painter Guys Pros has been updated. Your new appointment details are below.</p>';
    
    const token = crypto.randomBytes(20).toString('hex');
    await Quote.findByIdAndUpdate(quoteId, { 
      'rescheduleRequest.token': token,
      'rescheduleRequest.status': null, 
      'rescheduleRequest.requestedDate': null,
      'rescheduleRequest.requestedSlot': null,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    rescheduleLink = `
      <p style="margin-top: 20px; font-size: 14px; color: #555;">
        Need a different time? 
        <a href="${frontendUrl}/mailquoteupdate/${token}" target="_blank" style="color: #0A5B84; text-decoration: none; font-weight: bold;">
          Request a New Appointment Slot
        </a>
      </p>
    `;
  } else if (type === 'reschedule_confirmed') {
    // --- THIS IS THE NEW LOGIC ---
    subject = 'Your Rescheduled Appointment is Confirmed!';
    message = '<p>Great news! Your requested appointment time has been approved by our team. Your new confirmed appointment details are below.</p>';
    // We don't send a reschedule link in the final confirmation.
  } else { // This is the 'new' case
    subject = 'Your Appointment Confirmation';
    message = '<p>This is a confirmation that your appointment has been scheduled with The Painter Guys Pros.</p>';
  }

  const mailOptions = {
    from: `"The Painter Guys Pros" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hi ${name},</p>
        ${message} 
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>We look forward to seeing you!</p>
        ${rescheduleLink}
        <p>Best regards,<br/>The Painter Guys Pros Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`'${type}' confirmation email sent successfully to:`, toEmail);
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
  }
};

module.exports = { sendAppointmentEmail };

