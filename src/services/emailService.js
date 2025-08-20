const nodemailer = require('nodemailer');
const { format } = require('date-fns');

// --- THIS IS THE UPDATED CONFIGURATION ---
// It's more explicit and often works better in serverless environments.
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

// The updated function now accepts a 'type' parameter
const sendAppointmentEmail = async (toEmail, name, date, slotIndex, type = 'new') => {
  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const time = timeSlots[slotIndex];
  const formattedDate = format(new Date(date), 'EEEE, MMMM do, yyyy');

  let subject = '';
  let message = '';

  if (type === 'updated') {
    subject = 'Your Appointment Has Been Updated';
    message = '<p>This is a notification that your appointment with The Painter Guys Pros has been updated. Your new appointment details are below.</p>';
  } else { // Default to 'new'
    subject = 'Your Appointment Confirmation';
    message = '<p>This is a confirmation that your appointment has been scheduled with The Painter Guys Pros.</p>';
  }

  const mailOptions = {
    from: `"The Painter Guys Pros" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: `
      <p>Hi ${name},</p>
      ${message} 
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>We look forward to seeing you!</p>
      <p>Best regards,<br/>The Painter Guys Pros Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`'${type}' confirmation email sent successfully to:`, toEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendAppointmentEmail };
