const Quote = require('../models/quote.model');
const { sendAppointmentEmail } = require('../services/emailService');

exports.createQuote = async (req, res) => {
  // ... your existing conflict check logic ...
  const { appointmentDate, appointmentSlot } = req.body;
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
    if (!quoteData.appointmentDate) {
      delete quoteData.appointmentDate;
      delete quoteData.appointmentSlot;
    }
    const newQuote = await Quote.create(quoteData);

    // If the new quote has an appointment, send the email
    if (newQuote.appointmentDate && newQuote.appointmentSlot !== undefined) {
      sendAppointmentEmail(
        newQuote.email,
        newQuote.name,
        newQuote.appointmentDate,
        newQuote.appointmentSlot,
        'new' // <-- Specify the type
      );
    }

    res.status(201).json(newQuote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating quote', error: error.message });
  }
};
