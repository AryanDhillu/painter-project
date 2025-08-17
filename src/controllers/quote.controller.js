// Import the Quote model to interact with the database
const Quote = require('../models/quote.model');

// Controller function to create a new quote
exports.createQuote = async (req, res) => {
  // Destructure the appointment details from the request body
  const { appointmentDate, appointmentSlot } = req.body;

  // --- Conflict Check for Appointments ---
  // This block runs only if the user is trying to schedule an appointment.
  // We check for `undefined` because 0 is a valid and expected value for the slot index.
  if (appointmentDate && appointmentSlot !== undefined) {
    try {
      // Query the database to see if a quote already exists with the exact same date and slot index.
      const existingAppointment = await Quote.findOne({ 
        appointmentDate: new Date(appointmentDate), 
        appointmentSlot: appointmentSlot 
      });

      // If a document is found, it means the slot is taken.
      if (existingAppointment) {
        // Return a 409 Conflict error to the frontend.
        return res.status(409).json({ 
          message: 'This time slot is no longer available. Please select another.'
        });
      }
    } catch (error) {
        console.error("Error checking for appointment conflict:", error);
        return res.status(500).json({ message: 'Server error during conflict check' });
    }
  }

  // --- Create the New Quote ---
  try {
    // If the conflict check passes (or wasn't needed), create the new quote document.
    // Mongoose will automatically convert the "YYYY-MM-DD" string to a proper Date object.
    const newQuote = await Quote.create(req.body);
    
    // Send a 201 Created response back with the newly created quote data.
    res.status(201).json(newQuote);
  } catch (error) {
    // If there's an error (e.g., a required field is missing), send a 400 Bad Request error.
    res.status(400).json({ message: 'Error creating quote', error: error.message });
  }
};
