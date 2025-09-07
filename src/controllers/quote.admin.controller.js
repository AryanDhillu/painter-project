const Quote = require('../models/quote.model');
const { sendAppointmentEmail } = require('../services/emailService');
const { deleteImageFromFirebase } = require('../services/firebaseService');

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

// @desc    Delete a quote and its associated images from Firebase
exports.deleteQuote = async (req, res) => {
  try {
    // 1. Find the quote in MongoDB to get the image URLs
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // 2. If there are images, delete them from Firebase Storage
    if (quote.images && quote.images.length > 0) {
      const deletePromises = quote.images.map(url => deleteImageFromFirebase(url));
      await Promise.all(deletePromises);
    }

    // 3. After handling images, delete the quote from MongoDB
    await Quote.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quote and associated images deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

