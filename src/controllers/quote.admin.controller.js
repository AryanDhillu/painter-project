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
    // 1. Find the quote first to ensure we have the full document
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // 2. Update the fields from the request body
    Object.assign(quote, req.body);

    // 3. Save the updated quote
    const updatedQuote = await quote.save();

    // 4. Check if an appointment was part of this update to send an email
    const { appointmentDate, appointmentSlot } = req.body;
    if (appointmentDate && appointmentSlot !== undefined) {
      sendAppointmentEmail(
        updatedQuote._id,
        updatedQuote.email,
        updatedQuote.name,
        updatedQuote.appointmentDate,
        updatedQuote.appointmentSlot,
        'updated'
      );
    }

    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};




// @desc    Delete a quote only if its status is 'completed'
exports.deleteQuote = async (req, res) => {
  try {
    // 1. Find the quote by its ID to check its status
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // 2. Enforce the business rule: only delete 'completed' quotes
    if (quote.status !== 'completed') {
      return res.status(400).json({ 
        message: `Cannot delete. Quote status is '${quote.status}', not 'completed'.` 
      });
    }

    // 3. If the status is correct, proceed with deletion
    await Quote.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quote deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

