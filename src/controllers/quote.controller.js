const Quote = require('../models/quote.model');
const { sendAppointmentEmail } = require('../services/emailService');

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

    // If the new quote has an appointment, send the email
    if (newQuote.appointmentDate && newQuote.appointmentSlot !== undefined) {
      sendAppointmentEmail(
        newQuote._id, // <-- Pass the new quote's ID
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

// @desc    Customer submits a reschedule request, which now directly updates the appointment
exports.requestReschedule = async (req, res) => {
  try {
    const { token } = req.params;
    const { requestedDate, requestedSlot } = req.body;

    // 1. Find the quote by the secure token
    const quote = await Quote.findOne({ 'rescheduleRequest.token': token });

    if (!quote) {
      return res.status(404).json({ message: 'Invalid or expired reschedule link.' });
    }

    // 2. Perform a conflict check for the new requested time
    const existingAppointment = await Quote.findOne({
      appointmentDate: new Date(requestedDate),
      appointmentSlot: requestedSlot,
      _id: { $ne: quote._id } // Make sure we don't conflict with the quote itself
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: 'Sorry, that new time slot was just taken. Please try another.'
      });
    }

    // 3. If the slot is free, directly update the main appointment details
    quote.appointmentDate = new Date(requestedDate);
    quote.appointmentSlot = requestedSlot;

    // 4. Invalidate the token and mark as handled
    quote.rescheduleRequest.token = null;
    quote.rescheduleRequest.status = 'approved'; 

    await quote.save();

    // 5. Optionally, send a final confirmation email for the successful reschedule
    // This will use the 'updated' template but won't generate a new reschedule link
    sendAppointmentEmail(
      quote._id,
      quote.email,
      quote.name,
      quote.appointmentDate,
      quote.appointmentSlot,
      'updated' 
    );

    res.json({ message: 'Your appointment has been successfully rescheduled.' });

  } catch (err) {
    console.error('Reschedule Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

