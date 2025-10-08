const Quote = require('../models/quote.model');
const { sendAppointmentEmail } = require('../services/emailService');

// @desc    Customer creates a new quote
exports.createQuote = async (req, res) => {
  const { appointmentDate, appointmentSlot } = req.body;

  // Conflict check for new appointments
  if (appointmentDate && appointmentSlot !== undefined) {
    try {
      const existingAppointment = await Quote.findOne({
        appointmentDate: new Date(appointmentDate),
        appointmentSlot: appointmentSlot
      });

      if (existingAppointment) {
        return res.status(409).json({
          message: 'This time slot is no longer available. Please select another.'
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Server error during conflict check' });
    }
  }

  try {
    const quoteData = { ...req.body };
    // Ensure appointment fields are not saved if they are empty, preventing errors
    if (!quoteData.appointmentDate) {
      delete quoteData.appointmentDate;
      delete quoteData.appointmentSlot;
    }

    const newQuote = await Quote.create(quoteData);

    // If the new quote has an appointment, send the confirmation email
    if (newQuote.appointmentDate && newQuote.appointmentSlot !== undefined) {
      sendAppointmentEmail(
        newQuote._id, // Pass the new quote's ID
        newQuote.email,
        newQuote.name,
        newQuote.appointmentDate,
        newQuote.appointmentSlot,
        'new'
      );
    }

    res.status(201).json(newQuote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating quote', error: error.message });
  }
};

// @desc    Customer submits a reschedule request for admin approval
exports.requestReschedule = async (req, res) => {
  try {
    const { token } = req.params;
    const { requestedDate, requestedSlot } = req.body;

    // 1. Find the quote by the secure token
    const quote = await Quote.findOne({ 'rescheduleRequest.token': token });

    if (!quote) {
      return res.status(404).json({ message: 'Invalid or expired reschedule link.' });
    }

    // 2. Update the quote with the requested details and mark as "unseen" for the admin
    quote.rescheduleRequest.requestedDate = new Date(requestedDate);
    quote.rescheduleRequest.requestedSlot = requestedSlot;
    quote.rescheduleRequest.status = 'pending';
    quote.rescheduleRequest.seenByAdmin = false; // Mark as UNSEEN
    quote.rescheduleRequest.token = null; // Invalidate the link so it can't be used again

    await quote.save();

    // Optionally, you could send an email to the admin here to notify them of the request.

    res.json({ message: 'Your reschedule request has been submitted. The admin will review it shortly.' });
  } catch (err) {
    console.error('Reschedule Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

