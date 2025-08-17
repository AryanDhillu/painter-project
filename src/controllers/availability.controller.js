const Quote = require('../models/quote.model');
const { addDays, format, startOfToday } = require('date-fns');

// Controller function to get all BOOKED appointment slots
exports.getAvailability = async (req, res) => {
  try {
    // --- Date Setup (Timezone Independent) ---
    // 1. Get the start of today in UTC.
    const today = startOfToday();

    // 2. Calculate the end of our date range (30 days from today).
    const oneMonthFromNow = addDays(today, 30);

    // --- Fetching Booked Slots ---
    // 3. Query the database for all existing appointments within the 30-day window.
    const existingAppointments = await Quote.find({
      appointmentDate: {
        $gte: today,
        $lt: oneMonthFromNow,
      },
    }).select('appointmentDate appointmentSlot').sort({ appointmentDate: 1 });

    // --- Grouping Booked Slots by Date ---
    // 4. This object will hold the final response.
    const bookedSlotsByDate = {};

    // 5. Loop through each appointment we found in the database.
    for (const appt of existingAppointments) {
      // Format the date from the DB to a 'yyyy-MM-dd' string.
      const dateStr = format(new Date(appt.appointmentDate), 'yyyy-MM-dd');
      
      // 6. If we haven't seen this date yet, create an empty array for it.
      if (!bookedSlotsByDate[dateStr]) {
        bookedSlotsByDate[dateStr] = [];
      }
      
      // 7. Add the booked time slot index to the array for that date.
      bookedSlotsByDate[dateStr].push(appt.appointmentSlot);
    }

    // 8. Send the final object of booked slots.
    res.json(bookedSlotsByDate);
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: 'Error fetching booked slots' });
  }
};
