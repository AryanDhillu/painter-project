const Quote = require('../models/quote.model');
const { sendAppointmentEmail } = require('../services/emailService');

// @desc    Get all quotes for the admin panel
exports.getAdminQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a quote
exports.updateQuote = async (req, res) => {
  try {
    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedQuote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // --- THIS IS THE FIX ---
    // Check if the incoming request body from the admin included appointment details.
    // If it did, it means the admin intended to set or change the appointment.
    if (req.body.appointmentDate || req.body.appointmentSlot !== undefined) {
      // Ensure we have the full, updated appointment details before sending.
      if (updatedQuote.appointmentDate && updatedQuote.appointmentSlot !== undefined) {
        sendAppointmentEmail(
          updatedQuote.email,
          updatedQuote.name,
          updatedQuote.appointmentDate,
          updatedQuote.appointmentSlot,
          'updated' // Specify the type as 'updated'
        );
      }
    }
    // ----------------------

    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
