// src/controllers/availability.controller.js
const Quote = require('../models/quote.model');

exports.getAvailability = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);

    // 1. Find all existing appointments in the next 30 days
    const existingAppointments = await Quote.find({
      appointmentDate: {
        $gte: today,
        $lt: oneMonthFromNow,
      },
    }).select('appointmentDate appointmentSlot');

    const bookedSlots = new Set(
      existingAppointments.map(appt => {
        const date = new Date(appt.appointmentDate).toISOString().split('T')[0];
        return `${date}_${appt.appointmentSlot}`;
      })
    );

    // 2. Generate all possible slots for the next 30 days
    const availableSlots = {};
    const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

    for (let d = new Date(today); d < oneMonthFromNow; d.setDate(d.getDate() + 1)) {
      const dateStr = new Date(d).toISOString().split('T')[0];
      availableSlots[dateStr] = [];

      for (const slot of timeSlots) {
        // 3. If a slot is NOT in the booked set, it's available
        if (!bookedSlots.has(`${dateStr}_${slot}`)) {
          availableSlots[dateStr].push(slot);
        }
      }
    }

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability' });
  }
};