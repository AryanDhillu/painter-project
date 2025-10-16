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

// @desc    Update a quote's general details
exports.updateQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    Object.assign(quote, req.body);
    const updatedQuote = await quote.save();

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
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }
    if (quote.status !== 'completed') {
      return res.status(400).json({ 
        message: `Cannot delete. Quote status is '${quote.status}', not 'completed'.` 
      });
    }
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quote deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin marks a newly created quote as "viewed"
exports.markQuoteAsViewed = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found.' });
    }
    
    quote.viewedByAdmin = true;
    const updatedQuote = await quote.save();
    
    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin marks a reschedule request as "seen"
exports.markRescheduleAsSeen = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote || !quote.rescheduleRequest || quote.rescheduleRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending reschedule request to mark as seen.' });
    }
    
    quote.rescheduleRequest.seenByAdmin = true;
    const updatedQuote = await quote.save();
    
    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin approves or denies a customer's reschedule request
exports.handleRescheduleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // Expects 'approve' or 'deny'

    const quote = await Quote.findById(id);
    if (!quote || !quote.rescheduleRequest || quote.rescheduleRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending reschedule request found for this quote.' });
    }

    if (action === 'approve') {
      const existing = await Quote.findOne({
        appointmentDate: quote.rescheduleRequest.requestedDate,
        appointmentSlot: quote.rescheduleRequest.requestedSlot,
        _id: { $ne: id } 
      });

      if (existing) {
        return res.status(409).json({ message: 'Conflict: The requested slot is already booked.' });
      }

      quote.appointmentDate = quote.rescheduleRequest.requestedDate;
      quote.appointmentSlot = quote.rescheduleRequest.requestedSlot;
      quote.rescheduleRequest.status = 'approved';
      
      sendAppointmentEmail(quote._id, quote.email, quote.name, quote.appointmentDate, quote.appointmentSlot, 'reschedule_confirmed');
    } else if (action === 'deny') {
      quote.rescheduleRequest.status = 'denied';
    } else {
      return res.status(400).json({ message: 'Invalid action provided.' });
    }
    
    const updatedQuote = await quote.save();
    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

