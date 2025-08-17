// src/controllers/quote.controller.js
const Quote = require('../models/quote.model');

exports.createQuote = async (req, res) => {
  const { appointmentDate, appointmentSlot } = req.body;

  // --- ADD THIS VALIDATION BLOCK ---
  if (appointmentDate && appointmentSlot) {
    const existingAppointment = await Quote.findOne({ 
      appointmentDate: new Date(appointmentDate), 
      appointmentSlot 
    });

    if (existingAppointment) {
      return res.status(409).json({ // 409 Conflict
        message: 'This time slot is no longer available. Please select another.'
      });
    }
  }
  // ---------------------------------

  try {
    const newQuote = await Quote.create(req.body);
    res.status(201).json(newQuote);
  } catch (error) {
    res.status(400).json({ message: 'Error creating quote', error: error.message });
  }
};