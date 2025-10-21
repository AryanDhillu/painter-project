const Quote = require('../models/quote.model');
const { sendAppointmentEmail } = require('../services/emailService');

// @desc    Get all quotes for the admin panel, with sorting
exports.getAdminQuotes = async (req, res) => {
  try {
    // Allows frontend to request sorting by 'createdAt' or 'updatedAt'
    const sortBy = req.query.sortBy === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const quotes = await Quote.find().sort({ [sortBy]: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a quote's general details (this SHOULD update the timestamp)
exports.updateQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Apply changes from the request body
    Object.assign(quote, req.body);
    // .save() correctly triggers the 'updatedAt' timestamp
    const updatedQuote = await quote.save(); 

    // Send an email if the admin changed the appointment
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

// @desc    Admin marks a newly created quote as "viewed" WITHOUT updating the timestamp
exports.markQuoteAsViewed = async (req, res) => {
  try {
    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      { viewedByAdmin: true },
      // Options: return the new doc, and disable timestamps for this operation
      { new: true, timestamps: false } 
    );
    
    if (!updatedQuote) {
        return res.status(404).json({ message: 'Quote not found.' });
    }
    
    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin marks a reschedule request as "seen" WITHOUT updating the timestamp
exports.markRescheduleAsSeen = async (req, res) => {
  try {
    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      { 'rescheduleRequest.seenByAdmin': true },
      // Options: return the new doc, and disable timestamps for this operation
      { new: true, timestamps: false }
    );

    if (!updatedQuote) {
      return res.status(400).json({ message: 'No pending reschedule request to mark as seen.' });
    }
    
    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin approves or denies a customer's reschedule request (this SHOULD update the timestamp)
exports.handleRescheduleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // Expects 'approve' or 'deny'

    const quote = await Quote.findById(id);
    if (!quote || !quote.rescheduleRequest || quote.rescheduleRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending reschedule request found.' });
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

      // Apply the requested changes
      quote.appointmentDate = quote.rescheduleRequest.requestedDate;
      quote.appointmentSlot = quote.rescheduleRequest.requestedSlot;
      quote.rescheduleRequest.status = 'approved';
      
      // Send a final confirmation email to the customer
      sendAppointmentEmail(quote._id, quote.email, quote.name, quote.appointmentDate, quote.appointmentSlot, 'reschedule_confirmed');
    } else if (action === 'deny') {
      quote.rescheduleRequest.status = 'denied';
      // Optionally, you could send a denial email here
    } else {
      return res.status(400).json({ message: 'Invalid action provided.' });
    }
    
    // .save() correctly triggers the 'updatedAt' timestamp for this significant action
    const updatedQuote = await quote.save(); 
    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

